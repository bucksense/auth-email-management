import dayjs from "dayjs";

import Services from "../models/services";
import Users from "../models/users"
import dbConnect from "./mongoose-client"
import { apiFetch } from "./api-fetch";

const SERVICE_KEY = process.env.OFFERMETRIX_SERVICE_KEY


export async function refreshToken ({ user }) {
      

    const { service, account } = await getService({email: user.email})
    const { scope, tenant } = await getConnector()
    
    const url = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`
    
    const body = new URLSearchParams({
        scope,
        grant_type:    'refresh_token',
        refresh_token: account.oauthData.refresh_token,
        client_id:     process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
        client_secret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
    })

    return await apiFetch(url, {
        method: 'POST',
        body:   body.toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
        .then( async tokens => {
           
            account.oauthData = tokens
            account.enabled = true
            account.modifiedAt = dayjs().toISOString()
            account.expiresAt = dayjs().add(tokens.expires_in,'s').toISOString()

            return service.save()
        })
        .catch( err => {            
            throw { 
                message: (err.data?.error || err.message) + " " + err.data?.error_description
            }
        })
        

}

async function getService({email}) {

    await dbConnect()

    const service = await Services.findOne({ key: SERVICE_KEY })
    if ( !service ) {
        throw { message: "Service not found", httpCode: 404}
    }

    if ( email ) {
        const baseConfig = service.params[0]
        const account = baseConfig.accounts.find( a => a.name?.email == email )
        if (!account) throw { message: "User not found", httpCode: 404 }
        return { service, account }
    }

    return { service }
    
}

export async function getConnector() {

    await dbConnect()
    
    const aggregate = [
        {
            $match: {
                key: Number(SERVICE_KEY)
            }
        },
        {
            $lookup: {
                from: "connectors",
                localField: "connectors",
                foreignField: "_id",
                as: "_connectors"
            }
        },
        {
            $lookup: {
                from: "connector_types",
                localField: "_connectors.connectorTypeId",
                foreignField: "typeId",
                as: "_connector_types"
            }
        },
        {
            $addFields: {
                merged: {
                    $map: {
                        input: "$_connectors",
                        as: "connnector",
                        in: {
                            _id: "$$connnector._id",
                            key: "$$connnector.key",
                            name: "$$connnector.name",
                            connectorTypeId:  "$$connnector.connectorTypeId",
                            oauthData: "$$connnector.oauthData",
                            connectorParams: "$$connnector.params",
                            // scopes: "$$connector.scopes",
                            connType: {
                                $first: {
                                    $filter: {
                                    input: "$_connector_types",
                                    as: "type",
                                        cond: {
                                            $eq: [
                                            "$$connnector.connectorTypeId",
                                            "$$type.typeId"
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        {
            $unwind: {
                path: "$merged"
            }
        },
        {
            $replaceRoot: {
                newRoot: "$merged"
            }
        },
        {
            $project: {
                name: 1,
                connectorTypeId: 1,
                key: 1,
                scopes: "$connType.scopes",
                connectorParams: 1,
                params: 1,
                connType: {
                    typeName: "$connType.typeName",
                    typeId: "$connType.typeId",
                    family: "$connType.family",
                    icon: "$connType.icon"
                }
            }
        }
    ]

    const [ connector ] = await Services.aggregate(aggregate)
  
    return {
        scope: connector?.scopes.join(" "),
        tenant: connector?.connectorParams?.find( p => p.id == 'tenant' )?.value
    }

}


export async function updateService({ tokens, user }) {

    const { service } = await getService({})

    const baseConfig = service.params[0]
    const account = baseConfig.accounts.find( a => a.name?.email == user.mail )
    const offermetrixUser = await Users.findOne({ email: user.mail }).lean()

    if ( account ) {

        account.oauthData = tokens
        account.enabled = true
        account.modifiedAt = dayjs().toISOString()
        account.expiresAt = dayjs().add(tokens.expires_in,'s').toISOString()

    } else {

        baseConfig.accounts.push({
            name: {
                displayName: user.displayName,
                email: user.mail ?? user.userPrincipalName,
                sub: user.id
            },
            oauthData: tokens,
            provider: 'ms',
            createdAt: dayjs().toISOString(),
            modifiedAt: dayjs().toISOString(),
            expiresAt: dayjs().add(tokens.expires_in,'s').toISOString(),
            enabled: true,
            userId: offermetrixUser?._id,
            permissions: [],
            status: {}
        })
    }

    return await service.save()

}


export async function getUserData({user}) {

    const { account } = await getService(user)

    return {
        enabled: account?.enabled,
        createdAt: account?.createdAt,
        modifiedAt: account?.modifiedAt,
        expiresAt: account?.expiresAt,
        expired: dayjs().isBefore(account.expiresAt),
        accessToken: !!account?.oauthData?.access_token,
        config: {}
    }

}

export async function updatePermissions({user, permissions}) {

    const { service, account } = await getService(user)

    await checkUserEmail(account, permissions)

    account.permissions = permissions.map( p => ({
        email: p.email,
        readEmail: !!p.readEmail || false,
        writeEmail: !!p.writeEmail || false,
        readCalendar: !!p.readCalendar || false,
        writeCalendar: !!p.writeCalendar || false
    }))

    return service.save()

}

export async function getPermissions({user}) {

    const { account } = await getService(user)
    return account?.permissions || []

}

export async function revokeAccess({user}) {

    const { service, account } = await getService(user)

    account.oauthData = {}
    account.enabled = false
    account.modifiedAt = dayjs().toISOString()
    account.expiresAt = dayjs().toISOString()

    return await service.save()
}


export async function checkUserEmail({oauthData}, permissions) {
   
    // https://graph.microsoft.com/v1.0/users/rm_test@crystalcruises.com/messages?$top=1

    for ( let permission of permissions ) {
        const url = `https://graph.microsoft.com/v1.0/users/${permission.email}/messages?$top=1`

        await apiFetch(url, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${oauthData.access_token}`
            }
        })
        .catch(err => {
            throw {
                message: err?.data?.error?.message || `Error adding email "${permission.email}": ${err.message}`
            }
        })
    }

}
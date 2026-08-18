import { auth } from "../../libs/auth"
import { getPermissions, updatePermissions } from "../../libs/service"

export async function GET(request) {
    const session = await auth()
    if ( !session )
        return Response.json({ error: "Unauthorized" }, { status: 401 })

    return getPermissions({ user: session.user })
        .then( res => Response.json({ status: 'ok', data: res }) )
        .catch( err => Response.json({ status: 'err', message: err.message}, {status: err.statusCode || 500 }) )
}



export async function POST(request) {

    const session = await auth()
    if ( !session )
        return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { company, permissions } = await request.json()

    return await updatePermissions({ user: session.user, company, permissions })
        .then( () => Response.json({ status: 'ok' }) )
        .catch( err => Response.json({ status: 'err', message: err.message},{status: err.statusCode || 500 }) )

}
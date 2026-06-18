
import { auth } from "../../../libs/auth"
import { revokeAccess } from "../../../libs/service"

export async function POST(request) {

    const session = await auth()
    if ( !session )
        return Response.json({ error: "Unauthorized" }, { status: 401 })

    return revokeAccess({ user: session.user })
        .then( () => Response.json({ status: 'ok' }) )
        .catch( err => Response.json({ status: 'err', message: err.message },{ status: err.statusCode || 500 }) )

    
}
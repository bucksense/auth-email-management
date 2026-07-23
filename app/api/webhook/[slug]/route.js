import { NextResponse } from "next/server"
import { apiFetch } from "../../../libs/api-fetch"

export async function handler(request, { params }) {

    const searchParams = request.nextUrl.searchParams
    const validationToken = searchParams.get('validationToken')
    
    const { slug } = await params
    console.log('HOOK', slug, validationToken)

    if ( validationToken ) {
        return new NextResponse(validationToken,{
            status: 200,
            headers: { "Content-Type": 'text/plain' }
        })
    }

    console.log("SLUG", slug)
    console.log("📬 !!! EMAIL INTERCETTATA !!!");
    const body = await request.json()
    console.log(JSON.stringify(body, null, 2));

    // readEmail(body.value)

    // Rispondi subito 202 ad Azure per dirgli che è tutto ok
    // request.status(202).send();
    return NextResponse.json({},{status: 200})

}

/*
{
  "value": [
    {
      "subscriptionId": "798eca4e-1e58-4191-8a1f-37f39e0f48a2",
      "subscriptionExpirationDateTime": "2026-06-19T14:13:28.9250659+00:00",
      "changeType": "updated",
      "resource": "Users/65a6985a-5b02-4a57-9289-10a29b13ed43/Messages/AAMkAGE1ZjQxZmE2LWM2ODAtNDRhMy1hZDI1LTY3OTM0MzJjMjAwMwBGAAAAAADXRJ9piVssSKKDeeigAvmvBwCN08ZUqtF2Q6ek2yVlpBjfAAAAAAEMAACN08ZUqtF2Q6ek2yVlpBjfAAADiSxTAAA=",
      "resourceData": {
        "@odata.type": "#Microsoft.Graph.Message",
        "@odata.id": "Users/65a6985a-5b02-4a57-9289-10a29b13ed43/Messages/AAMkAGE1ZjQxZmE2LWM2ODAtNDRhMy1hZDI1LTY3OTM0MzJjMjAwMwBGAAAAAADXRJ9piVssSKKDeeigAvmvBwCN08ZUqtF2Q6ek2yVlpBjfAAAAAAEMAACN08ZUqtF2Q6ek2yVlpBjfAAADiSxTAAA=",
        "@odata.etag": "W/\"CQAAABYAAACN08ZUqtF2Q6ek2yVlpBjfAAADiFdQ\"",
        "id": "AAMkAGE1ZjQxZmE2LWM2ODAtNDRhMy1hZDI1LTY3OTM0MzJjMjAwMwBGAAAAAADXRJ9piVssSKKDeeigAvmvBwCN08ZUqtF2Q6ek2yVlpBjfAAAAAAEMAACN08ZUqtF2Q6ek2yVlpBjfAAADiSxTAAA="
      },
      "clientState": null,
      "tenantId": "62e53dcd-9b81-463f-9fc2-e36930bbbd84"
    }
  ]
}
  */

// function readEmail({ resourceData }) {
//     const emailId = resourceData.id
//     const url = `https://microsoft.com${emailId}`
//     apiFetch( url, {} )
// }

export { 
    handler as GET, 
    handler as POST
}
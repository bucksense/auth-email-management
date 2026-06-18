import { NextResponse } from 'next/server'
import { encode } from 'next-auth/jwt'

import dbConnect from '../../../../libs/mongoose-client'
import { getConnector, updateService } from '../../../../libs/service'


export async function GET(request) {

  await dbConnect()

  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const descr = searchParams.get('error_description')

  const signinUrl = (msg, descr) => new URL(`/auth/signin?error=${encodeURIComponent(msg)}&descr=${encodeURIComponent(descr)}`, request.url)

  if (error) {
    return NextResponse.redirect(signinUrl(error, descr))
  }

  const storedState  = request.cookies.get('ms_oauth_state')?.value
  const callbackUrl  = request.cookies.get('ms_oauth_callback')?.value ?? '/'

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(signinUrl('InvalidState'))
  }

  const { tenant } = await getConnector()

  // const TOKEN_ENDPOINT = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`

  // Scambio del codice con i token
  const tokenRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      client_secret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      code,
      redirect_uri:  `${process.env.NEXTAUTH_URL}/api/oauth2/callback/ms`,
      grant_type:    'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(signinUrl('TokenExchangeFailed'))
  }

  const tokens = await tokenRes.json()

  // Profilo utente da Microsoft Graph
  const userRes = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })

  if (!userRes.ok) {
    return NextResponse.redirect(signinUrl('UserProfileFailed'))
  }

  const user = await userRes.json()
  await updateService({ tokens, user })

  // JWT compatibile con next-auth — letto correttamente da getServerSession/auth()
  const maxAge = 60 * 60 * 24 * 365
  const sessionToken = await encode({
    token: {
      name:    user.displayName,
      email:   user.mail ?? user.userPrincipalName,
      picture: null,
      sub:     user.id,
    },
    secret: process.env.NEXTAUTH_SECRET,
    maxAge,
  })

  // next-auth usa __Secure- prefix solo su HTTPS
  const isSecure  = process.env.NEXTAUTH_URL?.startsWith('https://')
  const cookieName = isSecure
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token'

  const response = NextResponse.redirect(new URL(callbackUrl, request.url))

  response.cookies.set(cookieName, sessionToken, {
    httpOnly: true,
    secure:   isSecure,
    sameSite: 'lax',
    path:     '/',
    maxAge,
  })
  response.cookies.delete('ms_oauth_state')
  response.cookies.delete('ms_oauth_callback')

  return response
}

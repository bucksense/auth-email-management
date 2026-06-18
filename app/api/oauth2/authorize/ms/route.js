import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getConnector } from '../../../../libs/service'

// const SCOPE = [
//   'openid', 'profile', 'email',
//   'User.Read', 'offline_access',
//   'Mail.ReadWrite', 'Mail.Send', 'Mail.Read',
//   'Calendars.ReadWrite', 'Calendars.Read',
//   'Group.Read.All', 'Mail.ReadWrite.Shared'
// ].join(' ')

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'

  const state = randomBytes(16).toString('hex')
  const { scope, tenant } = await getConnector()
  const params = new URLSearchParams({
    client_id: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
    response_type: 'code',
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/oauth2/callback/ms`,
    scope: scope,
    state,
    response_mode: 'query',
  })

  const authUrl =
    `https://login.microsoftonline.com/${tenant}` +
    `/oauth2/v2.0/authorize?${params}`

  const isSecure = process.env.NEXTAUTH_URL?.startsWith('https://')
  const cookieOpts = {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 300, // 5 min — solo il tempo del login
  }

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('ms_oauth_state', state, cookieOpts)
  response.cookies.set('ms_oauth_callback', callbackUrl, cookieOpts)
  return response
}

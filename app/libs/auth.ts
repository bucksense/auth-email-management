import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next"
import type { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth"

export const config = {
  providers: [],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    updateAge: 24 * 60 * 60 * 7, // 1 week
    maxAge: 60 * 60 * 24 * 365,
  }
} satisfies NextAuthOptions

export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, config)
}

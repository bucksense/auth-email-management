import { redirect } from "next/navigation"
import { auth } from "@/app/libs/auth"
import styles from "./page.module.css"
import SignOutButton from "./_components/SignOutButton"
import { getUserData } from "./libs/service"

import Permissions from "./_components/Permissions"
import Tokens from "./_components/Tokens"

export default async function Home() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }
  
  const accountData = await getUserData({ user: session.user })


  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Welcome back</h1>
          <p>
            {session.user?.name}
            <br />
            <small>{session.user?.email}</small>
          </p>
        </div>

        <div className={styles.accountCard}>
          <Tokens accountData={accountData} />
        </div>

        <div className={styles.accountCard}>
          <h4>Permissions</h4>
          <Permissions />
        </div>

        <div className={styles.ctas}>
          <a href="/api/oauth2/authorize/ms" className={styles.refreshButton}>
            Reconnect account
          </a>
          <SignOutButton />
        </div>
      </main>
    </div>
  )
}

"use client"

import { signOut } from "next-auth/react"
import styles from "./SignOutButton.module.css"

export default function SignOutButton() {
  return (
    <button
      className={styles.button}
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
    >
      Sign out
    </button>
  )
}

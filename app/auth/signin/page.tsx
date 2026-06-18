import styles from "./page.module.css"

export default async function SignInPage(
  {
    searchParams
  }
  : 
  {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }
) {

  const qs = await searchParams

  const { error, descr: errorDescr } = qs

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          {/* <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="0" y="0" width="11" height="11" fill="#F25022"/>
            <rect x="13" y="0" width="11" height="11" fill="#7FBA00"/>
            <rect x="0" y="13" width="11" height="11" fill="#00A4EF"/>
            <rect x="13" y="13" width="11" height="11" fill="#FFB900"/>
          </svg> */}
          <span className={styles.logoText}>Email Assistant</span>
        </div>

        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>Use your Microsoft account to continue</p>

        {error && (
          <div className={styles.errorBox}>
            <span className={styles.errorTitle}>{error}</span>
            {errorDescr && <span className={styles.errorDesc}>{errorDescr}</span>}
          </div>
        )}

        <a href="/api/oauth2/authorize/ms" className={styles.msButton}>
          <svg width="21" height="21" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
          </svg>
          Sign in with Microsoft
        </a>
      </div>
    </div>
  )
}

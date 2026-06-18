
'use client'

import { useState } from "react"
// import { useSession } from "next-auth/react"
import { apiFetch } from "../libs/api-fetch"
import styles from "./Tokens.module.css"

export default function Tokens ({accountData}) {

    // const { data: session, status } = useSession()
    const [ isLoading, setIsLoading ] = useState()
    const [ error, setError ] = useState()

    const disconnectAccount = () => {
        const response = confirm("Are you sure?")
        if ( response ) {
            setIsLoading(true)
            apiFetch('/api/oauth2/revoke', { method: 'POST', body: JSON.stringify({})})
                .then( () => window.location.reload() )
                .catch( err => setError(err.message) )
                .finally( () => setIsLoading(false) )
        }
            
    }

    const refreshToken = () => {
        setIsLoading(true)
        apiFetch('/api/oauth2/refresh', { method: 'POST', body: JSON.stringify({})})
            .then( () => window.location.reload() )
            .catch( err => setError(err.message) )
            .finally( () => setIsLoading(false) )
    }
    

    return (
        <>
            <div className={accountData.enabled ? styles.statusActive : styles.statusDisabled}>
                {accountData.enabled ? "Active" : "Disabled"}
            </div>

            <dl className={styles.dateGrid}>
                <dt className={styles.dateLabel}>Connected</dt>
                <dd className={styles.dateValue}>
                    {accountData.createdAt
                    ? new Date(accountData.createdAt).toLocaleString()
                    : "—"}
                </dd>
                <dt className={styles.dateLabel}>Last refresh</dt>
                <dd className={styles.dateValue}>
                    {accountData.modifiedAt
                    ? new Date(accountData.modifiedAt).toLocaleString()
                    : "—"}
                </dd>
                <dt className={styles.dateLabel}>Expires at</dt>
                <dd className={styles.dateValue}>
                    {accountData.expiresAt
                    ? new Date(accountData.expiresAt).toLocaleString()
                    : "—"}
                    <span className={accountData.expired ? styles.inlineTagGreen : styles.inlineTagRed}>
                        {accountData.expired ? "valid" : "expired"}
                    </span>
                </dd>
            </dl>

            {error && <div className={styles.errorBox}>{error}</div>}
            
            { accountData.accessToken &&
                <div className={styles.revokeRow}>
                    <button type="button" className={styles.revokeButton} onClick={disconnectAccount} disabled={isLoading}>
                        {isLoading
                            ? <><span className={styles.spinner} />Revoking…</>
                            : 'Revoke access'
                        }
                    </button>
                    <button type="button" className={styles.refreshButton} onClick={refreshToken} disabled={isLoading}>
                        {isLoading
                            ? <><span className={styles.spinner} />Update…</>
                            : 'Refresh access'
                        }
                    </button>
                </div>
            }
        </>
    )
}
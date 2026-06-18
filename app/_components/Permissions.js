'use client'

import { useEffect, useState, useCallback, useEffectEvent } from "react"
import styles from "./Permissions.module.css"
import { apiFetch } from "../libs/api-fetch"

export default function Permissions({}) {

    const [ permissions, setPermissions ] = useState([])
    const [ isSaving, setIsSaving ] = useState(false)
    const [ isLoading, setIsLoading ] = useState(false)
    const [ status, setStatus ] = useState({})

    const loadData = () => {
        setIsLoading(true)
        apiFetch('/api/permissions')
            .then(res => {
                setPermissions(res?.data || [])
                setStatus({})
            })
            .catch(err => setStatus({ status: 'err', message: err.message }))
            .finally(() => setIsLoading(false))
    }

    const _loadData = useEffectEvent(loadData)

    const addEmail = () => {
        setPermissions( prev => ([...prev, {
            email: "",
            readEmail: false,
            writeEmail: false,
            readCalendar: false
        }]))
    }

    const delEmail = (email) => {
        setPermissions( prev => prev.filter( p => p.email != email ))
    }

    const updatePermission = (field, key, value) => {
        setPermissions( prev => {
            const item = prev.find( p => p.email == key )
            if ( item ) item[field] = value
            return prev
        })
    }

    const onSubmitForm = (event) => {
        event.preventDefault()        
        setStatus({})

        if ( !permissions.every( p => p.email ) ){
            setStatus({ status: 'err', message: 'Email required!' })
            return
        }        

        setIsSaving(true)
        apiFetch('/api/permissions', { method: 'POST', body: JSON.stringify(permissions) })
            .then(() => setStatus({ status: 'ok', message: 'Permissions saved' }))
            .catch(err => setStatus({ status: 'err', message: err.message }))
            .finally(() => setIsSaving(false))
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        _loadData()
    }, [])


    return (
        <form onSubmit={onSubmitForm} className={styles.container}>

            <div className={styles.tableHeader}> 
                <span>Account</span>
                <span>Read Emails</span>
                <span>Write Emails</span>
                <span>Read Calendar</span>
                <span>Write Calendar</span>
                <span></span>
            </div>

            {permissions.length === 0 && (
                <div className={styles.empty}>No permissions configured yet</div>
            )}

            {permissions?.map(perm => (
                <div key={perm.email} className={styles.row}>
                    <input
                        type="email"
                        className={styles.emailInput}
                        defaultValue={perm.email}
                        placeholder="email@domain.com"
                        onChange={ (e) => updatePermission( 'email', perm.email, e.target.value ) }
                    />
                    <label className={styles.checkCell}>
                        <input 
                            type="checkbox" 
                            defaultChecked={perm.readEmail} 
                            onChange={ (e) => updatePermission( 'readEmail', perm.email, e.target.checked ) }
                        />
                    </label>
                    <label className={styles.checkCell}>
                        <input 
                            type="checkbox" 
                            defaultChecked={perm.writeEmail} 
                            onChange={ (e) => updatePermission( 'writeEmail', perm.email, e.target.checked ) }
                        />
                    </label>
                    <label className={styles.checkCell}>
                        <input 
                            type="checkbox" 
                            defaultChecked={perm.readCalendar} 
                            onChange={ (e) => updatePermission( 'readCalendar', perm.email, e.target.checked ) }
                        />
                    </label>
                    <label className={styles.checkCell}>
                        <input 
                            type="checkbox" 
                            defaultChecked={perm.writeCalendar} 
                            onChange={ (e) => updatePermission( 'writeCalendar', perm.email, e.target.checked ) }
                        />
                    </label>
                    <button type="button" className={styles.removeButton} aria-label="Remove" onClick={ () => delEmail(perm.email) }>
                        ×
                    </button>
                </div>
            ))}

            <div className={styles.footer}>
                <button type="button" className={styles.addButton} onClick={addEmail} disabled={isSaving}>
                    + Add
                </button>

                <div className={styles.footerRightBtns}>
                    <button type="button" className={styles.reloadButton} onClick={loadData} disabled={isLoading}>
                        {isLoading
                            ? <><span className={styles.spinner} />Loading…</>
                            : 'Reload'
                        }
                    </button>
                    <button type="submit" className={styles.saveButton} disabled={isSaving}>
                        {isSaving
                            ? <><span className={styles.spinner} />Saving…</>
                            : 'Save'
                        }
                    </button>
                </div>
            </div>

            {status?.status === 'err' && (
                <div className={styles.errorBox}>
                    {status.message}
                </div>
            )}

            {status?.status === 'ok' && (
                <div className={styles.okBox}>
                    {status.message}
                </div>
            )}


        </form>
    )
}

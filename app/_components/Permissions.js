'use client'

import { useEffect, useState, useEffectEvent } from "react"
import styles from "./Permissions.module.css"
import { apiFetch } from "../libs/api-fetch"

const COMPANIES = {
    'crystal': 'Crystal',
    'toc': 'US Toc',
    'uk-toc': 'UK Toc',
    'dmc-africa': 'DMC Africa',
    'sanctuary': "A&K Sanctuary"
}

const COMPANY_MAPPINGS = {
    'toc': [
        { value: "sales", label: "Sales" },
        { value: "operations", label: "Operations" }
    ],
    'uk-toc': [ 
        { value: "sales", label: "Sales" },         
        { value: "relations", label: "Guest Relations" },
        { value: "operations", label: "Operations" }
    ],
    'crystal': [ 
        { value: "revenue", label: "Revenue Management" },
        { value: "trade", label: "Trade Sales"},
        { value: "support", label: "Sales Support"},
    ],
    'sanctuary':[
        { value: "sales", label: "Sales" }
    ],
    'dmc-africa': [
        { value: "sales_dmc_toc", label: "Sales DMC to TOC" },
        { value: "sales_dmc_retail", label: "Sales DMC to Retail" },
    ]
}

export default function Permissions({}) {

    const [ permissions, setPermissions ] = useState([])
    const [ company, setCompany ] = useState()
    const [ isSaving, setIsSaving ] = useState(false)
    const [ isLoading, setIsLoading ] = useState(false)
    const [ status, setStatus ] = useState({})
    // const [ roles, setRoles ] = useState([])

    const loadData = () => {
        setIsLoading(true)
        apiFetch('/api/permissions')
            .then(res => {
                setPermissions(res?.data?.permissions || [])
                setCompany(res?.data?.company || '')
                setStatus({})
            })
            .catch(err => setStatus({ status: 'err', message: err.message }))
            .finally(() => setIsLoading(false))
    }

    const _loadData = useEffectEvent(loadData)

    const updateCompany = (value) => {
        // setPermissions( prev => prev.map( p => ({ ...p, company: value }) ) )
        setCompany(value)
        // setRoles( COMPANY_MAPPINGS[value] )
    }

    const addEmail = () => {
        setPermissions( prev => ([...prev, {
            email: "",
            role: "",
            readEmail: false,
            writeEmail: false,
            readCalendar: false,
            writeCalendar: false,
        }]))
    }

    const delEmail = (email) => {
        setPermissions( prev => prev.filter( p => p.email != email ))
    }

    const updatePermission = (field, key, value) => {
        // console.log('updatePermission', field, key, value)
        setPermissions( prev => {
            const item = prev.find( p => p.email == key )
            if ( item ) item[field] = value
            return prev
        })
    }

    const onSubmitForm = (event) => {
        event.preventDefault()        
        setStatus({})

        if ( !company ) {
            setStatus({ status: 'err', message: 'Company required!' })
            return
        }   

        if ( !permissions.every( p => p.email ) ){
            setStatus({ status: 'err', message: 'Email required!' })
            return
        }        
        if ( !permissions.every( p => p.role ) ){
            setStatus({ status: 'err', message: 'Role required!' })
            return
        }        
     

        setIsSaving(true)
        apiFetch('/api/permissions', { method: 'POST', body: JSON.stringify({ company, permissions }) })
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

            <div className={styles.companyBar}>
                <label className={styles.companyField}>
                    <span>Company</span>
                    <select
                        className={styles.select}
                        value={company}
                        onChange={ (e) => updateCompany(e.target.value) }
                    >                        
                        <option value="">-- Select Company --</option>
                        {Object.entries(COMPANIES).map( ([k,v]) => (<option key={k} value={k}>{v}</option>) )}
                    </select>
                </label>
            </div>

            <div className={styles.tableHeader}>
                <span>Account</span>
                <span>Role</span>
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
                        placeholder="Write your email"
                        onChange={ (e) => updatePermission( 'email', perm.email, e.target.value ) }
                    />
                    <label className={styles.selectCell}>
                        <select
                            className={styles.select}
                            defaultValue={perm.role || ""}
                            onChange={ (e) => updatePermission( 'role', perm.email, e.target.value ) }
                        >

                            <option value="">-- Select role --</option> 
                            { company &&
                                COMPANY_MAPPINGS[company]?.map( r => <option key={r.value} value={r.value}>{r.label}</option> )                                 
                            }

                            {/* <option value="" disabled>Select role</option>
                            <option value="sales">Sales</option>
                            <option value="revenue">Revenue Management</option>
                            <option value="operations">Operations</option>
                            <option value="relations">Guest Relations</option>
                            <option value="trade">Trade Sales</option> */}
                        </select>
                    </label>
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

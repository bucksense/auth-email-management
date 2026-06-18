/**
 * Wrapper around fetch that:
 * - sets Content-Type: application/json on POST/PUT/PATCH
 * - parses the JSON response
 * - throws a normalised Error on non-2xx status or network failure
 */
export async function apiFetch(url, options = {}) {

    const isBodyMethod = options.method && ['POST','PUT','PATCH'].includes(options.method.toUpperCase())

    const res = await fetch(url, {
        ...options,
        headers: {
            ...(isBodyMethod && { 'Content-Type': 'application/json' }),
            ...options.headers,
        },
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
        const message = data?.message ?? `Request failed: ${res.status} ${res.statusText}`
        const err = new Error(message)
        err.status = res.status
        err.data = data
        throw err
    }

    return data
}

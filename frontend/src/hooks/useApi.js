// import { useState, useCallback } from 'react'

// export function useApi() {
//     const [loading, setLoading] = useState(false)
//     const [error, setError] = useState(null)

//     const request = useCallback(async (url, options = {}) => {
//         setLoading(true)
//         setError(null)

//         const token = localStorage.getItem('token')
//         try { 
//             const res = await fetch(`http://localhost:5000${url}`, {
//                 ...options,
//                 headers: {
//                     'Content-Type' : 'application/json',
//                     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//                     ...options.headers,
//                 },
//             })
//             if (res.status === 401) {
//                 localStorage.removeItem('token')
//                 localStorage.removeItem('email')
//                 window.location.reload()
//                 return null
//             }

//             const data = await res.json()

//             if (!res.ok) {
//                 throw new Error(data.error ||  `Server error ${res.status}`)
//             }
//             return data
//         } catch (err) {
//             const message = err.message.includes('fetch')
//                 ? 'Cannot reach the server. Is your backend running on port 5000?'
//                 : err.message
//             setError(message)
//             return null
//         } finally { 
//             setLoading(false)
//         }
//     }, [])

//     const get = useCallback((url) => request(url), [request])
//     const post = useCallback((url, body) =>
//     request(url, { method: 'POST', body: JSON.stringify(body) }) ,[request])
//     const del = useCallback((url) => request(url, { method: 'DELETE'}), [request])

//     const upload = useCallback(async (url, formData) => {
//         setLoading(true)
//         setError(null)
//         const token = localStorage.getItem('token')
//         try {
//             const res = await fetch(`http://localhost:5000${url}`, {
//                 method: 'POST',
//                 headers: token ? { Authorization: `Bearer ${token}`} : {},
//                 body: formData,
//             })
//             const data = await res.json()
//             if (!res.ok) throw new Error(data.error || 'Upload failed')
//                 return data
//         } catch (err) {
//             setError(err.message)
//             return null
//         } finally {
//             setLoading(false)
//         }
//     }, [])

//     return { loading, error, get, post, del, upload, clearError: () => setError(null) }

    
// }
import { useState, useCallback } from 'react'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (url, options = {}) => {
    setLoading(true)
    setError(null)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://localhost:5000${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      })
      if (res.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('email')
        window.location.reload()
        return null
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
      return data
    } catch (err) {
      const msg = err.message.includes('fetch')
        ? 'Cannot reach the server. Is your backend running on port 5000?'
        : err.message
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const get    = useCallback((url) => request(url), [request])
  const post   = useCallback((url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }), [request])
  const del    = useCallback((url) => request(url, { method: 'DELETE' }), [request])

  const upload = useCallback(async (url, formData) => {
    setLoading(true)
    setError(null)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://localhost:5000${url}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, get, post, del, upload, clearError: () => setError(null) }
}

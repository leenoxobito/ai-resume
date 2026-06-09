// import { useState, useEffect } from 'react'

// export function useAuth() {
//   const [token, setToken] = useState(null)
//   const [email, setEmail] = useState('')
//   const [isAuth, setIsAuth] = useState(false)
//   const [loading, setLoading] = useState(true) // ✅ NEW

//   useEffect(() => {
//     const storedToken = localStorage.getItem('token')
//     const storedEmail = localStorage.getItem('email')

//     if (storedToken) {
//       setToken(storedToken)
//       setEmail(storedEmail || '')
//       setIsAuth(true)
//     }

//     setLoading(false) // ✅ done loading
//   }, [])

//   const login = (newToken, userEmail) => {
//     localStorage.setItem('token', newToken)
//     localStorage.setItem('email', userEmail)
//     setToken(newToken)
//     setEmail(userEmail)
//     setIsAuth(true)
//   }

//   const logout = () => {
//     localStorage.removeItem('token')
//     localStorage.removeItem('email')
//     setToken(null)
//     setEmail('')
//     setIsAuth(false)
//   }

//   return { token, email, isAuth, loading, login, logout }
// }
import { useState, useEffect } from 'react'

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [email, setEmail] = useState(() => localStorage.getItem('email') || '')
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'))

  useEffect(() => { setIsAuth(!!token) }, [token])

  const login = (newToken, userEmail) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('email', userEmail)
    setToken(newToken)
    setEmail(userEmail)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    setToken(null)
    setEmail('')
  }

  return { token, email, isAuth, login, logout }
}

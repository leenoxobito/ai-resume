import { useState, useEffect } from 'react'

export function useAuth() {
    const [token, setToken] = useState(() => localStorage.getItem('token'))
    const [email, setEmail] = useState(() => localStorage.getItem('email') || '')
    const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'))

    useEffect(() => {
        setIsAuth(!!token)
    }, [token])

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
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";



export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context
    const [error, setError] = useState(null)


    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        setError(null)
        try {
            const data = await login({ email, password })
            if (data?.user) {
                setUser(data.user)
                return true
            }
            return false
        } catch (err) {
            setError(err.message || "Login failed")
            return false
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        setError(null)
        try {
            const data = await register({ username, email, password })
            if (data?.user) {
                setUser(data.user)
                return true
            }
            return false
        } catch (err) {
            setError(err.message || "Registration failed")
            return false
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await logout()
            setUser(null)
        } catch (err) {

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {

        const getAndSetUser = async () => {
            try {
                const data = await getMe()
                if (data?.user) {
                    setUser(data.user)
                }
            } catch (err) { } finally {
                setLoading(false)
            }
        }

        getAndSetUser()

    }, [])

    return { user, loading, error, setError, handleRegister, handleLogin, handleLogout }
}
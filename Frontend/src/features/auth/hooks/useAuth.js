import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";

export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            if (data && data.user) {
                setUser(data.user)
                return { success: true, user: data.user }
            }
            return { success: false, message: data?.message || "Invalid credentials" }
        } catch (err) {
            console.error("Login handle error:", err)
            const errMsg = err?.response?.data?.message || err?.message || "Unable to connect to server"
            return { success: false, message: errMsg }
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            if (data && data.user) {
                setUser(data.user)
                return { success: true, user: data.user }
            }
            return { success: false, message: data?.message || "Registration failed" }
        } catch (err) {
            console.error("Register handle error:", err)
            const errMsg = err?.response?.data?.message || err?.message || "Unable to connect to server"
            return { success: false, message: errMsg }
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (err) {
            console.error("Logout handle error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe()
                if (data && data.user) {
                    setUser(data.user)
                }
            } catch (err) {
            } finally {
                setLoading(false)
            }
        }

        getAndSetUser()

    }, [])

    return { user, loading, handleRegister, handleLogin, handleLogout }
}
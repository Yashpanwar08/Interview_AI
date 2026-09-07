import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ errorMsg, setErrorMsg ] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMsg("")
        const result = await handleLogin({ email, password })
        if (result && result.success) {
            navigate('/')
        } else if (result && result.message) {
            setErrorMsg(result.message)
        }
    }

    if (loading) {
        return (<main><h1>Loading...</h1></main>)
    }

    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>
                {errorMsg && (
                    <div style={{
                        color: '#ff4d4d',
                        backgroundColor: 'rgba(255,77,77,0.1)',
                        border: '1px solid rgba(255,77,77,0.3)',
                        padding: '0.6rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.85rem'
                    }}>
                        {errorMsg}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => { setEmail(e.target.value) }}
                            type="email" id="email" name='email' placeholder='Enter email address' required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => { setPassword(e.target.value) }}
                            type="password" id="password" name='password' placeholder='Enter password' required />
                    </div>
                    <button className='button primary-button'>Login</button>
                </form>
                <p>Don't have an account? <Link to={"/register"}>Register</Link></p>
            </div>
        </main>
    )
}

export default Login
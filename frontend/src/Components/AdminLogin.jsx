import { useState } from 'react'
import { FiLock, FiLogIn, FiUser } from 'react-icons/fi'

const AdminLogin = ({ error = '', isLoading = false, onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  })

  const updateCredentials = (event) => {
    const { name, value } = event.target

    setCredentials((currentCredentials) => ({
      ...currentCredentials,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onLogin(credentials)
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-card__badge">
          <FiLock aria-hidden="true" />
        </div>

        <div className="admin-login-card__heading">
          <p>Acces securise</p>
          <h1>Dashboard Yanglam</h1>
          <span>Connectez-vous pour gerer les commandes et le contenu du site.</span>
        </div>

        {error && <p className="admin-feedback admin-feedback--error">{error}</p>}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label>
            <span>Username</span>
            <div>
              <FiUser aria-hidden="true" />
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={updateCredentials}
                autoComplete="username"
                required
              />
            </div>
          </label>

          <label>
            <span>Password</span>
            <div>
              <FiLock aria-hidden="true" />
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={updateCredentials}
                autoComplete="current-password"
                required
              />
            </div>
          </label>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Connexion...' : 'Se connecter'}
            <FiLogIn aria-hidden="true" />
          </button>
        </form>
      </section>
    </main>
  )
}

export default AdminLogin

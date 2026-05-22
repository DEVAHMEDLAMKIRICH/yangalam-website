import { useEffect, useState } from 'react'
import { FiLogOut, FiSettings, FiShoppingBag } from 'react-icons/fi'
import logo from '../assets/logo.PNG'
import { API_BASE_URL } from '../apiConfig'
import '../Css/Dashboard.css'
import AdminLogin from './AdminLogin'
import OrdersTable from './OrdersTable'
import PageSettings from './PageSettings'
import WhatsAppFloat from './WhatsAppFloat'

const navigationItems = [
  {
    id: 'orders',
    label: 'Commandes',
    icon: FiShoppingBag,
  },
  {
    id: 'settings',
    label: 'Paramètres de la page',
    icon: FiSettings,
  },
]

const ACTIVE_VIEW_STORAGE_KEY = 'yanglam-admin-active-view'

const isValidView = (viewId) => navigationItems.some((item) => item.id === viewId)

const getInitialActiveView = () => {
  try {
    const storedView = localStorage.getItem(ACTIVE_VIEW_STORAGE_KEY)

    if (isValidView(storedView)) {
      return storedView
    }
  } catch {
    return 'orders'
  }

  return 'orders'
}

const viewTitles = {
  orders: {
    eyebrow: 'Gestion boutique',
    title: 'Commandes clients',
    description: 'Suivez les nouvelles commandes et validez leur traitement rapidement.',
  },
  settings: {
    eyebrow: 'Contenu du site',
    title: 'Paramètres de la page',
    description: 'Modifiez les visuels et les textes principaux de votre landing page.',
  },
}

const DashboardLayout = () => {
  const [activeView, setActiveView] = useState(getInitialActiveView)
  const [admin, setAdmin] = useState(null)
  const [authStatus, setAuthStatus] = useState('checking')
  const [authError, setAuthError] = useState('')
  const activeContent = viewTitles[activeView]

  useEffect(() => {
    const controller = new AbortController()

    const checkSession = async () => {
      try {
        setAuthStatus('checking')
        setAuthError('')

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: 'include',
          signal: controller.signal,
        })

        if (!response.ok) {
          setAdmin(null)
          setAuthStatus('anonymous')
          return
        }

        const data = await response.json()
        setAdmin(data.admin)
        setAuthStatus('authenticated')
      } catch (error) {
        if (error.name !== 'AbortError') {
          setAdmin(null)
          setAuthStatus('anonymous')
        }
      }
    }

    checkSession()

    return () => controller.abort()
  }, [])

  const changeActiveView = (viewId) => {
    setActiveView(viewId)

    try {
      localStorage.setItem(ACTIVE_VIEW_STORAGE_KEY, viewId)
    } catch {
      // Ignore storage errors; the dashboard still works without persistence.
    }
  }

  const loginAdmin = async ({ username, password }) => {
    try {
      setAuthStatus('logging-in')
      setAuthError('')

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Connexion impossible')
      }

      setAdmin(data.admin)
      setAuthStatus('authenticated')
    } catch (error) {
      setAdmin(null)
      setAuthStatus('anonymous')
      setAuthError(error.message)
    }
  }

  const logoutAdmin = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setAdmin(null)
      setAuthStatus('anonymous')
    }
  }

  if (authStatus === 'checking') {
    return (
      <>
        <main className="admin-login-page">
          <div className="admin-state-message">Verification de la session admin...</div>
        </main>
        <WhatsAppFloat variant="dashboard" />
      </>
    )
  }

  if (authStatus !== 'authenticated') {
    return (
      <>
        <AdminLogin
          error={authError}
          isLoading={authStatus === 'logging-in'}
          onLogin={loginAdmin}
        />
        <WhatsAppFloat variant="dashboard" />
      </>
    )
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <a className="admin-sidebar__brand" href="#dashboard" aria-label="Yanglam dashboard">
          <img src={logo} alt="Yanglam" />
          <span>Admin</span>
        </a>

        <nav className="admin-sidebar__nav" aria-label="Navigation dashboard">
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button
              className={`admin-sidebar__link ${activeView === id ? 'is-active' : ''}`}
              type="button"
              onClick={() => changeActiveView(id)}
              key={id}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-main__header">
          <div>
            <p>{activeContent.eyebrow}</p>
            <h1>{activeContent.title}</h1>
            <span>{activeContent.description}</span>
          </div>
          <button className="admin-logout-button" type="button" onClick={logoutAdmin}>
            <span>{admin?.username || 'Admin'}</span>
            <FiLogOut aria-hidden="true" />
          </button>
        </header>

        {activeView === 'orders' ? <OrdersTable /> : <PageSettings />}
      </main>
      <WhatsAppFloat variant="dashboard" />
    </div>
  )
}

export default DashboardLayout

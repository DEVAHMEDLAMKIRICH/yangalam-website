import { useEffect, useMemo, useRef, useState } from 'react'
import { FiBell, FiEdit3, FiEye, FiSave, FiTrash2, FiX } from 'react-icons/fi'
import { io } from 'socket.io-client'
import { API_BASE_URL, SOCKET_BASE_URL } from '../apiConfig'

const ORDERS_PER_PAGE = 5
const DAY_IN_MS = 24 * 60 * 60 * 1000
const NEW_ORDER_EVENT = 'orders:new'
const ACTIVE_ORDER_FILTER_STORAGE_KEY = 'yanglam-admin-orders-active-filter'
const ORDER_SORT_STORAGE_KEY = 'yanglam-admin-orders-sort-direction'

const statusOptions = [
  { value: 'En attente', label: 'En attente', slug: 'pending' },
  { value: 'Confirmé', label: 'Confirmé', slug: 'confirmed' },
  { value: 'Expédié', label: 'Expédié', slug: 'shipped' },
  { value: 'Livré', label: 'Livré', slug: 'delivered' },
  { value: 'Annulé', label: 'Annulé', slug: 'cancelled' },
]

const filterTabs = [
  { value: 'all', label: 'Toutes', slug: 'all' },
  { value: 'En attente', label: 'En attente', slug: 'pending' },
  { value: 'Confirmé', label: 'Confirmées', slug: 'confirmed' },
  { value: 'Expédié', label: 'Expédiées', slug: 'shipped' },
  { value: 'Livré', label: 'Livrées', slug: 'delivered' },
  { value: 'Annulé', label: 'Annulées', slug: 'cancelled' },
]

const emptyEditForm = {
  nom: '',
  telephone: '',
  ville: '',
  adresse: '',
  codePromo: '',
  statut: 'En attente',
}

const getInitialActiveFilter = () => {
  try {
    const storedFilter = localStorage.getItem(ACTIVE_ORDER_FILTER_STORAGE_KEY)

    if (filterTabs.some((tab) => tab.value === storedFilter)) {
      return storedFilter
    }
  } catch {
    return 'all'
  }

  return 'all'
}

const getInitialSortDirection = () => {
  try {
    const storedSortDirection = localStorage.getItem(ORDER_SORT_STORAGE_KEY)

    if (storedSortDirection === 'asc' || storedSortDirection === 'desc') {
      return storedSortDirection
    }
  } catch {
    return 'desc'
  }

  return 'desc'
}

const getStatusSlug = (status) => {
  return statusOptions.find((option) => option.value === status)?.slug || 'pending'
}

const getErrorMessage = async (response) => {
  try {
    const data = await response.json()
    return data.message || 'Une erreur est survenue'
  } catch {
    return 'Une erreur est survenue'
  }
}

const formatOrderDate = (createdAt) => {
  if (!createdAt) {
    return '-'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(createdAt))
}

const getOrderProduct = (order) => order.produit || order.product || 'Pack Yanglam'

const getOrderAge = (createdAt) => {
  if (!createdAt) {
    return Number.POSITIVE_INFINITY
  }

  return Date.now() - new Date(createdAt).getTime()
}

const isNewOrder = (createdAt) => getOrderAge(createdAt) < DAY_IN_MS

const isDelayedPendingOrder = (order) =>
  order.statut === 'En attente' && getOrderAge(order.createdAt) > DAY_IN_MS

const playOrderNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext

    if (!AudioContext) {
      return
    }

    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    const startAt = audioContext.currentTime

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, startAt)
    oscillator.frequency.setValueAtTime(660, startAt + 0.18)
    gain.gain.setValueAtTime(0.0001, startAt)
    gain.gain.exponentialRampToValueAtTime(0.16, startAt + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.55)

    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start(startAt)
    oscillator.stop(startAt + 0.56)
    oscillator.onended = () => audioContext.close()
  } catch {
    // Browsers can block audio before a user interaction; realtime updates still work.
  }
}

const OrdersTable = () => {
  const soundEnabledRef = useRef(true)
  const [initialActiveFilter] = useState(getInitialActiveFilter)
  const [orders, setOrders] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState(initialActiveFilter)
  const [sortDirection, setSortDirection] = useState(getInitialSortDirection)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState('')
  const [socketStatus, setSocketStatus] = useState('connecting')
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [editingOrder, setEditingOrder] = useState(null)
  const [editForm, setEditForm] = useState(emptyEditForm)
  const [isEditSaving, setIsEditSaving] = useState(false)
  const [deletingOrderId, setDeletingOrderId] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response = await fetch(`${API_BASE_URL}/orders`, {
          credentials: 'include',
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(await getErrorMessage(response))
        }

        const data = await response.json()
        const nextOrders = Array.isArray(data) ? data : []
        const savedFilterHasOrders =
          initialActiveFilter === 'all' ||
          nextOrders.some((order) => order.statut === initialActiveFilter)

        if (nextOrders.length && !savedFilterHasOrders) {
          setActiveFilter('all')

          try {
            localStorage.setItem(ACTIVE_ORDER_FILTER_STORAGE_KEY, 'all')
          } catch {
            // Ignore storage errors; the table can still show orders.
          }
        }

        setOrders(nextOrders)
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    fetchOrders()

    return () => {
      controller.abort()
    }
  }, [initialActiveFilter])

  useEffect(() => {
    soundEnabledRef.current = isSoundEnabled
  }, [isSoundEnabled])

  useEffect(() => {
    const socket = io(SOCKET_BASE_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })

    socket.on('connect', () => {
      setSocketStatus('connected')
    })

    socket.on('disconnect', () => {
      setSocketStatus('disconnected')
    })

    socket.on('connect_error', () => {
      setSocketStatus('disconnected')
    })

    socket.on(NEW_ORDER_EVENT, (newOrder) => {
      if (!newOrder?._id) {
        return
      }

      setOrders((currentOrders) => {
        if (currentOrders.some((order) => order._id === newOrder._id)) {
          return currentOrders
        }

        return [newOrder, ...currentOrders]
      })
      setCurrentPage(1)
      setNewOrdersCount((count) => count + 1)

      if (soundEnabledRef.current) {
        playOrderNotificationSound()
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const stats = useMemo(() => {
    return {
      total: orders.length,
      delivered: orders.filter((order) => order.statut === 'Livré').length,
      cancelled: orders.filter((order) => order.statut === 'Annulé').length,
    }
  }, [orders])

  const filterCounts = useMemo(() => {
    return filterTabs.reduce((counts, tab) => {
      counts[tab.value] =
        tab.value === 'all'
          ? orders.length
          : orders.filter((order) => order.statut === tab.value).length

      return counts
    }, {})
  }, [orders])

  const filteredAndSortedOrders = useMemo(() => {
    return orders
      .filter((order) => activeFilter === 'all' || order.statut === activeFilter)
      .slice()
      .sort((firstOrder, secondOrder) => {
        const firstDate = new Date(firstOrder.createdAt).getTime()
        const secondDate = new Date(secondOrder.createdAt).getTime()

        return sortDirection === 'desc' ? secondDate - firstDate : firstDate - secondDate
      })
  }, [activeFilter, orders, sortDirection])

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedOrders.length / ORDERS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pageStart = (safeCurrentPage - 1) * ORDERS_PER_PAGE
  const paginatedOrders = filteredAndSortedOrders.slice(pageStart, pageStart + ORDERS_PER_PAGE)
  const activeFilterLabel =
    filterTabs.find((tab) => tab.value === activeFilter)?.label || filterTabs[0].label

  const updateOrderStatus = async (orderId, statut) => {
    try {
      setUpdatingOrderId(orderId)
      setError('')

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/statut`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statut }),
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      const updatedOrder = await response.json()

      setOrders((currentOrders) =>
        currentOrders.map((order) => (order._id === orderId ? updatedOrder : order)),
      )
      setSelectedOrder((currentOrder) =>
        currentOrder?._id === orderId ? updatedOrder : currentOrder,
      )
      setEditingOrder((currentOrder) =>
        currentOrder?._id === orderId ? updatedOrder : currentOrder,
      )
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setUpdatingOrderId('')
    }
  }

  const openOrderDetails = async (order) => {
    try {
      setError('')

      const response = await fetch(`${API_BASE_URL}/orders/${order._id}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      const orderDetails = await response.json()
      setSelectedOrder(orderDetails)
      setEditingOrder(null)
    } catch (detailsError) {
      setError(detailsError.message)
    }
  }

  const openEditOrder = (order) => {
    setSelectedOrder(null)
    setEditingOrder(order)
    setEditForm({
      nom: order.nom || '',
      telephone: order.telephone || '',
      ville: order.ville || '',
      adresse: order.adresse || '',
      codePromo: order.codePromo || '',
      statut: order.statut || 'En attente',
    })
  }

  const closeOrderPanel = () => {
    setSelectedOrder(null)
    setEditingOrder(null)
    setEditForm(emptyEditForm)
    setError('')
  }

  const updateEditField = (event) => {
    const { name, value } = event.target

    setEditForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const saveEditedOrder = async (event) => {
    event.preventDefault()

    if (!editingOrder?._id) {
      return
    }

    try {
      setIsEditSaving(true)
      setError('')

      const response = await fetch(`${API_BASE_URL}/orders/${editingOrder._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      const updatedOrder = await response.json()

      setOrders((currentOrders) =>
        currentOrders.map((order) => (order._id === updatedOrder._id ? updatedOrder : order)),
      )
      setEditingOrder(null)
      setSelectedOrder(updatedOrder)
      setEditForm(emptyEditForm)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsEditSaving(false)
    }
  }

  const deleteOrder = async (order) => {
    if (!window.confirm(`Supprimer la commande de ${order.nom} ?`)) {
      return
    }

    try {
      setDeletingOrderId(order._id)
      setError('')

      const response = await fetch(`${API_BASE_URL}/orders/${order._id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      setOrders((currentOrders) => currentOrders.filter((currentOrder) => currentOrder._id !== order._id))
      setSelectedOrder((currentOrder) => (currentOrder?._id === order._id ? null : currentOrder))
      setEditingOrder((currentOrder) => (currentOrder?._id === order._id ? null : currentOrder))
    } catch (deleteError) {
      setError(deleteError.message)
    } finally {
      setDeletingOrderId('')
    }
  }

  const updateFilter = (filter) => {
    setActiveFilter(filter)
    setCurrentPage(1)

    try {
      localStorage.setItem(ACTIVE_ORDER_FILTER_STORAGE_KEY, filter)
    } catch {
      // Ignore storage errors; filtering still works without persistence.
    }
  }

  const updateSortDirection = (direction) => {
    setSortDirection(direction)
    setCurrentPage(1)

    try {
      localStorage.setItem(ORDER_SORT_STORAGE_KEY, direction)
    } catch {
      // Ignore storage errors; sorting still works without persistence.
    }
  }

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(1, page - 1))
  }

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(totalPages, page + 1))
  }

  const toggleOrderSound = () => {
    setIsSoundEnabled((enabled) => !enabled)
    setNewOrdersCount(0)
  }

  return (
    <section className="admin-orders">
      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <p>Total</p>
          <strong>{stats.total}</strong>
        </article>
        <article className="admin-stat-card">
          <p>Livrées</p>
          <strong>{stats.delivered}</strong>
        </article>
        <article className="admin-stat-card">
          <p>Annulées / Retour</p>
          <strong>{stats.cancelled}</strong>
        </article>
      </div>

      {error && <p className="admin-feedback admin-feedback--error">{error}</p>}

      <div className="admin-orders-realtime-bar">
        <div>
          <span
            className={`admin-realtime-status admin-realtime-status--${socketStatus}`}
            aria-label={`Socket status: ${socketStatus}`}
          />
          <strong>Commandes en temps réel</strong>
          <small>
            {socketStatus === 'connected'
              ? 'Connecté au backend'
              : 'Connexion au backend en cours...'}
          </small>
        </div>
        <button
          className={`admin-order-bell ${isSoundEnabled ? 'is-active' : ''} ${
            newOrdersCount ? 'has-new-orders' : ''
          }`}
          type="button"
          onClick={toggleOrderSound}
          aria-label={
            isSoundEnabled
              ? 'Désactiver le son des nouvelles commandes'
              : 'Activer le son des nouvelles commandes'
          }
          title={isSoundEnabled ? 'Son activé' : 'Son désactivé'}
        >
          <FiBell aria-hidden="true" />
          {newOrdersCount > 0 && <span>{newOrdersCount}</span>}
        </button>
      </div>

      <div className="admin-orders-toolbar">
        <div className="admin-filter-tabs" aria-label="Filtrer les commandes par statut">
          {filterTabs.map((tab) => (
            <button
              className={`admin-filter-pill admin-filter-pill--${tab.slug} ${
                activeFilter === tab.value ? 'is-active' : ''
              }`}
              type="button"
              onClick={() => updateFilter(tab.value)}
              key={tab.value}
            >
              <span>{tab.label}</span>
              <small>{filterCounts[tab.value] || 0}</small>
            </button>
          ))}
        </div>

        <label className="admin-sort-control">
          <span>Tri par date</span>
          <select
            value={sortDirection}
            onChange={(event) => updateSortDirection(event.target.value)}
            aria-label="Trier les commandes par date"
          >
            <option value="desc">Plus récents</option>
            <option value="asc">Plus anciens</option>
          </select>
        </label>
      </div>

      <div className="admin-card admin-orders-card">
        <div className="admin-card__top">
          <div>
            <h2>Dernières commandes</h2>
            <p>
              {filteredAndSortedOrders.length} commandes affichées, triées par date et filtrées par
              statut
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="admin-state-message">Chargement des commandes...</div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Téléphone</th>
                    <th>Ville</th>
                    <th>Adresse</th>
                    <th>Produit</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <div className="admin-order-name">
                          <strong>{order.nom}</strong>
                          {isNewOrder(order.createdAt) && (
                            <span className="admin-new-order-badge">Nouveau ✨</span>
                          )}
                        </div>
                        <span className="admin-order-id">{order._id}</span>
                      </td>
                      <td>{order.telephone}</td>
                      <td>{order.ville}</td>
                      <td className="admin-address-cell" title={order.adresse}>
                        <span>{order.adresse}</span>
                      </td>
                      <td>{getOrderProduct(order)}</td>
                      <td>
                        <span className="admin-order-date">{formatOrderDate(order.createdAt)}</span>
                      </td>
                      <td>
                        <div className="admin-status-cell">
                          <select
                            className={`admin-status-select admin-status-select--${getStatusSlug(
                              order.statut,
                            )}`}
                            value={order.statut}
                            onChange={(event) => updateOrderStatus(order._id, event.target.value)}
                            disabled={updatingOrderId === order._id}
                            aria-label={`Changer le statut de ${order._id}`}
                          >
                            {statusOptions.map((option) => (
                              <option value={option.value} key={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          {isDelayedPendingOrder(order) && (
                            <span className="admin-delay-alert">
                              ⚠️ À contacter urgemment
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button type="button" onClick={() => openOrderDetails(order)}>
                            <FiEye aria-hidden="true" />
                            Voir
                          </button>
                          <button type="button" onClick={() => openEditOrder(order)}>
                            <FiEdit3 aria-hidden="true" />
                            Modifier
                          </button>
                          <button
                            className="is-danger"
                            type="button"
                            onClick={() => deleteOrder(order)}
                            disabled={deletingOrderId === order._id}
                          >
                            <FiTrash2 aria-hidden="true" />
                            {deletingOrderId === order._id ? '...' : 'Supprimer'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!paginatedOrders.length && (
              <div className="admin-empty-state">
                <p>
                  {orders.length
                    ? `Aucune commande dans "${activeFilterLabel}".`
                    : 'Aucune commande pour le moment.'}
                </p>
                {activeFilter !== 'all' && orders.length > 0 && (
                  <button type="button" onClick={() => updateFilter('all')}>
                    Voir toutes les commandes
                  </button>
                )}
              </div>
            )}

            <div className="admin-pagination">
              <button type="button" onClick={goToPreviousPage} disabled={safeCurrentPage === 1}>
                Précédent
              </button>
              <span>
                Page {safeCurrentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={goToNextPage}
                disabled={safeCurrentPage === totalPages}
              >
                Suivant
              </button>
            </div>
          </>
        )}
      </div>

      {(selectedOrder || editingOrder) && (
        <div className="admin-order-panel-overlay" role="presentation" onMouseDown={closeOrderPanel}>
          <section
            className="admin-order-panel"
            role="dialog"
            aria-modal="true"
            aria-label={editingOrder ? 'Modifier la commande' : 'Details de la commande'}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="admin-order-panel__close"
              type="button"
              onClick={closeOrderPanel}
              aria-label="Fermer"
            >
              <FiX aria-hidden="true" />
            </button>

            {selectedOrder && (
              <>
                <div className="admin-order-panel__heading">
                  <p>Fiche client</p>
                  <h2>{selectedOrder.nom}</h2>
                  <span>{selectedOrder._id}</span>
                </div>

                <div className="admin-order-detail-grid">
                  <article>
                    <span>Telephone</span>
                    <strong>{selectedOrder.telephone}</strong>
                  </article>
                  <article>
                    <span>Ville</span>
                    <strong>{selectedOrder.ville}</strong>
                  </article>
                  <article>
                    <span>Produit</span>
                    <strong>{getOrderProduct(selectedOrder)}</strong>
                  </article>
                  <article>
                    <span>Statut</span>
                    <strong>{selectedOrder.statut}</strong>
                  </article>
                  <article className="is-wide admin-order-address-detail">
                    <span>Adresse complete</span>
                    <strong>{selectedOrder.adresse}</strong>
                  </article>
                  <article>
                    <span>Code promo</span>
                    <strong>{selectedOrder.codePromo || 'Aucun'}</strong>
                  </article>
                  <article>
                    <span>Date commande</span>
                    <strong>{formatOrderDate(selectedOrder.createdAt)}</strong>
                  </article>
                  <article>
                    <span>Derniere modification</span>
                    <strong>{formatOrderDate(selectedOrder.updatedAt)}</strong>
                  </article>
                </div>

                <div className="admin-order-panel__actions">
                  <button type="button" onClick={() => openEditOrder(selectedOrder)}>
                    <FiEdit3 aria-hidden="true" />
                    Modifier
                  </button>
                  <button
                    className="is-danger"
                    type="button"
                    onClick={() => deleteOrder(selectedOrder)}
                    disabled={deletingOrderId === selectedOrder._id}
                  >
                    <FiTrash2 aria-hidden="true" />
                    Supprimer
                  </button>
                </div>
              </>
            )}

            {editingOrder && (
              <form className="admin-order-edit-form" onSubmit={saveEditedOrder}>
                <div className="admin-order-panel__heading">
                  <p>Modification</p>
                  <h2>{editingOrder.nom}</h2>
                  <span>{editingOrder._id}</span>
                </div>

                <label>
                  <span>Nom et Prenom</span>
                  <input
                    type="text"
                    name="nom"
                    value={editForm.nom}
                    onChange={updateEditField}
                    required
                  />
                </label>

                <label>
                  <span>Telephone</span>
                  <input
                    type="tel"
                    name="telephone"
                    value={editForm.telephone}
                    onChange={updateEditField}
                    required
                  />
                </label>

                <label>
                  <span>Ville</span>
                  <input
                    type="text"
                    name="ville"
                    value={editForm.ville}
                    onChange={updateEditField}
                    required
                  />
                </label>

                <label>
                  <span>Statut</span>
                  <select name="statut" value={editForm.statut} onChange={updateEditField}>
                    {statusOptions.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="is-wide admin-order-address-field">
                  <span>Adresse complete</span>
                  <textarea
                    name="adresse"
                    value={editForm.adresse}
                    onChange={updateEditField}
                    rows="2"
                    required
                  />
                </label>

                <label>
                  <span>Code promo</span>
                  <input
                    type="text"
                    name="codePromo"
                    value={editForm.codePromo}
                    onChange={updateEditField}
                  />
                </label>

                <div className="admin-order-panel__actions">
                  <button type="submit" disabled={isEditSaving}>
                    <FiSave aria-hidden="true" />
                    {isEditSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                  <button className="is-secondary" type="button" onClick={closeOrderPanel}>
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </section>
  )
}

export default OrdersTable

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiX } from 'react-icons/fi'
import { API_BASE_URL } from '../apiConfig'
import '../Css/CheckoutModal.css'

const initialForm = {
  fullName: '',
  phone: '',
  city: '',
  address: '',
  promoCode: '',
}

const getErrorMessage = async (response) => {
  try {
    const data = await response.json()
    return data.message || 'Une erreur est survenue'
  } catch {
    return 'Une erreur est survenue'
  }
}

const CheckoutModal = ({
  isOpen,
  onClose,
  onOrderCreated,
  productImage = '',
  productName = 'Pack Yanglam',
  productPrice = 229,
}) => {
  const [formData, setFormData] = useState(initialForm)
  const [hasPromoCode, setHasPromoCode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const firstInputRef = useRef(null)
  const closeTimeoutRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    firstInputRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isSubmitting, onClose])

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  if (!isOpen) {
    return null
  }

  const updateField = (event) => {
    const { name, value } = event.target

    setSubmitError('')
    setSubmitSuccess('')
    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const togglePromoCode = (event) => {
    const checked = event.target.checked

    setSubmitError('')
    setSubmitSuccess('')
    setHasPromoCode(checked)

    if (!checked) {
      setFormData((currentForm) => ({
        ...currentForm,
        promoCode: '',
      }))
    }
  }

  const closeModal = () => {
    if (isSubmitting) {
      return
    }

    onClose()
  }

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      closeModal()
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setSubmitError('')
      setSubmitSuccess('')

      const payload = {
        nom: formData.fullName.trim(),
        telephone: formData.phone.trim(),
        ville: formData.city.trim(),
        adresse: formData.address.trim(),
        codePromo: hasPromoCode ? formData.promoCode.trim() : '',
      }

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      const createdOrder = await response.json()

      setSubmitSuccess('Votre commande a été envoyée avec succès.')
      setFormData(initialForm)
      setHasPromoCode(false)
      onOrderCreated?.(createdOrder)

      closeTimeoutRef.current = window.setTimeout(() => {
        setSubmitSuccess('')
        onClose()
      }, 900)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <div className="checkout-modal-overlay" onMouseDown={handleOverlayClick}>
      <section
        className="checkout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
      >
        <button
          className="checkout-modal__close"
          type="button"
          onClick={closeModal}
          aria-label="Fermer"
          disabled={isSubmitting}
        >
          <FiX aria-hidden="true" />
        </button>

        <header
          className={`checkout-modal__header ${productImage ? '' : 'checkout-modal__header--no-image'}`}
        >
          {productImage && (
            <div className="checkout-modal__product-image">
              <img src={productImage} alt={productName} loading="lazy" decoding="async" />
            </div>
          )}
          <div>
            <p>Votre commande</p>
            <h2 id="checkout-modal-title">{productName}</h2>
            <strong>{productPrice} DHS</strong>
          </div>
        </header>

        <form className="checkout-modal__form" onSubmit={handleSubmit}>
          {submitError && (
            <p className="checkout-modal__feedback checkout-modal__feedback--error">
              {submitError}
            </p>
          )}
          {submitSuccess && (
            <p className="checkout-modal__feedback checkout-modal__feedback--success">
              {submitSuccess}
            </p>
          )}

          <label>
            <span>Nom et Prénom</span>
            <input
              ref={firstInputRef}
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={updateField}
              placeholder="Votre nom complet"
              disabled={isSubmitting}
              required
            />
          </label>

          <label>
            <span>Téléphone</span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={updateField}
              placeholder="+212 6 00 00 00 00"
              disabled={isSubmitting}
              required
            />
          </label>

          <label>
            <span>Ville</span>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={updateField}
              placeholder="Votre ville"
              disabled={isSubmitting}
              required
            />
          </label>

          <label>
            <span>Adresse complète</span>
            <textarea
              name="address"
              value={formData.address}
              onChange={updateField}
              placeholder="Rue, quartier, numéro..."
              rows="2"
              disabled={isSubmitting}
              required
            />
          </label>

          <label className="checkout-modal__promo-toggle">
            <input
              type="checkbox"
              checked={hasPromoCode}
              onChange={togglePromoCode}
              disabled={isSubmitting}
            />
            <span>J'ai un code promo</span>
          </label>

          {hasPromoCode && (
            <label className="checkout-modal__promo-input">
              <span>Code promo</span>
              <input
                type="text"
                name="promoCode"
                value={formData.promoCode}
                onChange={updateField}
                placeholder="Ex: YANGLAM10"
                disabled={isSubmitting}
              />
            </label>
          )}

          <button className="checkout-modal__submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'ENVOI EN COURS...' : 'CONFIRMER LA COMMANDE'}
          </button>
        </form>
      </section>
    </div>,
    document.body,
  )
}

export default CheckoutModal

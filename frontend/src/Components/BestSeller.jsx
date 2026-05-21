import { useEffect, useRef, useState } from 'react'
import { FiCheck, FiShoppingBag } from 'react-icons/fi'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CheckoutModal from './CheckoutModal'

gsap.registerPlugin(ScrollTrigger)

const defaultBestSellerSettings = {
  badgeText: 'BEST SELLER',
  name: 'Pack Yanglam',
  price: 229,
  description:
    'Blush Framboise Naturel, Musc Tahara 100% Original, longue tenue et parfum élégant.',
  image: '',
  features: [
    'Blush naturel, sans taches',
    'Effet bonne mine instantané',
    'Musc tahara, parfum propre et élégant',
    'Parfum qui reste même après la douche',
  ],
}

const getOldPrice = (price) => Math.ceil(Number(price || 0) * 1.3)

const BestSeller = ({ settings = defaultBestSellerSettings }) => {
  const bestSellerRef = useRef(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [failedImageUrl, setFailedImageUrl] = useState('')
  const bestSellerSettings = {
    ...defaultBestSellerSettings,
    ...settings,
    features:
      Array.isArray(settings.features) && settings.features.length
        ? settings.features
        : defaultBestSellerSettings.features,
  }
  const hasCloudflareImage = Boolean(bestSellerSettings.image)
  const productPrice = Number(bestSellerSettings.price || defaultBestSellerSettings.price)
  const oldPrice = getOldPrice(productPrice)
  const imageFailed = hasCloudflareImage && failedImageUrl === bestSellerSettings.image
  const shouldShowProductImage = hasCloudflareImage && !imageFailed

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(['.best-seller-card__image', '.best-seller-animate-right'], {
          autoAlpha: 1,
          x: 0,
        })
        return
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: bestSellerRef.current,
          start: 'top 76%',
          once: true,
        },
        defaults: {
          duration: 0.9,
          ease: 'power3.out',
        },
      })

      if (shouldShowProductImage) {
        timeline.fromTo(
          '.best-seller-card__image',
          { autoAlpha: 0, x: -50 },
          { autoAlpha: 1, x: 0 },
        )
      }

      timeline.fromTo(
        '.best-seller-animate-right',
        { autoAlpha: 0, x: 50 },
        { autoAlpha: 1, x: 0, stagger: 0.1 },
        shouldShowProductImage ? '-=0.58' : 0,
      )
    }, bestSellerRef)

    return () => ctx.revert()
  }, [shouldShowProductImage])

  return (
    <>
      <section
        className={`best-seller-card ${shouldShowProductImage ? '' : 'best-seller-card--no-image'}`}
        id="pack-yanglam"
        ref={bestSellerRef}
      >
        {shouldShowProductImage && (
          <div className="best-seller-card__image">
            <img
              src={bestSellerSettings.image}
              alt={`${bestSellerSettings.name} Best Seller`}
              loading="lazy"
              decoding="async"
              onError={() => {
                if (hasCloudflareImage) {
                  setFailedImageUrl(bestSellerSettings.image)
                }
              }}
            />
          </div>
        )}

        <div className="best-seller-card__content">
          <p className="section-kicker best-seller-animate-right">
            {bestSellerSettings.badgeText}
          </p>
          <h2 className="best-seller-animate-right">{bestSellerSettings.name}</h2>
          <p className="best-seller-card__subtitle best-seller-animate-right">
            {bestSellerSettings.description}
          </p>

          <ul className="best-seller-animate-right">
            {bestSellerSettings.features.map((benefit) => (
              <li key={benefit}>
                <FiCheck aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>

          <div className="best-seller-card__price best-seller-animate-right">
            <span>{oldPrice} DHS</span>
            <strong>{productPrice} DHS</strong>
          </div>
          <button
            className="yl-button yl-button--primary best-seller-animate-right"
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
          >
            COMMANDER MAINTENANT
            <FiShoppingBag aria-hidden="true" />
          </button>
        </div>
      </section>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        productImage={shouldShowProductImage ? bestSellerSettings.image : ''}
        productName={bestSellerSettings.name}
        productPrice={productPrice}
      />
    </>
  )
}

export default BestSeller

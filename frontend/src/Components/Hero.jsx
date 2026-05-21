import { useEffect, useRef, useState } from 'react'
import { FaStar } from 'react-icons/fa'
import { FiArrowRight } from 'react-icons/fi'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const defaultHeroSettings = {
  badgeText: 'NOUVEAU PACK',
  title: "L'ÉLÉGANCE au naturel",
  description:
    'Blush framboise & Musc Tahara. Le duo essentiel pour révéler votre beauté, chaque jour.',
  image: '',
}

const splitHeroTitle = (title) => {
  const safeTitle = title || defaultHeroSettings.title
  const naturalIndex = safeTitle.toLowerCase().indexOf('au naturel')

  if (naturalIndex === -1) {
    return {
      main: safeTitle,
      accent: '',
    }
  }

  return {
    main: safeTitle.slice(0, naturalIndex).trim(),
    accent: safeTitle.slice(naturalIndex).trim(),
  }
}

const Hero = ({ settings = defaultHeroSettings }) => {
  const heroRef = useRef(null)
  const [failedImageUrl, setFailedImageUrl] = useState('')
  const heroSettings = {
    ...defaultHeroSettings,
    ...settings,
  }
  const titleParts = splitHeroTitle(heroSettings.title)
  const hasCloudflareImage = Boolean(heroSettings.image)
  const imageFailed = hasCloudflareImage && failedImageUrl === heroSettings.image
  const shouldShowHeroImage = hasCloudflareImage && !imageFailed

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(['.hero-animate-up', '.hero-section__image'], { autoAlpha: 1, y: 0 })
        return
      }

      const timeline = gsap.timeline({
        defaults: {
          ease: 'power3.out',
        },
      })

      timeline
        .fromTo(
          '.hero-animate-up',
          { autoAlpha: 0, y: 50 },
          { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.14 },
        )
        .fromTo(
          '.hero-section__image',
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 1.5, ease: 'power2.out' },
          0.08,
        )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="hero-section" id="accueil" ref={heroRef}>
      <div className="hero-section__copy">
        <p className="hero-section__kicker">{heroSettings.badgeText}</p>
        <h1 className="hero-animate-up">
          {titleParts.main}
          {titleParts.accent && <span>{titleParts.accent}</span>}
        </h1>
        <p className="hero-section__description hero-animate-up">{heroSettings.description}</p>

        <div
          className="hero-section__rating hero-animate-up"
          aria-label="5 étoiles, 1500 clientes satisfaites"
        >
          <span>
            {Array.from({ length: 5 }, (_, index) => (
              <FaStar key={index} aria-hidden="true" />
            ))}
          </span>
          <small>+ 1500 clientes satisfaites</small>
        </div>

        <a className="yl-button yl-button--primary hero-animate-up" href="#pack-yanglam">
          DÉCOUVRIR LE PACK
          <FiArrowRight aria-hidden="true" />
        </a>
      </div>

      <div className={`hero-section__image ${shouldShowHeroImage ? '' : 'is-empty'}`}>
        {shouldShowHeroImage && (
          <img
            src={heroSettings.image}
            alt="Pack Yanglam Blush Framboise et Musc Tahara"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onError={() => {
              if (hasCloudflareImage) {
                setFailedImageUrl(heroSettings.image)
              }
            }}
          />
        )}
      </div>
    </section>
  )
}

export default Hero

import { useEffect, useRef } from 'react'
import { FiAward, FiClock, FiHeart } from 'react-icons/fi'
import { PiLeafLight } from 'react-icons/pi'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    title: 'NATUREL',
    text: 'Ingrédients naturels sélectionnés avec soin',
    icon: PiLeafLight,
  },
  {
    title: 'QUALITÉ PREMIUM',
    text: 'Produits testés et approuvés',
    icon: FiAward,
  },
  {
    title: 'LONGUE TENUE',
    text: 'Fraîcheur et parfum qui durent',
    icon: FiClock,
  },
  {
    title: 'ÉLÉGANCE QUOTIDIENNE',
    text: 'Pour toutes les femmes, en toutes occasions',
    icon: FiHeart,
  },
]

const Features = () => {
  const featuresRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('.feature-item', { autoAlpha: 1, y: 0 })
        return
      }

      gsap.fromTo(
        '.feature-item',
        { autoAlpha: 0, y: 36 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.14,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 82%',
            once: true,
          },
        },
      )
    }, featuresRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="features-panel" aria-label="Avantages Yanglam" ref={featuresRef}>
      {features.map(({ title, text, icon: Icon }) => (
        <article className="feature-item" key={title}>
          <Icon aria-hidden="true" />
          <h2>{title}</h2>
          <p>{text}</p>
        </article>
      ))}
    </section>
  )
}

export default Features

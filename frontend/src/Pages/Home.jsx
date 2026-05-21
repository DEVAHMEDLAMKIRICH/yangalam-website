import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Hero from '../Components/Hero'
import '../Css/Home.css'
import { API_BASE_URL } from '../apiConfig'
import { resolveStoredImageUrl } from '../imageUrl'

const Navbar = lazy(() => import('../Components/Navbar'))
const Features = lazy(() => import('../Components/Features'))
const BestSeller = lazy(() => import('../Components/BestSeller'))
const BeforeAfter = lazy(() => import('../Components/BeforeAfter'))
const Testimonials = lazy(() => import('../Components/Testimonials'))
const InstaFeed = lazy(() => import('../Components/InstaFeed'))
const TrustBadges = lazy(() => import('../Components/TrustBadges'))
const Footer = lazy(() => import('../Components/Footer'))

const defaultHomeSettings = {
  hero: {
    badgeText: 'NOUVEAU PACK',
    title: "L'ÉLÉGANCE au naturel",
    description:
      'Blush framboise & Musc Tahara. Le duo essentiel pour révéler votre beauté, chaque jour.',
    image: '',
  },
  bestSeller: {
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
  },
  beforeAfter: {
    title: 'EFFET NATUREL EN QUELQUES SECONDES',
    pairs: [],
  },
  testimonials: {
    title: 'ELLES ONT ADOPTE YANGLAM',
    items: [],
  },
  instagram: {
    title: 'REJOIGNEZ-NOUS SUR INSTAGRAM',
    handle: '@YANGLAM',
    buttonText: 'SUIVRE @YANGLAM',
    images: [],
  },
  display: {
    showNavbar: false,
    showFooter: false,
  },
}

const mergeHomeSettings = (apiSettings) => ({
  hero: {
    ...defaultHomeSettings.hero,
    ...(apiSettings?.hero || {}),
    image: resolveStoredImageUrl(apiSettings?.hero?.image || ''),
  },
  bestSeller: {
    ...defaultHomeSettings.bestSeller,
    ...(apiSettings?.bestSeller || {}),
    image: resolveStoredImageUrl(apiSettings?.bestSeller?.image || ''),
    features:
      Array.isArray(apiSettings?.bestSeller?.features) && apiSettings.bestSeller.features.length
        ? apiSettings.bestSeller.features
        : defaultHomeSettings.bestSeller.features,
  },
  beforeAfter: {
    ...defaultHomeSettings.beforeAfter,
    ...(apiSettings?.beforeAfter || {}),
    pairs: Array.isArray(apiSettings?.beforeAfter?.pairs)
      ? apiSettings.beforeAfter.pairs.map((pair) => ({
          ...pair,
          beforeImage: resolveStoredImageUrl(pair.beforeImage || ''),
          afterImage: resolveStoredImageUrl(pair.afterImage || ''),
        }))
      : defaultHomeSettings.beforeAfter.pairs,
  },
  testimonials: {
    ...defaultHomeSettings.testimonials,
    ...(apiSettings?.testimonials || {}),
    items: Array.isArray(apiSettings?.testimonials?.items)
      ? apiSettings.testimonials.items
      : defaultHomeSettings.testimonials.items,
  },
  instagram: {
    ...defaultHomeSettings.instagram,
    ...(apiSettings?.instagram || {}),
    images: Array.isArray(apiSettings?.instagram?.images)
      ? apiSettings.instagram.images.map((image) => ({
          ...image,
          image: resolveStoredImageUrl(image.image || ''),
        }))
      : defaultHomeSettings.instagram.images,
  },
  display: {
    ...defaultHomeSettings.display,
    ...(apiSettings?.display || {}),
  },
})

const HomeSectionLoader = () => (
  <div className="home-lazy-loader" aria-hidden="true">
    <span />
  </div>
)

const LazyHomeSection = ({ children, minHeight = 180 }) => {
  const sectionRef = useRef(null)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (shouldRender) {
      return undefined
    }

    const sectionNode = sectionRef.current

    if (!sectionNode) {
      setShouldRender(true)
      return undefined
    }

    let timeoutId

    const checkSectionPosition = () => {
      const sectionTop = sectionNode.getBoundingClientRect().top
      const preloadDistance = window.innerHeight + 520

      if (sectionTop <= preloadDistance) {
        setShouldRender(true)
      }
    }

    const scheduleCheck = () => {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(checkSectionPosition, 60)
    }

    checkSectionPosition()
    window.addEventListener('scroll', scheduleCheck, { passive: true })
    window.addEventListener('resize', scheduleCheck)

    return () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener('scroll', scheduleCheck)
      window.removeEventListener('resize', scheduleCheck)
    }
  }, [shouldRender])

  return (
    <div
      className="home-lazy-boundary"
      ref={sectionRef}
      style={{ '--home-lazy-min-height': `${minHeight}px` }}
    >
      {shouldRender ? (
        <Suspense fallback={<HomeSectionLoader />}>{children}</Suspense>
      ) : (
        <HomeSectionLoader />
      )}
    </div>
  )
}

const Home = () => {
  const [homeSettings, setHomeSettings] = useState(defaultHomeSettings)
  const hasBeforeAfterImages = homeSettings.beforeAfter.pairs.some(
    (pair) => pair.beforeImage && pair.afterImage,
  )
  const hasInstagramImages = homeSettings.instagram.images.some((image) => image.image)

  useEffect(() => {
    const controller = new AbortController()

    const fetchHomeSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          return
        }

        const data = await response.json()

        if (!controller.signal.aborted) {
          setHomeSettings(mergeHomeSettings(data))
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setHomeSettings(defaultHomeSettings)
        }
      }
    }

    fetchHomeSettings()

    return () => {
      controller.abort()
    }
  }, [])

  return (
    <div className="home-page">
      <div className="home-page__scale">
        {homeSettings.display.showNavbar && (
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
        )}
        <Hero settings={homeSettings.hero} />
        <LazyHomeSection minHeight={142}>
          <Features />
        </LazyHomeSection>
        <LazyHomeSection minHeight={420}>
          <BestSeller settings={homeSettings.bestSeller} />
        </LazyHomeSection>
        {hasBeforeAfterImages && (
          <LazyHomeSection minHeight={340}>
            <BeforeAfter settings={homeSettings.beforeAfter} />
          </LazyHomeSection>
        )}
        <LazyHomeSection minHeight={260}>
          <Testimonials settings={homeSettings.testimonials} />
        </LazyHomeSection>
        {hasInstagramImages && (
          <LazyHomeSection minHeight={280}>
            <InstaFeed settings={homeSettings.instagram} />
          </LazyHomeSection>
        )}
        <LazyHomeSection minHeight={82}>
          <TrustBadges />
        </LazyHomeSection>
        {homeSettings.display.showFooter && (
          <LazyHomeSection minHeight={300}>
            <Footer />
          </LazyHomeSection>
        )}
      </div>
    </div>
  )
}

export default Home

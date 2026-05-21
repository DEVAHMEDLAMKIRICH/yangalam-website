import { useEffect, useRef, useState } from 'react'
import {
  FiArrowDown,
  FiArrowUp,
  FiImage,
  FiPlus,
  FiSave,
  FiSettings,
  FiTrash2,
  FiUploadCloud,
} from 'react-icons/fi'
import { API_BASE_URL } from '../apiConfig'
import { getStoredImageKey, resolveStoredImageUrl } from '../imageUrl'

const ACTIVE_SETTINGS_TAB_STORAGE_KEY = 'yanglam-admin-settings-active-tab'
const SETTINGS_TABS = ['hero', 'bestSeller', 'beforeAfter', 'testimonials', 'instagram']

const getInitialActiveSettingsTab = () => {
  try {
    const storedTab = localStorage.getItem(ACTIVE_SETTINGS_TAB_STORAGE_KEY)

    if (SETTINGS_TABS.includes(storedTab)) {
      return storedTab
    }
  } catch {
    return 'hero'
  }

  return 'hero'
}

const initialSettings = {
  heroEyebrow: 'NOUVEAU PACK',
  heroTitle: "L'ÉLÉGANCE au naturel",
  heroDescription:
    'Blush framboise & Musc Tahara. Le duo essentiel pour révéler votre beauté, chaque jour.',
  heroImageUrl: '',
  productEyebrow: 'BEST SELLER',
  productName: 'Pack Yanglam',
  productPrice: '229',
  productDescription:
    'Blush Framboise Naturel, Musc Tahara 100% Original, longue tenue et parfum élégant.',
  productImageUrl: '',
  beforeAfterTitle: 'EFFET NATUREL EN QUELQUES SECONDES',
  testimonialsTitle: 'ELLES ONT ADOPTE YANGLAM',
  instagramTitle: 'REJOIGNEZ-NOUS SUR INSTAGRAM',
  instagramHandle: '@YANGLAM',
  instagramButtonText: 'SUIVRE @YANGLAM',
}

const initialProductFeatures = [
  'Blush naturel, sans taches',
  'Effet bonne mine instantané',
  'Musc tahara, parfum propre et élégant',
  'Parfum qui reste même après la douche',
]

const initialBeforeAfterPairs = [
  { beforeLabel: 'AVANT', beforeImage: '', afterLabel: 'APRES', afterImage: '' },
  { beforeLabel: 'AVANT', beforeImage: '', afterLabel: 'APRES', afterImage: '' },
]

const initialTestimonials = [
  {
    name: 'Sara L.',
    text: "Le musc tahara est juste incroyable, l'odeur reste toute la journee meme apres la douche !",
  },
  {
    name: 'Meryem B.',
    text: "Le blush donne un effet bonne mine naturel, sans taches. J'adore !",
  },
  {
    name: 'Imane K.',
    text: 'Pack complet a prix abordable, ideal pour moi et comme idee cadeau.',
  },
]

const initialInstagramImages = [
  { image: '', alt: 'Pack Yanglam dans son coffret' },
  { image: '', alt: 'Blush Yanglam framboise' },
  { image: '', alt: 'Produit Yanglam sur Instagram' },
  { image: '', alt: 'Routine beaute Yanglam' },
  { image: '', alt: 'Inspiration beaute Yanglam' },
]

const initialFiles = {
  heroImage: {
    file: null,
    name: '',
    url: '',
    uploadedUrl: '',
    isPending: false,
    isMissing: false,
  },
  productImage: {
    file: null,
    name: '',
    url: '',
    uploadedUrl: '',
    isPending: false,
    isMissing: false,
  },
}

const getErrorMessage = async (response) => {
  try {
    const data = await response.json()
    return data.message || 'Une erreur est survenue'
  } catch {
    return 'Une erreur est survenue'
  }
}

const uploadImageFile = async (file, folder) => {
  const formData = new FormData()
  formData.append('folder', folder)
  formData.append('image', file)

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  const data = await response.json()

  if (!data.url) {
    throw new Error("Le serveur n'a pas retourné l'URL de l'image")
  }

  return data.key || data.url
}

const createStoredFileState = (imageUrl, label) => {
  const imageKey = getStoredImageKey(imageUrl || '') || imageUrl || ''

  return {
    file: null,
    name: imageKey ? label : '',
    url: resolveStoredImageUrl(imageKey),
    uploadedUrl: imageKey,
    isPending: false,
    isMissing: false,
  }
}

const PageSettings = () => {
  const [activeTab, setActiveTab] = useState(getInitialActiveSettingsTab)
  const [settings, setSettings] = useState(initialSettings)
  const [files, setFiles] = useState(initialFiles)
  const [newFeature, setNewFeature] = useState('')
  const [productFeatures, setProductFeatures] = useState(initialProductFeatures)
  const [beforeAfterPairs, setBeforeAfterPairs] = useState(initialBeforeAfterPairs)
  const [testimonialItems, setTestimonialItems] = useState(initialTestimonials)
  const [instagramImages, setInstagramImages] = useState(initialInstagramImages)
  const [showNavbar, setShowNavbar] = useState(false)
  const [showFooter, setShowFooter] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDisplaySaving, setIsDisplaySaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const objectUrlsRef = useRef({})

  function applyApiSettings(data) {
    const heroImageUrl = getStoredImageKey(data?.hero?.image || '') || data?.hero?.image || ''
    const productImageUrl =
      getStoredImageKey(data?.bestSeller?.image || '') || data?.bestSeller?.image || ''
    const heroPreviewUrl = resolveStoredImageUrl(heroImageUrl)
    const productPreviewUrl = resolveStoredImageUrl(productImageUrl)
    const nextBeforeAfterPairs =
      Array.isArray(data?.beforeAfter?.pairs) && data.beforeAfter.pairs.length
        ? data.beforeAfter.pairs.map((pair, index) => ({
            ...initialBeforeAfterPairs[index],
            ...pair,
            beforeImage: getStoredImageKey(pair.beforeImage || '') || pair.beforeImage || '',
            afterImage: getStoredImageKey(pair.afterImage || '') || pair.afterImage || '',
          }))
        : initialBeforeAfterPairs
    const nextTestimonials =
      Array.isArray(data?.testimonials?.items) && data.testimonials.items.length
        ? data.testimonials.items
        : initialTestimonials
    const nextInstagramImages =
      Array.isArray(data?.instagram?.images) && data.instagram.images.length
        ? data.instagram.images.map((image, index) => ({
            ...initialInstagramImages[index],
            ...image,
            image: getStoredImageKey(image.image || '') || image.image || '',
          }))
        : initialInstagramImages

    setSettings({
      heroEyebrow: data?.hero?.badgeText || initialSettings.heroEyebrow,
      heroTitle: data?.hero?.title || initialSettings.heroTitle,
      heroDescription: data?.hero?.description || initialSettings.heroDescription,
      heroImageUrl,
      productEyebrow: data?.bestSeller?.badgeText || initialSettings.productEyebrow,
      productName: data?.bestSeller?.name || initialSettings.productName,
      productPrice: String(data?.bestSeller?.price ?? initialSettings.productPrice),
      productDescription: data?.bestSeller?.description || initialSettings.productDescription,
      productImageUrl,
      beforeAfterTitle: data?.beforeAfter?.title || initialSettings.beforeAfterTitle,
      testimonialsTitle: data?.testimonials?.title || initialSettings.testimonialsTitle,
      instagramTitle: data?.instagram?.title || initialSettings.instagramTitle,
      instagramHandle: data?.instagram?.handle || initialSettings.instagramHandle,
      instagramButtonText: data?.instagram?.buttonText || initialSettings.instagramButtonText,
    })

    setProductFeatures(
      Array.isArray(data?.bestSeller?.features) && data.bestSeller.features.length
        ? data.bestSeller.features
        : initialProductFeatures,
    )
    setBeforeAfterPairs(nextBeforeAfterPairs)
    setTestimonialItems(nextTestimonials)
    setInstagramImages(nextInstagramImages)
    setShowNavbar(Boolean(data?.display?.showNavbar))
    setShowFooter(Boolean(data?.display?.showFooter))
    const nextFiles = {
      heroImage: {
        file: null,
        name: heroImageUrl ? 'Image actuelle du Hero' : '',
        url: heroPreviewUrl,
        uploadedUrl: heroImageUrl,
        isPending: false,
        isMissing: false,
      },
      productImage: {
        file: null,
        name: productImageUrl ? 'Image actuelle du produit' : '',
        url: productPreviewUrl,
        uploadedUrl: productImageUrl,
        isPending: false,
        isMissing: false,
      },
    }

    nextBeforeAfterPairs.forEach((pair, index) => {
      nextFiles[`beforeAfterBefore${index + 1}`] = createStoredFileState(
        pair.beforeImage,
        `Avant ${index + 1}`,
      )
      nextFiles[`beforeAfterAfter${index + 1}`] = createStoredFileState(
        pair.afterImage,
        `Apres ${index + 1}`,
      )
    })
    nextInstagramImages.forEach((image, index) => {
      nextFiles[`instagramImage${index + 1}`] = createStoredFileState(
        image.image,
        `Instagram ${index + 1}`,
      )
    })

    setFiles(nextFiles)
  }

  useEffect(() => {
    const controller = new AbortController()

    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response = await fetch(`${API_BASE_URL}/settings`, {
          credentials: 'include',
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(await getErrorMessage(response))
        }

        const data = await response.json()
        applyApiSettings(data)
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

    fetchSettings()

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    const objectUrls = objectUrlsRef.current

    return () => {
      Object.values(objectUrls).forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

  const updateSetting = (event) => {
    const { name, value } = event.target

    setSettings((currentSettings) => ({
      ...currentSettings,
      [name]: value,
    }))
  }

  const updateDisplaySetting = async (fieldName, value) => {
    const previousDisplay = {
      showNavbar,
      showFooter,
    }
    const nextDisplay = {
      ...previousDisplay,
      [fieldName]: value,
    }

    setShowNavbar(nextDisplay.showNavbar)
    setShowFooter(nextDisplay.showFooter)
    setError('')
    setSuccessMessage('')
    setIsDisplaySaving(true)

    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display: nextDisplay,
        }),
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      const data = await response.json()
      setShowNavbar(Boolean(data?.display?.showNavbar))
      setShowFooter(Boolean(data?.display?.showFooter))
      setSuccessMessage("Paramètres d'affichage sauvegardés.")
    } catch (displayError) {
      setShowNavbar(previousDisplay.showNavbar)
      setShowFooter(previousDisplay.showFooter)
      setError(displayError.message)
    } finally {
      setIsDisplaySaving(false)
    }
  }

  const updateFile = (event) => {
    const { name, files: selectedFiles } = event.target
    const selectedFile = selectedFiles?.[0]

    setSuccessMessage('')
    setError('')

    if (objectUrlsRef.current[name]) {
      URL.revokeObjectURL(objectUrlsRef.current[name])
      objectUrlsRef.current[name] = ''
    }

    if (!selectedFile) {
      setFiles((currentFiles) => ({
        ...currentFiles,
        [name]: {
          ...(currentFiles[name] || {}),
          file: null,
          name: currentFiles[name]?.uploadedUrl ? currentFiles[name].name : '',
          url: resolveStoredImageUrl(currentFiles[name]?.uploadedUrl || ''),
          isPending: false,
          isMissing: false,
        },
      }))
      return
    }

    const previewUrl = URL.createObjectURL(selectedFile)
    objectUrlsRef.current[name] = previewUrl

    setFiles((currentFiles) => ({
      ...currentFiles,
      [name]: {
        file: selectedFile,
        name: selectedFile.name,
        url: previewUrl,
        uploadedUrl: currentFiles[name]?.uploadedUrl || '',
        isPending: true,
        isMissing: false,
      },
    }))
    setSuccessMessage('Image sélectionnée. Elle sera uploadée après la sauvegarde.')
  }

  const markImageMissing = (fieldName) => {
    setFiles((currentFiles) => ({
      ...currentFiles,
      [fieldName]: {
        ...currentFiles[fieldName],
        file: null,
        url: '',
        isPending: false,
        isMissing: Boolean(currentFiles[fieldName]?.uploadedUrl),
      },
    }))
  }

  const addFeature = () => {
    const trimmedFeature = newFeature.trim()

    if (!trimmedFeature) {
      return
    }

    setProductFeatures((currentFeatures) => [...currentFeatures, trimmedFeature])
    setNewFeature('')
  }

  const removeFeature = (featureIndex) => {
    setProductFeatures((currentFeatures) =>
      currentFeatures.filter((_, index) => index !== featureIndex),
    )
  }

  const moveFeature = (featureIndex, direction) => {
    setProductFeatures((currentFeatures) => {
      const targetIndex = featureIndex + direction

      if (targetIndex < 0 || targetIndex >= currentFeatures.length) {
        return currentFeatures
      }

      const nextFeatures = [...currentFeatures]
      const currentFeature = nextFeatures[featureIndex]
      nextFeatures[featureIndex] = nextFeatures[targetIndex]
      nextFeatures[targetIndex] = currentFeature

      return nextFeatures
    })
  }

  const handleFeatureKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addFeature()
    }
  }

  const updateBeforeAfterPair = (pairIndex, fieldName, value) => {
    setBeforeAfterPairs((currentPairs) =>
      currentPairs.map((pair, index) =>
        index === pairIndex
          ? {
              ...pair,
              [fieldName]: value,
            }
          : pair,
      ),
    )
  }

  const updateTestimonial = (testimonialIndex, fieldName, value) => {
    setTestimonialItems((currentItems) =>
      currentItems.map((item, index) =>
        index === testimonialIndex
          ? {
              ...item,
              [fieldName]: value,
            }
          : item,
      ),
    )
  }

  const updateInstagramImage = (imageIndex, fieldName, value) => {
    setInstagramImages((currentImages) =>
      currentImages.map((image, index) =>
        index === imageIndex
          ? {
              ...image,
              [fieldName]: value,
            }
          : image,
      ),
    )
  }

  const renderUploadPreview = (fieldName, alt) => (
    <>
      {files[fieldName]?.isPending && (
        <p className="admin-upload-note">Preview uniquement. Upload après sauvegarde.</p>
      )}

      {files[fieldName]?.url && (
        <div className="admin-image-preview">
          <img
            src={files[fieldName].url}
            alt={alt}
            onError={() => markImageMissing(fieldName)}
          />
        </div>
      )}

      {files[fieldName]?.isMissing && (
        <p className="admin-upload-note admin-upload-note--warning">
          Image introuvable dans Cloudflare. Choisissez une nouvelle image puis sauvegardez.
        </p>
      )}
    </>
  )

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setIsSaving(true)
      setError('')
      setSuccessMessage('')

      const heroImageUrl = files.heroImage.file
        ? await uploadImageFile(files.heroImage.file, 'homepage/hero')
        : settings.heroImageUrl
      const productImageUrl = files.productImage.file
        ? await uploadImageFile(files.productImage.file, 'homepage/best-seller')
        : settings.productImageUrl
      const beforeAfterPayload = await Promise.all(
        beforeAfterPairs.map(async (pair, index) => {
          const beforeField = `beforeAfterBefore${index + 1}`
          const afterField = `beforeAfterAfter${index + 1}`

          return {
            beforeLabel: pair.beforeLabel,
            beforeImage: files[beforeField]?.file
              ? await uploadImageFile(files[beforeField].file, 'homepage/before-after')
              : pair.beforeImage,
            afterLabel: pair.afterLabel,
            afterImage: files[afterField]?.file
              ? await uploadImageFile(files[afterField].file, 'homepage/before-after')
              : pair.afterImage,
          }
        }),
      )
      const instagramPayload = await Promise.all(
        instagramImages.map(async (image, index) => {
          const imageField = `instagramImage${index + 1}`

          return {
            alt: image.alt,
            image: files[imageField]?.file
              ? await uploadImageFile(files[imageField].file, 'homepage/instagram')
              : image.image,
          }
        }),
      )

      const payload = {
        hero: {
          badgeText: settings.heroEyebrow,
          title: settings.heroTitle,
          description: settings.heroDescription,
          image: heroImageUrl,
        },
        bestSeller: {
          badgeText: settings.productEyebrow,
          name: settings.productName,
          price: Number(settings.productPrice) || 0,
          description: settings.productDescription,
          image: productImageUrl,
          features: productFeatures,
        },
        beforeAfter: {
          title: settings.beforeAfterTitle,
          pairs: beforeAfterPayload,
        },
        testimonials: {
          title: settings.testimonialsTitle,
          items: testimonialItems,
        },
        instagram: {
          title: settings.instagramTitle,
          handle: settings.instagramHandle,
          buttonText: settings.instagramButtonText,
          images: instagramPayload,
        },
        display: {
          showNavbar,
          showFooter,
        },
      }

      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      const data = await response.json()
      applyApiSettings(data)
      setSuccessMessage('Modifications sauvegardées avec succès.')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const isBusy = isLoading || isSaving

  const changeActiveTab = (tabName) => {
    setActiveTab(tabName)

    try {
      localStorage.setItem(ACTIVE_SETTINGS_TAB_STORAGE_KEY, tabName)
    } catch {
      // Ignore storage errors; tab switching still works without persistence.
    }
  }

  if (isLoading) {
    return (
      <form className="admin-settings">
        <div className="admin-settings__grid">
          <section className="admin-settings-card">
            <div className="admin-settings-card__heading">
              <p>Chargement</p>
              <h2>Paramètres de la page</h2>
            </div>
            <p className="admin-state-message">Chargement des paramètres depuis le serveur...</p>
          </section>
        </div>
      </form>
    )
  }

  return (
    <form className="admin-settings" onSubmit={handleSubmit}>
      {error && <p className="admin-feedback admin-feedback--error">{error}</p>}
      {successMessage && <p className="admin-feedback admin-feedback--success">{successMessage}</p>}

      <div className="admin-settings-tabs" role="tablist" aria-label="Paramètres de page">
        <button
          className={activeTab === 'hero' ? 'is-active' : ''}
          type="button"
          role="tab"
          aria-selected={activeTab === 'hero'}
          onClick={() => changeActiveTab('hero')}
        >
          Modifier Hero
        </button>
        <button
          className={activeTab === 'bestSeller' ? 'is-active' : ''}
          type="button"
          role="tab"
          aria-selected={activeTab === 'bestSeller'}
          onClick={() => changeActiveTab('bestSeller')}
        >
          Modifier Best Seller
        </button>
        <button
          className={activeTab === 'beforeAfter' ? 'is-active' : ''}
          type="button"
          role="tab"
          aria-selected={activeTab === 'beforeAfter'}
          onClick={() => changeActiveTab('beforeAfter')}
        >
          Modifier Avant / Après
        </button>
        <button
          className={activeTab === 'testimonials' ? 'is-active' : ''}
          type="button"
          role="tab"
          aria-selected={activeTab === 'testimonials'}
          onClick={() => changeActiveTab('testimonials')}
        >
          Modifier Avis
        </button>
        <button
          className={activeTab === 'instagram' ? 'is-active' : ''}
          type="button"
          role="tab"
          aria-selected={activeTab === 'instagram'}
          onClick={() => changeActiveTab('instagram')}
        >
          Modifier Instagram
        </button>
      </div>

      <div className="admin-settings__grid">
        {activeTab === 'hero' && (
          <section className="admin-settings-card" role="tabpanel">
            <div className="admin-settings-card__icon">
              <FiImage aria-hidden="true" />
            </div>
            <div className="admin-settings-card__heading">
              <p>Card 1</p>
              <h2>Hero Section</h2>
            </div>

            <label className="admin-file-field">
              <span>Image du Hero</span>
              <input
                type="file"
                name="heroImage"
                accept="image/*"
                onChange={updateFile}
                disabled={isSaving}
              />
              <strong>
                <FiUploadCloud aria-hidden="true" />
                {files.heroImage.name || 'Choisir une image'}
              </strong>
            </label>

            {files.heroImage.isPending && (
              <p className="admin-upload-note">Preview uniquement. Upload après sauvegarde.</p>
            )}

            {files.heroImage.url && (
              <div className="admin-image-preview">
                <img
                  src={files.heroImage.url}
                  alt="Aperçu Hero"
                  onError={() => markImageMissing('heroImage')}
                />
              </div>
            )}

            {files.heroImage.isMissing && (
              <p className="admin-upload-note admin-upload-note--warning">
                Image introuvable dans Cloudflare. Choisissez une nouvelle image puis sauvegardez.
              </p>
            )}

            <label className="admin-input-field">
              <span>Petit texte au-dessus du titre</span>
              <input
                type="text"
                name="heroEyebrow"
                value={settings.heroEyebrow}
                onChange={updateSetting}
                placeholder="NOUVEAU PACK"
              />
            </label>

            <label className="admin-input-field">
              <span>Titre principal</span>
              <input
                type="text"
                name="heroTitle"
                value={settings.heroTitle}
                onChange={updateSetting}
                placeholder="Titre du Hero"
              />
            </label>

            <label className="admin-input-field">
              <span>Description du Hero</span>
              <textarea
                name="heroDescription"
                value={settings.heroDescription}
                onChange={updateSetting}
                placeholder="Blush framboise & Musc Tahara. Le duo essentiel pour révéler votre beauté, chaque jour."
                rows="4"
              />
            </label>
          </section>
        )}

        {activeTab === 'bestSeller' && (
          <section className="admin-settings-card" role="tabpanel">
            <div className="admin-settings-card__icon">
              <FiImage aria-hidden="true" />
            </div>
            <div className="admin-settings-card__heading">
              <p>Card 2</p>
              <h2>Best Seller Product</h2>
            </div>

            <label className="admin-file-field">
              <span>Image du produit</span>
              <input
                type="file"
                name="productImage"
                accept="image/*"
                onChange={updateFile}
                disabled={isSaving}
              />
              <strong>
                <FiUploadCloud aria-hidden="true" />
                {files.productImage.name || 'Choisir une image'}
              </strong>
            </label>

            {files.productImage.isPending && (
              <p className="admin-upload-note">Preview uniquement. Upload après sauvegarde.</p>
            )}

            {files.productImage.url && (
              <div className="admin-image-preview">
                <img
                  src={files.productImage.url}
                  alt="Aperçu produit"
                  onError={() => markImageMissing('productImage')}
                />
              </div>
            )}

            {files.productImage.isMissing && (
              <p className="admin-upload-note admin-upload-note--warning">
                Image introuvable dans Cloudflare. Choisissez une nouvelle image puis sauvegardez.
              </p>
            )}

            <label className="admin-input-field">
              <span>Petit texte au-dessus du produit</span>
              <input
                type="text"
                name="productEyebrow"
                value={settings.productEyebrow}
                onChange={updateSetting}
                placeholder="BEST SELLER"
              />
            </label>

            <label className="admin-input-field">
              <span>Nom du produit</span>
              <input
                type="text"
                name="productName"
                value={settings.productName}
                onChange={updateSetting}
                placeholder="Nom du produit"
              />
            </label>

            <label className="admin-input-field">
              <span>Prix (DHS)</span>
              <input
                type="number"
                name="productPrice"
                value={settings.productPrice}
                onChange={updateSetting}
                placeholder="229"
                min="0"
              />
            </label>

            <label className="admin-input-field">
              <span>Description / Features</span>
              <textarea
                name="productDescription"
                value={settings.productDescription}
                onChange={updateSetting}
                placeholder="Description et points forts du produit"
                rows="4"
              />
            </label>

            <div className="admin-feature-manager">
              <div className="admin-feature-manager__top">
                <span>Liste des features</span>
                <small>{productFeatures.length} éléments</small>
              </div>

              <div className="admin-feature-form">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(event) => setNewFeature(event.target.value)}
                  onKeyDown={handleFeatureKeyDown}
                  placeholder="Ajouter une nouvelle feature"
                />
                <button type="button" onClick={addFeature}>
                  <FiPlus aria-hidden="true" />
                  Ajouter
                </button>
              </div>

              <ul className="admin-feature-list">
                {productFeatures.map((feature, index) => (
                  <li className="admin-feature-item" key={`${feature}-${index}`}>
                    <span>{feature}</span>
                    <div className="admin-feature-actions">
                      <button
                        type="button"
                        onClick={() => moveFeature(index, -1)}
                        disabled={index === 0}
                        aria-label="Monter la feature"
                      >
                        <FiArrowUp aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFeature(index, 1)}
                        disabled={index === productFeatures.length - 1}
                        aria-label="Descendre la feature"
                      >
                        <FiArrowDown aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        aria-label="Supprimer la feature"
                      >
                        <FiTrash2 aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {activeTab === 'beforeAfter' && (
          <section className="admin-settings-card" role="tabpanel">
            <div className="admin-settings-card__icon">
              <FiImage aria-hidden="true" />
            </div>
            <div className="admin-settings-card__heading">
              <p>Section</p>
              <h2>Effet naturel</h2>
            </div>

            <label className="admin-input-field">
              <span>Titre de la section</span>
              <input
                type="text"
                name="beforeAfterTitle"
                value={settings.beforeAfterTitle}
                onChange={updateSetting}
                placeholder="EFFET NATUREL EN QUELQUES SECONDES"
              />
            </label>

            <div className="admin-nested-list">
              {beforeAfterPairs.map((pair, index) => (
                <div className="admin-nested-card" key={`before-after-${index}`}>
                  <div className="admin-feature-manager__top">
                    <span>Bloc Avant / Après {index + 1}</span>
                    <small>2 images</small>
                  </div>

                  <div className="admin-two-column-fields">
                    <label className="admin-input-field">
                      <span>Label Avant</span>
                      <input
                        type="text"
                        value={pair.beforeLabel}
                        onChange={(event) =>
                          updateBeforeAfterPair(index, 'beforeLabel', event.target.value)
                        }
                      />
                    </label>

                    <label className="admin-input-field">
                      <span>Label Après</span>
                      <input
                        type="text"
                        value={pair.afterLabel}
                        onChange={(event) =>
                          updateBeforeAfterPair(index, 'afterLabel', event.target.value)
                        }
                      />
                    </label>
                  </div>

                  <div className="admin-two-column-fields">
                    <label className="admin-file-field">
                      <span>Image Avant</span>
                      <input
                        type="file"
                        name={`beforeAfterBefore${index + 1}`}
                        accept="image/*"
                        onChange={updateFile}
                        disabled={isSaving}
                      />
                      <strong>
                        <FiUploadCloud aria-hidden="true" />
                        {files[`beforeAfterBefore${index + 1}`]?.name || 'Choisir une image'}
                      </strong>
                    </label>

                    <label className="admin-file-field">
                      <span>Image Après</span>
                      <input
                        type="file"
                        name={`beforeAfterAfter${index + 1}`}
                        accept="image/*"
                        onChange={updateFile}
                        disabled={isSaving}
                      />
                      <strong>
                        <FiUploadCloud aria-hidden="true" />
                        {files[`beforeAfterAfter${index + 1}`]?.name || 'Choisir une image'}
                      </strong>
                    </label>
                  </div>

                  <div className="admin-preview-row">
                    {renderUploadPreview(`beforeAfterBefore${index + 1}`, `Aperçu avant ${index + 1}`)}
                    {renderUploadPreview(`beforeAfterAfter${index + 1}`, `Aperçu apres ${index + 1}`)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'testimonials' && (
          <section className="admin-settings-card" role="tabpanel">
            <div className="admin-settings-card__icon">
              <FiSettings aria-hidden="true" />
            </div>
            <div className="admin-settings-card__heading">
              <p>Section</p>
              <h2>Avis clientes</h2>
            </div>

            <label className="admin-input-field">
              <span>Titre de la section</span>
              <input
                type="text"
                name="testimonialsTitle"
                value={settings.testimonialsTitle}
                onChange={updateSetting}
                placeholder="ELLES ONT ADOPTE YANGLAM"
              />
            </label>

            <div className="admin-nested-list">
              {testimonialItems.map((testimonial, index) => (
                <div className="admin-nested-card" key={`testimonial-${index}`}>
                  <div className="admin-feature-manager__top">
                    <span>Avis {index + 1}</span>
                    <small>Nom + message</small>
                  </div>

                  <label className="admin-input-field">
                    <span>Nom de la cliente</span>
                    <input
                      type="text"
                      value={testimonial.name}
                      onChange={(event) => updateTestimonial(index, 'name', event.target.value)}
                    />
                  </label>

                  <label className="admin-input-field">
                    <span>Texte de l'avis</span>
                    <textarea
                      value={testimonial.text}
                      onChange={(event) => updateTestimonial(index, 'text', event.target.value)}
                      rows="4"
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'instagram' && (
          <section className="admin-settings-card" role="tabpanel">
            <div className="admin-settings-card__icon">
              <FiImage aria-hidden="true" />
            </div>
            <div className="admin-settings-card__heading">
              <p>Section</p>
              <h2>Instagram Feed</h2>
            </div>

            <label className="admin-input-field">
              <span>Titre de la section</span>
              <input
                type="text"
                name="instagramTitle"
                value={settings.instagramTitle}
                onChange={updateSetting}
                placeholder="REJOIGNEZ-NOUS SUR INSTAGRAM"
              />
            </label>

            <div className="admin-two-column-fields">
              <label className="admin-input-field">
                <span>Handle Instagram</span>
                <input
                  type="text"
                  name="instagramHandle"
                  value={settings.instagramHandle}
                  onChange={updateSetting}
                  placeholder="@YANGLAM"
                />
              </label>

              <label className="admin-input-field">
                <span>Texte du bouton</span>
                <input
                  type="text"
                  name="instagramButtonText"
                  value={settings.instagramButtonText}
                  onChange={updateSetting}
                  placeholder="SUIVRE @YANGLAM"
                />
              </label>
            </div>

            <div className="admin-nested-list">
              {instagramImages.map((image, index) => (
                <div className="admin-nested-card" key={`instagram-${index}`}>
                  <div className="admin-feature-manager__top">
                    <span>Image Instagram {index + 1}</span>
                    <small>WebP après sauvegarde</small>
                  </div>

                  <label className="admin-file-field">
                    <span>Image</span>
                    <input
                      type="file"
                      name={`instagramImage${index + 1}`}
                      accept="image/*"
                      onChange={updateFile}
                      disabled={isSaving}
                    />
                    <strong>
                      <FiUploadCloud aria-hidden="true" />
                      {files[`instagramImage${index + 1}`]?.name || 'Choisir une image'}
                    </strong>
                  </label>

                  {renderUploadPreview(`instagramImage${index + 1}`, `Aperçu Instagram ${index + 1}`)}

                  <label className="admin-input-field">
                    <span>Texte alternatif</span>
                    <input
                      type="text"
                      value={image.alt}
                      onChange={(event) => updateInstagramImage(index, 'alt', event.target.value)}
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="admin-settings-card admin-display-settings-card">
          <div className="admin-settings-card__icon">
            <FiSettings aria-hidden="true" />
          </div>
          <div className="admin-settings-card__heading">
            <p>Global Settings</p>
            <h2>Paramètres d'affichage</h2>
          </div>

          <div className="admin-toggle-list">
            <label className="admin-toggle-option">
              <span className="admin-toggle-copy">
                <strong>Afficher la barre de navigation (Navbar)</strong>
                <small>Active ou masque le menu principal sur la landing page.</small>
              </span>
              <span className="admin-toggle-switch">
                <input
                  type="checkbox"
                  checked={showNavbar}
                  onChange={(event) => updateDisplaySetting('showNavbar', event.target.checked)}
                  disabled={isDisplaySaving}
                />
                <span className="admin-toggle-slider" aria-hidden="true" />
              </span>
            </label>

            <label className="admin-toggle-option">
              <span className="admin-toggle-copy">
                <strong>Afficher le pied de page (Footer)</strong>
                <small>Active ou masque le footer complet de la landing page.</small>
              </span>
              <span className="admin-toggle-switch">
                <input
                  type="checkbox"
                  checked={showFooter}
                  onChange={(event) => updateDisplaySetting('showFooter', event.target.checked)}
                  disabled={isDisplaySaving}
                />
                <span className="admin-toggle-slider" aria-hidden="true" />
              </span>
            </label>
          </div>
        </section>
      </div>

      <button className="admin-save-button" type="submit" disabled={isBusy}>
        <FiSave aria-hidden="true" />
        {isSaving ? 'UPLOAD ET SAUVEGARDE...' : 'SAUVEGARDER LES MODIFICATIONS'}
      </button>
    </form>
  )
}

export default PageSettings

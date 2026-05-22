import { FaInstagram } from 'react-icons/fa'

const defaultSettings = {
  title: 'REJOIGNEZ-NOUS SUR INSTAGRAM',
  handle: '@YANGLAM',
  buttonText: 'SUIVRE @YANGLAM',
  images: [],
}

const InstaFeed = ({ settings = defaultSettings }) => {
  const sectionSettings = {
    ...defaultSettings,
    ...settings,
  }
  const visibleImages = Array.isArray(sectionSettings.images)
    ? sectionSettings.images.filter((image) => image.image)
    : []

  if (!visibleImages.length) {
    return null
  }

  return (
    <section className="instagram-section">
      <h2>{sectionSettings.title}</h2>
      <p>{sectionSettings.handle}</p>

      <div className="instagram-grid">
        {visibleImages.map((image, index) => (
          <div className="instagram-tile" key={`${image.alt || 'instagram'}-${index}`}>
            <img
              src={image.image}
              alt={image.alt}
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>

      <a className="instagram-button" target="_blank"
        rel="noopener noreferrer" href="https://www.instagram.com/yanglam_officiel/">
        <FaInstagram aria-hidden="true" />
        {sectionSettings.buttonText}
      </a>
    </section>
  )
}

export default InstaFeed

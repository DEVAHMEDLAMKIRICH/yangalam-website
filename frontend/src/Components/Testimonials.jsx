import { FaStar } from 'react-icons/fa'
import { FiArrowLeft, FiArrowRight, FiHeart } from 'react-icons/fi'

const testimonials = [
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

const defaultSettings = {
  title: 'ELLES ONT ADOPTE YANGLAM',
  items: testimonials,
}

const Testimonials = ({ settings = defaultSettings }) => {
  const sectionSettings = {
    ...defaultSettings,
    ...settings,
    items:
      Array.isArray(settings.items) && settings.items.length ? settings.items : defaultSettings.items,
  }

  return (
    <section className="testimonials-section">
      <h2>{sectionSettings.title}</h2>
      <div className="section-ornament" aria-hidden="true" />

      <div className="testimonials-shell">
        <button className="round-arrow" type="button" aria-label="Avis precedent">
          <FiArrowLeft aria-hidden="true" />
        </button>

        <div className="testimonials-grid">
          {sectionSettings.items.map((testimonial) => (
            <article className="testimonial-card" key={testimonial.name}>
              <div className="testimonial-card__top">
                <div className="testimonial-card__avatar">{testimonial.name.charAt(0)}</div>
                <div>
                  <h3>{testimonial.name}</h3>
                  <div className="testimonial-card__stars" aria-label="5 etoiles">
                    {Array.from({ length: 5 }, (_, starIndex) => (
                      <FaStar key={starIndex} aria-hidden="true" />
                    ))}
                  </div>
                </div>
              </div>
              <p>"{testimonial.text}"</p>
              <FiHeart className="testimonial-card__heart" aria-hidden="true" />
            </article>
          ))}
        </div>

        <button className="round-arrow" type="button" aria-label="Avis suivant">
          <FiArrowRight aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

export default Testimonials

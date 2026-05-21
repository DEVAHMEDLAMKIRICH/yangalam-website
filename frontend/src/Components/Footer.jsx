import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa'
import logo from '../assets/logo.PNG'

const quickLinks = ['Accueil', 'Boutique', 'Nos produits', 'À propos', 'Contact']
const products = ['Pack Yanglam', 'Blush Framboise', 'Musc Tahara', 'Tous les produits']

const Footer = () => {
  return (
    <footer className="landing-footer">
      <div className="landing-footer__inner">
        <div className="landing-footer__brand">
          <img src={logo} alt="Yanglam" loading="lazy" decoding="async" />
          <p>
            Yanglam, l'élégance au naturel. Des produits de qualité pour révéler la beauté de
            chaque femme.
          </p>
        </div>

        <nav aria-label="Liens rapides">
          <h2>LIENS RAPIDES</h2>
          {quickLinks.map((link) => (
            <a href={`#${link.toLowerCase().replaceAll(' ', '-')}`} key={link}>
              {link}
            </a>
          ))}
        </nav>

        <nav aria-label="Nos produits">
          <h2>NOS PRODUITS</h2>
          {products.map((product) => (
            <a href={`#${product.toLowerCase().replaceAll(' ', '-')}`} key={product}>
              {product}
            </a>
          ))}
        </nav>

        <div className="landing-footer__contact">
          <h2>SUIVEZ-NOUS</h2>
          <div className="landing-footer__socials">
            <a href="#instagram" aria-label="Instagram">
              <FaInstagram aria-hidden="true" />
            </a>
            <a href="#tiktok" aria-label="TikTok">
              <FaTiktok aria-hidden="true" />
            </a>
            <a href="#facebook" aria-label="Facebook">
              <FaFacebookF aria-hidden="true" />
            </a>
          </div>

          <h2>CONTACT</h2>
          <a className="whatsapp-link" href="https://wa.me/212600000000">
            <FaWhatsapp aria-hidden="true" />
            +212 6 00 00 00 00
          </a>
        </div>
      </div>

      <div className="landing-footer__bottom">
        <span>© 2024 Yanglam. Tous droits réservés.</span>
        <span>Mentions légales | Politique de confidentialité</span>
      </div>
    </footer>
  )
}

export default Footer

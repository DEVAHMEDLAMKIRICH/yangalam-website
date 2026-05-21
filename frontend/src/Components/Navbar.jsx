import { FiSearch, FiShoppingBag, FiUser } from 'react-icons/fi'
import logo from '../assets/logo.PNG'

const links = ['ACCUEIL', 'BOUTIQUE', 'NOS PRODUITS', 'À PROPOS', 'CONTACT']

const Navbar = () => {
  return (
    <header className="landing-navbar">
      <a className="landing-navbar__logo" href="#accueil" aria-label="Yanglam accueil">
        <img src={logo} alt="Yanglam" />
      </a>

      <nav className="landing-navbar__links" aria-label="Navigation principale">
        {links.map((link) => (
          <a href={`#${link.toLowerCase().replaceAll(' ', '-')}`} key={link}>
            {link}
          </a>
        ))}
      </nav>

      <div className="landing-navbar__actions">
        <button type="button" aria-label="Rechercher">
          <FiSearch aria-hidden="true" />
        </button>
        <button type="button" aria-label="Compte client">
          <FiUser aria-hidden="true" />
        </button>
        <button type="button" aria-label="Panier">
          <FiShoppingBag aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}

export default Navbar

import { FaWhatsapp } from 'react-icons/fa'
import '../Css/WhatsAppFloat.css'

const WHATSAPP_NUMBER = '212600000000'
const WHATSAPP_MESSAGE = 'Salam, bghit nswel 3la Pack Yanglam'

const WhatsAppFloat = ({ variant = 'home' }) => {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE,
  )}`

  return (
    <a
      className={`whatsapp-float whatsapp-float--${variant}`}
      // href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Contacter Yanglam sur WhatsApp"
    >
      <FaWhatsapp aria-hidden="true" />
      <span>WhatsApp</span>
    </a>
  )
}

export default WhatsAppFloat

import { FiHeadphones, FiRefreshCw, FiShield, FiTruck } from 'react-icons/fi'

const badges = [
  {
    title: 'LIVRAISON PARTOUT AU MAROC',
    icon: FiTruck,
  },
  {
    title: 'PAIEMENT À LA LIVRAISON',
    icon: FiShield,
  },
  {
    title: 'SATISFAIT OU REMBOURSÉ 7 JOURS',
    icon: FiRefreshCw,
  },
  {
    title: 'SERVICE CLIENT RÉACTIF',
    icon: FiHeadphones,
  },
]

const TrustBadges = () => {
  return (
    <section className="trust-badges" aria-label="Garanties de confiance">
      {badges.map(({ title, icon: Icon }) => (
        <article className="trust-badge" key={title}>
          <Icon aria-hidden="true" />
          <h2>{title}</h2>
        </article>
      ))}
    </section>
  )
}

export default TrustBadges

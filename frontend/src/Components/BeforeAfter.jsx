const defaultSettings = {
  title: 'EFFET NATUREL EN QUELQUES SECONDES',
  pairs: [],
}

const BeforeAfter = ({ settings = defaultSettings }) => {
  const sectionSettings = {
    ...defaultSettings,
    ...settings,
  }
  const visiblePairs = Array.isArray(sectionSettings.pairs)
    ? sectionSettings.pairs.filter((pair) => pair.beforeImage && pair.afterImage)
    : []

  if (!visiblePairs.length) {
    return null
  }

  return (
    <section className="before-after-section">
      <h2>{sectionSettings.title}</h2>
      <div className="section-ornament" aria-hidden="true" />

      <div className="before-after-grid">
        {visiblePairs.map((pair, pairIndex) => (
          <div className="before-after-pair" key={pairIndex}>
            <div className="before-after-box">
              <img
                src={pair.beforeImage}
                alt="Avant application Yanglam"
                loading="lazy"
                decoding="async"
              />
              <span>{pair.beforeLabel || 'AVANT'}</span>
            </div>
            <div className="before-after-box">
              <img
                src={pair.afterImage}
                alt="Apres application Yanglam"
                loading="lazy"
                decoding="async"
              />
              <span>{pair.afterLabel || 'APRES'}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default BeforeAfter

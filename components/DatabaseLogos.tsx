export default function DatabaseLogos() {
  return (
    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60 hover:opacity-80 transition-opacity">
      {/* arXiv */}
      <div className="flex items-center grayscale hover:grayscale-0 transition">
        <svg width="80" height="32" viewBox="0 0 80 32" fill="none">
          <text x="0" y="24" fontFamily="serif" fontSize="20" fontWeight="bold" fill="#B31B1B">
            arχiv
          </text>
        </svg>
      </div>

      {/* CrossRef */}
      <div className="flex items-center grayscale hover:grayscale-0 transition">
        <svg width="100" height="32" viewBox="0 0 100 32" fill="none">
          <path d="M8 8L16 16L8 24" stroke="#F0AD4E" strokeWidth="3" strokeLinecap="round"/>
          <path d="M24 8L16 16L24 24" stroke="#F0AD4E" strokeWidth="3" strokeLinecap="round"/>
          <text x="32" y="22" fontFamily="sans-serif" fontSize="14" fontWeight="600" fill="#333">
            Crossref
          </text>
        </svg>
      </div>

      {/* OpenAlex */}
      <div className="flex items-center grayscale hover:grayscale-0 transition">
        <svg width="110" height="32" viewBox="0 0 110 32" fill="none">
          <circle cx="12" cy="16" r="8" fill="#000" fillOpacity="0.8"/>
          <path d="M12 8L12 24M4 16L20 16" stroke="white" strokeWidth="2"/>
          <text x="28" y="22" fontFamily="sans-serif" fontSize="14" fontWeight="600" fill="#333">
            OpenAlex
          </text>
        </svg>
      </div>

      {/* PubMed */}
      <div className="flex items-center grayscale hover:grayscale-0 transition">
        <svg width="90" height="32" viewBox="0 0 90 32" fill="none">
          <rect x="0" y="8" width="16" height="16" rx="2" fill="#336699"/>
          <text x="20" y="22" fontFamily="sans-serif" fontSize="14" fontWeight="600" fill="#336699">
            PubMed
          </text>
        </svg>
      </div>

      {/* Semantic Scholar */}
      <div className="flex items-center grayscale hover:grayscale-0 transition">
        <svg width="140" height="32" viewBox="0 0 140 32" fill="none">
          <path d="M8 24L16 8L24 24" fill="#1857B6" fillOpacity="0.8"/>
          <text x="32" y="22" fontFamily="sans-serif" fontSize="14" fontWeight="600" fill="#1857B6">
            Semantic Scholar
          </text>
        </svg>
      </div>
    </div>
  )
}


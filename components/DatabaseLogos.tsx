export default function DatabaseLogos() {
  return (
    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-10">
      {/* arXiv */}
      <div className="grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
        <svg width="100" height="40" viewBox="0 0 100 40" fill="none">
          <text x="10" y="28" fontFamily="'Computer Modern', serif" fontSize="24" fontWeight="bold" fill="#B31B1B">
            arχiv
          </text>
        </svg>
      </div>

      {/* CrossRef */}
      <div className="grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
        <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
          <g transform="translate(0, 8)">
            <path d="M8 8L16 16L8 24" stroke="#F6A800" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M24 8L16 16L24 24" stroke="#F6A800" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
          <text x="36" y="26" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="600" fill="#2F3542">
            Crossref
          </text>
        </svg>
      </div>

      {/* OpenAlex */}
      <div className="grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
        <svg width="130" height="40" viewBox="0 0 130 40" fill="none">
          <g transform="translate(0, 8)">
            <circle cx="16" cy="12" r="10" fill="#FF6B35" opacity="0.9"/>
            <circle cx="16" cy="12" r="6" fill="white"/>
            <circle cx="16" cy="12" r="3" fill="#FF6B35"/>
          </g>
          <text x="36" y="26" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="600" fill="#2F3542">
            OpenAlex
          </text>
        </svg>
      </div>

      {/* PubMed */}
      <div className="grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
        <svg width="110" height="40" viewBox="0 0 110 40" fill="none">
          <g transform="translate(0, 8)">
            <rect x="4" y="4" width="20" height="20" rx="3" fill="#326295"/>
            <path d="M14 10v12M10 14h8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </g>
          <text x="32" y="26" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="600" fill="#326295">
            PubMed
          </text>
        </svg>
      </div>

      {/* Semantic Scholar */}
      <div className="grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
        <svg width="170" height="40" viewBox="0 0 170 40" fill="none">
          <g transform="translate(0, 8)">
            <circle cx="14" cy="14" r="12" fill="#1857B6"/>
            <path d="M14 6L20 18H8L14 6Z" fill="white"/>
          </g>
          <text x="32" y="26" fontFamily="Arial, sans-serif" fontSize="15" fontWeight="600" fill="#1857B6">
            Semantic Scholar
          </text>
        </svg>
      </div>
    </div>
  )
}

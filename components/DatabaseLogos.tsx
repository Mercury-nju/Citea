export default function DatabaseLogos() {
  return (
    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
      {/* arXiv */}
      <div className="transition-all duration-300 hover:scale-110 opacity-90 hover:opacity-100">
        <svg width="120" height="50" viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="10" y="35" fontFamily="'Computer Modern', 'Times New Roman', serif" fontSize="32" fontWeight="bold" fill="#B31B1B">
            arXiv
          </text>
        </svg>
      </div>

      {/* CrossRef */}
      <div className="transition-all duration-300 hover:scale-110 opacity-90 hover:opacity-100">
        <svg width="140" height="50" viewBox="0 0 140 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0, 10)">
            <path d="M10 10L20 20L10 30" stroke="#F6A800" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M30 10L20 20L30 30" stroke="#F6A800" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </g>
          <text x="48" y="32" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="700" fill="#2F3542" letterSpacing="-0.5px">
            Crossref
          </text>
        </svg>
      </div>

      {/* OpenAlex */}
      <div className="transition-all duration-300 hover:scale-110 opacity-90 hover:opacity-100">
        <svg width="150" height="50" viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0, 10)">
            <circle cx="20" cy="15" r="14" fill="#FF6B35"/>
            <circle cx="20" cy="15" r="8" fill="white"/>
            <circle cx="20" cy="15" r="4" fill="#FF6B35"/>
          </g>
          <text x="48" y="32" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="700" fill="#2F3542" letterSpacing="-0.5px">
            OpenAlex
          </text>
        </svg>
      </div>

      {/* PubMed */}
      <div className="transition-all duration-300 hover:scale-110 opacity-90 hover:opacity-100">
        <svg width="130" height="50" viewBox="0 0 130 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0, 10)">
            <rect x="5" y="5" width="24" height="24" rx="4" fill="#326295"/>
            <path d="M17 12v14M11 19h12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </g>
          <text x="38" y="32" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="700" fill="#326295" letterSpacing="-0.5px">
            PubMed
          </text>
        </svg>
      </div>

      {/* Semantic Scholar */}
      <div className="transition-all duration-300 hover:scale-110 opacity-90 hover:opacity-100">
        <svg width="200" height="50" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0, 10)">
            <circle cx="18" cy="18" r="15" fill="#1857B6"/>
            <path d="M18 8L26 22H10L18 8Z" fill="white"/>
          </g>
          <text x="42" y="32" fontFamily="Arial, sans-serif" fontSize="17" fontWeight="700" fill="#1857B6" letterSpacing="-0.5px">
            Semantic Scholar
          </text>
        </svg>
      </div>
    </div>
  )
}

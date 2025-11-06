interface LogoProps {
  variant?: 'light' | 'dark'
}

export default function Logo({ variant = 'light' }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Logo Icon */}
      <div className="relative w-8 h-8">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Abstract C shape with modern twist */}
          <path
            d="M16 4C9.373 4 4 9.373 4 16C4 22.627 9.373 28 16 28C18.5 28 20.8 27.2 22.7 25.8"
            stroke="url(#gradient1)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M28 16C28 12.5 26.5 9.3 24 7.2"
            stroke="url(#gradient2)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="16" cy="16" r="4" fill="url(#gradient3)" />
          
          <defs>
            <linearGradient id="gradient1" x1="4" y1="16" x2="22.7" y2="25.8" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6" />
              <stop offset="1" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="gradient2" x1="24" y1="7.2" x2="28" y2="16" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" />
              <stop offset="1" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="gradient3" x1="12" y1="12" x2="20" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" />
              <stop offset="1" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Logo Text */}
      <span className={`text-xl font-bold ${
        variant === 'dark' 
          ? 'text-white' 
          : 'bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'
      }`}>
        Citea
      </span>
    </div>
  )
}

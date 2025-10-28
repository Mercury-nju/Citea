'use client'

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 8C4 5.79086 5.79086 4 8 4H24C26.2091 4 28 5.79086 28 8V24C28 26.2091 26.2091 28 24 28H8C5.79086 28 4 26.2091 4 24V8Z" fill="#3B82F6"/>
        <path d="M10 12C10 11.4477 10.4477 11 11 11H13C13.5523 11 14 11.4477 14 12V12C14 12.5523 13.5523 13 13 13H11C10.4477 13 10 12.5523 10 12V12Z" fill="white"/>
        <path d="M10 16C10 15.4477 10.4477 15 11 15H17C17.5523 15 18 15.4477 18 16V16C18 16.5523 17.5523 17 17 17H11C10.4477 17 10 16.5523 10 16V16Z" fill="white"/>
        <path d="M10 20C10 19.4477 10.4477 19 11 19H21C21.5523 19 22 19.4477 22 20V20C22 20.5523 21.5523 21 21 21H11C10.4477 21 10 20.5523 10 20V20Z" fill="white"/>
      </svg>
      
      {/* Logo Text */}
      <span className="text-2xl font-bold tracking-tight text-gray-900">
        Citea
      </span>
    </div>
  )
}


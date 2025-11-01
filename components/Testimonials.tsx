'use client'

import { Star } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const testimonials = [
  [
    {
      quote: "Citea has revolutionized how I verify citations in student papers. The AI detection of fabricated references is incredibly accurate and saves me hours of manual checking.",
      author: "Dr. Sarah Chen",
      role: "Professor of Biology, Stanford University",
      rating: 5
    },
    {
      quote: "Citea helped me avoid citing fake papers that I found online. The real-time verification as I write has made my research process so much more reliable.",
      author: "Emily Thompson",
      role: "Undergraduate Researcher, UCLA",
      rating: 5
    }
  ],
  [
    {
      quote: "As someone writing a dissertation, Citea gives me confidence that every citation in my work is legitimate. The database integration is seamless and the verification reports are thorough.",
      author: "Sophia Rodriguez",
      role: "PhD Candidate, MIT",
      rating: 5
    },
    {
      quote: "I recommend Citea to all researchers in our institution. The integration with existing reference managers and the comprehensive source verification make it indispensable.",
      author: "Dr. Aisha Patel",
      role: "Research Librarian, Oxford University",
      rating: 5
    }
  ],
  [
    {
      quote: "For our large research team, Citea ensures consistency in citation standards across all publications. The collaborative features make it easy to maintain our citation library.",
      author: "Prof. Elena Kowalski",
      role: "Research Director, Max Planck Institute",
      rating: 5
    },
    {
      quote: "Citea has become an essential tool in our peer review process. It helps us quickly identify submissions with questionable citations, maintaining the integrity of published research.",
      author: "Marcus Lee",
      role: "Journal Editor, Nature Communications",
      rating: 5
    }
  ]
]

export default function Testimonials() {
  const { t } = useLanguage()

  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t.testimonials.title}
          </h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            {t.testimonials.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((column, colIndex) => (
            <div key={colIndex} className="space-y-6">
              {column.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:shadow-xl hover:border-blue-400/50 transition-all duration-300 group"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-white/90 mb-6 leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{testimonial.author}</p>
                      <p className="text-sm text-blue-200">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

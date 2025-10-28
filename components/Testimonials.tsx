'use client'

const testimonials = [
  [
    {
      quote: "Citea has revolutionized how I verify citations in student papers. The AI detection of fabricated references is incredibly accurate and saves me hours of manual checking.",
      author: "Dr. Sarah Chen",
      role: "Professor of Biology, Stanford University"
    },
    {
      quote: "Citea helped me avoid citing fake papers that I found online. The real-time verification as I write has made my research process so much more reliable.",
      author: "Emily Thompson",
      role: "Undergraduate Researcher, UCLA"
    }
  ],
  [
    {
      quote: "As someone writing a dissertation, Citea gives me confidence that every citation in my work is legitimate. The database integration is seamless and the verification reports are thorough.",
      author: "Sophia Rodriguez",
      role: "PhD Candidate, MIT"
    },
    {
      quote: "I recommend Citea to all researchers in our institution. The integration with existing reference managers and the comprehensive source verification make it indispensable.",
      author: "Dr. Aisha Patel",
      role: "Research Librarian, Oxford University"
    }
  ],
  [
    {
      quote: "For our large research team, Citea ensures consistency in citation standards across all publications. The collaborative features make it easy to maintain our citation library.",
      author: "Prof. Elena Kowalski",
      role: "Research Director, Max Planck Institute"
    },
    {
      quote: "Citea has become an essential tool in our peer review process. It helps us quickly identify submissions with questionable citations, maintaining the integrity of published research.",
      author: "Marcus Lee",
      role: "Journal Editor, Nature Communications"
    }
  ]
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Trusted by researchers worldwide.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how Citea is helping students, academics, and researchers maintain the highest standards of citation integrity in their work.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((column, colIndex) => (
            <div key={colIndex} className="space-y-6">
              {column.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition"
                >
                  <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
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


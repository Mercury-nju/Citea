'use client'

import { useLanguage } from '@/contexts/LanguageContext'

const earlyAccessQuotes = [
  {
    quote: 'Finally, a tool that can tell whether my citation actually exists — this saves hours.',
    author: 'Dr. Maria K.',
    role: 'Early Beta Researcher'
  },
  {
    quote: 'Citea has become part of my daily writing workflow. It’s like fact-checking for references.',
    author: 'John P.',
    role: 'Graduate Student, Early Access'
  },
  {
    quote: 'As someone reviewing student papers, I love how quickly Citea flags fabricated sources.',
    author: 'Dr. L. Nguyen',
    role: 'Lecturer, Early Access'
  }
]

export default function Testimonials() {
  const { t } = useLanguage()

  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.testimonials.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.testimonials.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {earlyAccessQuotes.map((item, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300"
            >
              <p className="text-gray-800 mb-6 leading-relaxed">“{item.quote}”</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {item.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.author}</p>
                  <p className="text-sm text-gray-600">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-10">
          Based on early feedback from beta users and research professionals.
        </p>

        <div className="text-center mt-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Join the Citea Early Access Program</h3>
          <p className="text-gray-600">Help us shape the future of academic integrity.</p>
        </div>
      </div>
    </section>
  )
}

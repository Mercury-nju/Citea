import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import DetailedFeatures from '@/components/DetailedFeatures'
import Tools from '@/components/Tools'
import Testimonials from '@/components/Testimonials'
import Pricing from '@/components/Pricing'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <DetailedFeatures />
      <Tools />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  )
}


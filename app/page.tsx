import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import DetailedFeatures from '@/components/DetailedFeatures'
import ToolsShowcase from '@/components/ToolsShowcase'
import Testimonials from '@/components/Testimonials'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <DetailedFeatures />
      <ToolsShowcase />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  )
}


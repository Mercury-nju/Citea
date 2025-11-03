import DocumentAssistant from '@/components/DocumentAssistant'

export const metadata = {
  title: 'Document Assistant | Citea',
  description: 'Generate academic paragraphs and get live edit suggestions with AI.',
}

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <DocumentAssistant />
    </main>
  )
}



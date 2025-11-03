import DocumentAssistant from '@/components/DocumentAssistant'

export const metadata = {
  title: 'Document Assistant | Dashboard',
  description: 'AI writing assistant inside dashboard',
}

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <DocumentAssistant />
      </div>
    </main>
  )
}



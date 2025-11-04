export default function SuccessPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment successful</h1>
        <p className="text-gray-600 mb-6">Your subscription is now active. If this page was opened before the webhook finished, your account will be upgraded within a minute.</p>
        <a href="/dashboard" className="inline-block bg-gray-900 text-white px-5 py-3 rounded-lg hover:bg-gray-800">Go to Dashboard</a>
      </div>
    </main>
  )
}



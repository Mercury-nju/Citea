export default function CancelPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Checkout canceled</h1>
        <p className="text-gray-600 mb-6">You can resume the checkout anytime. Your account has not been charged.</p>
        <a href="/pricing" className="inline-block bg-gray-900 text-white px-5 py-3 rounded-lg hover:bg-gray-800">Back to Pricing</a>
      </div>
    </main>
  )
}



export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏗️ Formula PM V3
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Construction Project Management Platform
          </p>
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Project Initialization Complete
            </h2>
            <div className="space-y-2 text-left">
              <p className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                Next.js 15 with App Router
              </p>
              <p className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                TypeScript Configuration
              </p>
              <p className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                Project Structure Ready
              </p>
              <p className="flex items-center text-yellow-600">
                <span className="mr-2">🔄</span>
                Dependencies Installation In Progress
              </p>
              <p className="flex items-center text-gray-500">
                <span className="mr-2">⏳</span>
                Supabase Integration Coming Next
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { MessageCircle, Send, Sparkles, User } from 'lucide-react'

export default function AIAssistantDemo() {
  const [isTyping, setIsTyping] = useState(false)

  const handleDemo = () => {
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 3000)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-4">
          <Sparkles className="text-purple-600" size={20} />
          <span className="text-sm font-semibold text-purple-900">AI Research Assistant</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Intelligent Academic Q&A</h2>
        <p className="text-gray-600">Professional AI assistant answering academic questions and providing citation advice</p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Citea AI Assistant</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Online • Ready to help</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 mb-4 overflow-auto">
          {/* User Message 1 */}
          <div className="flex justify-end">
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-md">
                <p className="text-sm leading-relaxed">
                  How do I cite a journal article with multiple authors in APA format?
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="text-blue-600" size={16} />
              </div>
            </div>
          </div>

          {/* AI Response 1 */}
          <div className="flex justify-start">
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="text-white" size={16} />
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold text-gray-900">AI Assistant</span>
                  <span className="text-xs text-gray-400">Just now</span>
                </div>
                <p className="text-sm text-gray-800 mb-3 leading-relaxed">
                  In APA format, for journal articles with multiple authors, the rules are as follows:
                </p>
                <div className="bg-purple-50 rounded-lg p-3 mb-3 border border-purple-100">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-purple-600 font-bold">1️⃣</span>
                      <span><strong>1-2 authors:</strong> List all author names</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-600 font-bold">2️⃣</span>
                      <span><strong>3-20 authors:</strong> List all author names</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-600 font-bold">3️⃣</span>
                      <span><strong>21+ authors:</strong> First 19 + "..." + last author</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">📝 Example:</p>
                  <p className="text-xs text-gray-700 italic leading-relaxed">
                    Smith, J., Johnson, M., & Williams, K. (2023). Research methods in social sciences. 
                    <em> Journal of Academic Studies</em>, 15(2), 123-145. 
                    https://doi.org/10.1234/example
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Message 2 */}
          <div className="flex justify-end">
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-md">
                <p className="text-sm leading-relaxed">
                  Can you help me verify this citation?
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="text-blue-600" size={16} />
              </div>
            </div>
          </div>

          {/* AI Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="text-white" size={16} />
                </div>
                <div className="bg-white border-2 border-gray-200 rounded-2xl rounded-tl-sm px-5 py-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                    </div>
                    <span className="text-xs text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <input
            type="text"
            placeholder="Enter your academic question..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-sm bg-white focus:border-purple-500 focus:outline-none transition-colors"
            readOnly
          />
          <button 
            onClick={handleDemo}
            disabled={isTyping}
            className={`bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all ${
              isTyping ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:scale-105'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <MessageCircle className="text-purple-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="text-sm font-bold text-purple-900 mb-1">AI Assistant Features</h4>
            <p className="text-xs text-purple-700 leading-relaxed">
              • Answer academic writing questions • Provide citation format advice • Explain research methods • Recommend relevant literature • 24/7 online service
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


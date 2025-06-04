import { Button } from "../../../components/ui/button"



import {
  Globe,
  CheckSquare,
  TrendingUp,
  Lightbulb,
  Layers,
  Users,
  Leaf,
  DollarSign,
  Shield,
  FileText,
} from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#6b9080" }}>
      {/* Header */}
      <header className="bg-white py-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/lumora-logo.png" alt="LUMORA" className="h-12 w-auto" />
          </div>

          <nav className="flex items-center space-x-6">
            <a href="#about" className="text-gray-700 hover:text-gray-900 transition-colors">
              About
            </a>
            <a href="#training" className="text-gray-700 hover:text-gray-900 transition-colors">
              Training Module
            </a>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6">Admin Login</Button>
          </nav>
        </div>
      </header>

      

      {/* How It Works Section */}
      <section className="py-16" style={{ backgroundColor: "#6b9080" }}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-12">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-orange-100 rounded-lg p-6 text-center">
              <div className="w-16 h-16 border-2 border-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="text-xl font-bold text-green-700 mb-2">Explore Scenarios</h3>
              <p className="text-gray-700">Engage with hypothetical yet realistic challenges</p>
            </div>

            <div className="bg-orange-100 rounded-lg p-6 text-center">
              <div className="w-16 h-16 border-2 border-green-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="text-xl font-bold text-green-700 mb-2">Make Decisions</h3>
              <p className="text-gray-700">Answer questions to navigate each scenario</p>
            </div>

            <div className="bg-orange-100 rounded-lg p-6 text-center">
              <div className="w-16 h-16 border-2 border-green-700 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="text-xl font-bold text-green-700 mb-2">Learn and Improve</h3>
              <p className="text-gray-700">Receive feedback and enhance your understanding</p>
            </div>
          </div>
        </div>
      </section>

      {/* Training Modules Section */}
      <section className="bg-green-100 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-green-700 mb-12">Training Modules</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-700">MODULE 1: What Is Sustainability</h3>
                <p className="text-gray-700">Introduction to sustainability and its relevance in tech</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-orange-100 rounded-lg p-4">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-700">MODULE 2: Dimensions of Sustainability</h3>
                <p className="text-gray-700">Environmental, economic, technical and social sustainability</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-700">MODULE 3: Social Sustainability</h3>
                <p className="text-gray-700">Understanding the tech industry's social impact and ethical obligations</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-orange-100 rounded-lg p-4">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-700">MODULE 4: Environmental Impact</h3>
                <p className="text-gray-700">Understanding environmental implications of software development</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-700">MODULE 5: Economic Considerations</h3>
                <p className="text-gray-700">Balancing economic factors with sustainable development practices</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-orange-100 rounded-lg p-4">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-700">MODULE 6: Technical Ethics</h3>
                <p className="text-gray-700">Ethical considerations in technical decision-making processes</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-700">MODULE 7: Implementation Strategies</h3>
                <p className="text-gray-700">Practical approaches to implementing sustainable software practices</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 border-t">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://dal.ca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    • Dalhousie SE Lab
                  </a>
                </li>
                <li>
                  <a href="mailto:contact@lumora.ca" className="text-gray-600 hover:text-gray-800 transition-colors">
                    • Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2">
                <li>
                  <a href="/copyrights" className="text-gray-600 hover:text-gray-800 transition-colors">
                    • Copyrights
                  </a>
                </li>
                <li>
                  <a href="/references" className="text-gray-600 hover:text-gray-800 transition-colors">
                    • References
                  </a>
                </li>
                <li>
                  <a href="/faqs" className="text-gray-600 hover:text-gray-800 transition-colors">
                    • FAQs
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

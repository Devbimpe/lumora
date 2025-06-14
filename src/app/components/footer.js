export default function Footer() {
  return (
    <footer className="bg-white py-8 border-t">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-600 rounded-full mr-3"></span>
                <a href="https://dal.ca" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Dalhousie SE Lab
                </a>
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-600 rounded-full mr-3"></span>
                <a href="mailto:contact@lumora.ca" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-600 rounded-full mr-3"></span>
                <a href="/copyrights" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Copyrights
                </a>
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-600 rounded-full mr-3"></span>
                <a href="/references" className="text-gray-600 hover:text-gray-800 transition-colors">
                  References
                </a>
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-600 rounded-full mr-3"></span>
                <a href="/faqs" className="text-gray-600 hover:text-gray-800 transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
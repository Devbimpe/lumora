import { Button } from "./button"

export default function Header() {
  return (
    <header className="bg-white py-6 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <img src="/lumora-logo.png" alt="LUMORA" className="h-16 w-auto" />
        </div>

        <nav className="flex items-center space-x-8">
          <a href="#about" className="text-gray-700 hover:text-gray-900 transition-colors text-lg">
            About
          </a>
          <a href="#training" className="text-gray-700 hover:text-gray-900 transition-colors text-lg">
            Training Module
          </a>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded text-lg">
            Admin Login
          </Button>
        </nav>
      </div>
    </header>
  )
}

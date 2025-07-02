export default function HowItWorksSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Big heading with inline styles as backup */}
        <h2
          className="text-5xl font-bold text-center text-green-700 mb-16"
          style={{ fontSize: "3rem", fontWeight: "bold", textAlign: "center", color: "#16803D", marginBottom: "4rem" }}
        >
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-orange-100 rounded-lg p-6 text-center">
            <div className="w-16 h-16 border-2 border-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-green-700">🌐</span>
            </div>
            <h3 className="text-xl font-bold text-green-700 mb-2">Explore Scenarios</h3>
            <p className="text-gray-700">Engage with hypothetical yet realistic challenges</p>
          </div>

          <div className="bg-orange-100 rounded-lg p-6 text-center">
            <div className="w-16 h-16 border-2 border-green-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-green-700">✓</span>
            </div>
            <h3 className="text-xl font-bold text-green-700 mb-2">Make Decisions</h3>
            <p className="text-gray-700">Answer questions to navigate each scenario</p>
          </div>

          <div className="bg-orange-100 rounded-lg p-6 text-center">
            <div className="w-16 h-16 border-2 border-green-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-green-700">📈</span>
            </div>
            <h3 className="text-xl font-bold text-green-700 mb-2">Learn and Improve</h3>
            <p className="text-gray-700">Receive feedback and enhance your understanding</p>
          </div>
        </div>
      </div>
    </section>
  )
}

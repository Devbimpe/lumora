export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: "🌐",
      title: "Explore Scenarios",
      description: "Engage with hypothetical yet realistic challenges that mirror real-world tech dilemmas",
    },
    {
      number: "02",
      icon: "✓",
      title: "Make Decisions",
      description: "Answer questions to navigate each scenario and see the impact of your choices",
    },
    {
      number: "03",
      icon: "📈",
      title: "Learn and Improve",
      description: "Receive feedback and enhance your understanding of sustainable software practices",
    },
  ]

  return (
    <section className="py-20 relative overflow-hidden" style={{ 
      background: "linear-gradient(135deg, #FFF8E1 0%, #F0F8F4 100%)"
    }}>
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-100 rounded-full opacity-20 blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-100 rounded-full opacity-20 blur-3xl translate-y-1/2 translate-x-1/2"></div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <h2
          className="text-5xl font-bold text-center text-green-700 mb-16"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "bold", textAlign: "center", color: "#16803D", marginBottom: "4rem" }}
        >
          How this Works?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-1.5 bg-gradient-to-r from-green-500 via-orange-400 to-green-500 opacity-60"></div>
          
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100"
            >
              {/* Icon container */}
              <div className="w-20 h-20 border-2 border-green-700 rounded-full flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-orange-50 to-green-50">
                <span className="text-3xl">{step.icon}</span>
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-green-700 mb-3">{step.title}</h3>
              <p className="text-gray-700 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
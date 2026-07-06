import Link from "next/link"

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: "search",
      title: "Explore Scenarios",
      description: "Engage with hypothetical yet realistic challenges that mirror real-world tech dilemmas",
    },
    {
      number: "02",
      icon: "check",
      title: "Make Decisions",
      description: "Answer questions to navigate each scenario and see the impact of your choices",
    },
    {
      number: "03",
      icon: "trending",
      title: "Learn and Improve",
      description: "Receive feedback and enhance your understanding of sustainable software practices",
    },
  ]

  const renderIcon = (icon) => {
    if (icon === "search") {
      return (
        <svg className="w-7 h-7" fill="none" stroke="#15803D" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
      )
    }
    if (icon === "check") {
      return (
        <svg className="w-7 h-7" fill="none" stroke="#15803D" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l7-7 3 3-9.5 9.5L1 12l3-3 8 8z" />
        </svg>
      )
    }
    return (
      <svg className="w-7 h-7" fill="none" stroke="#15803D" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 6l-9.5 9.5-5-5L1 18" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 6h6v6" />
      </svg>
    )
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2
          className="text-5xl font-bold text-center mb-16"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "bold", textAlign: "center", color: "#16803D", marginBottom: "4rem" }}
        >
          How this Works?
        </h2>

        <div className="grid md:grid-cols-3 gap-6 relative items-start">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <Link href="/training-module" className="flex-1">
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 hover:shadow-md transition-all duration-300 h-full">
                  <div className="w-16 h-16 border-2 rounded-full flex items-center justify-center mx-auto mb-5" style={{ borderColor: "#15803D" }}>
                    {renderIcon(step.icon)}
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: "#15803D" }}>{step.title}</h3>
                </div>
              </Link>

              {index < steps.length - 1 && (
                <div className="hidden md:block w-6 h-px bg-gray-300 mx-1 flex-shrink-0"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
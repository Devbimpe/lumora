"use client"


export default function TrainingModulesSection() {
 

  const learningPoints = [
    "Social sustainability in software development",
    "Designing for equity, accessibility, and well-being",
    "Community engagement and user representation",
    "Handling algorithmic bias and inclusive design challenges",
  ]


  return (
    <section id="training-modules" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2
          className="text-5xl font-bold text-center mb-16"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "bold", textAlign: "center", color: "#16803D", marginBottom: "4rem" }}
        >
          What You'll Learn
        </h2>

        {/* Static checklist boxes matching Figma */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {learningPoints.map((point, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl p-5"
              style={{ backgroundColor: "#eafcf1" }}
            >
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="#16803D" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              <span className="text-gray-700 text-sm leading-relaxed">{point}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
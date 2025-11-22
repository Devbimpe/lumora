import Link from "next/link"

export default function TrainingModulesSection() {
  const modules = [
    {
      title: "What Is Sustainability",
      description: "Introduction to sustainability and its relevance in tech",
      image: "/M1.jpg",
    },
    {
      title: "Dimensions of Sustainability",
      description: "Environmental, economic, technical and social sustainability",
      image: "/M2.jpg",
    },
    {
      title: "Social Sustainability",
      description: "Understanding the tech industry's social impact and ethical obligations",
      image: "/M3.jpg",
    },
    {
      title: "Technical Ethics",
      description: "Ethical considerations in technical decision-making processes",
      image: "/M6.jpg",
    },
    {
      title: "Implementation Strategies",
      description: "Practical approaches to implementing sustainable software practices",
      image: "/M7.jpg",
    },
  ]

  return (
    <section className="py-20 relative overflow-hidden" style={{ 
      backgroundColor: "#dbfbe9"
    }}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-100 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-100 rounded-full opacity-20 blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <h2
          className="text-5xl font-bold text-center text-green-700 mb-16"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "bold", textAlign: "center", color: "#16803D", marginBottom: "4rem" }}
        >
          What will you Learn?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, index) => (
            <Link key={index} href="/training-module" className="block">
              <div className="bg-white rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 transform border border-green-100">
                <div className="w-20 h-20 border-2 border-green-700 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden bg-white">
                  <img 
                    src={module.image || "/placeholder.svg"} 
                    alt={module.title} 
                    className="w-full h-full object-cover rounded-full" 
                  />
                </div>
                <h3 className="text-xl font-bold text-green-700 mb-3">{module.title}</h3>
                <p className="text-gray-700 leading-relaxed">{module.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

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
      title: "Environmental Impact",
      description: "Understanding environmental implications of software development",
      image: "/M4.jpg",
    },
    {
      title: "Economic Considerations",
      description: "Balancing economic factors with sustainable development practices",
      image: "/M5.jpg",
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

  const firstRow = modules.slice(0, 4)
  const secondRow = modules.slice(4, 7)

  return (
    <section className="bg-green-100 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2
          className="text-5xl font-bold text-center text-green-700 mb-16"
          style={{ fontSize: "3rem", fontWeight: "bold", textAlign: "center", color: "#16803D", marginBottom: "4rem" }}
        >
          What will you Learn?
        </h2>

        {/* First row - 4 modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {firstRow.map((module, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer hover:scale-105 transform transition-transform"
            >
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <img
                  src={module.image || "/placeholder.svg"}
                  alt={module.title}
                  className="w-10 h-10 object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-green-700 mb-2">{module.title}</h3>
              <p className="text-gray-600 text-sm">{module.description}</p>
            </div>
          ))}
        </div>

        {/* Second row - 3 modules centered */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
            {secondRow.map((module, index) => (
              <div
                key={index + 4}
                className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer hover:scale-105 transform transition-transform"
              >
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <img
                    src={module.image || "/placeholder.svg"}
                    alt={module.title}
                    className="w-10 h-10 object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-green-700 mb-2">{module.title}</h3>
                <p className="text-gray-600 text-sm">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
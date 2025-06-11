export default function TrainingModulesSection() {
  const modules = [
    {
      title: "MODULE 1: What Is Sustainability",
      description: "Introduction to sustainability and its relevance in tech",
      emoji: "💡",
      bgColor: "",
    },
    {
      title: "MODULE 2: Dimensions of Sustainability",
      description: "Environmental, economic, technical and social sustainability",
      emoji: "❤️",
      bgColor: "bg-orange-100",
    },
    {
      title: "MODULE 3: Social Sustainability",
      description: "Understanding the tech industry's social impact and ethical obligations",
      emoji: "👥",
      bgColor: "",
    },
    {
      title: "MODULE 4: Environmental Impact",
      description: "Understanding environmental implications of software development",
      emoji: "🌿",
      bgColor: "bg-orange-100",
    },
    {
      title: "MODULE 5: Economic Considerations",
      description: "Balancing economic factors with sustainable development practices",
      emoji: "💰",
      bgColor: "",
    },
    {
      title: "MODULE 6: Technical Ethics",
      description: "Ethical considerations in technical decision-making processes",
      emoji: "🛡️",
      bgColor: "bg-orange-100",
    },
    {
      title: "MODULE 7: Implementation Strategies",
      description: "Practical approaches to implementing sustainable software practices",
      emoji: "📝",
      bgColor: "",
    },
  ]

  return (
    <section className="bg-green-100 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-12">Training Modules</h2>
        <div className="space-y-6">
          {modules.map((module, index) => (
            <div key={index} className={`flex items-start space-x-6 ${module.bgColor} rounded-lg p-4`}>
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-2xl text-white">{module.emoji}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-700 mb-2">{module.title}</h3>
                <p className="text-gray-700 text-lg">{module.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

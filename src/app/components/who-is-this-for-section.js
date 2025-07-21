import { Code, Users, GraduationCap, Lightbulb } from "lucide-react" 

export default function WhoIsThisForSection() {
  const audience = [
    {
      title: "Software Developers & Engineers",
      description: "For those building the digital world.",
      icon: Code, 
    },
    {
      title: "UX Designers & Product Managers",
      description: "For those shaping user experiences and product vision.",
      icon: Users, 
    },
    {
      title: "Students in Computer Science",
      description: "For future tech leaders and innovators.",
      icon: GraduationCap, 
    },
    {
      title: "Anyone Interested in Ethical Tech",
      description: "For individuals passionate about responsible technology.",
      icon: Lightbulb, 
    },
  ]

  return (
    <section className="bg-green-100 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2
          className="text-5xl font-bold text-center text-green-700 mb-16"
          style={{ fontSize: "3rem", fontWeight: "bold", textAlign: "center", color: "#16803D", marginBottom: "4rem" }}
        >
          Who is this for?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {audience.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer hover:scale-105 transform transition-transform"
            >
              <div className="w-16 h-16 border-2 border-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-8 h-8 text-green-700" /> 
              </div>
              <h3 className="text-xl font-bold text-green-700 mb-2">{item.title}</h3>
              <p className="text-gray-700">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

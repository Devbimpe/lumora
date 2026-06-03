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
    <section className="py-10 relative overflow-hidden" style={{ 
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
          Who is this for?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {audience.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 text-center shadow-lg hover:shadow-xl hover:border-green-400 hover:scale-105 transition-all duration-300 border border-green-100"
            >
              {/* Icon container */}
              <div className="w-14 h-14 border-2 border-green-700 group-hover:border-green-500 group-hover:bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-orange-50 to-green-50 transition-all duration-300">
                <item.icon className="w-7 h-7 text-green-700 group-hover:text-green-500 transition-colors duration-300" />
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-bold text-green-700 group-hover:text-green-500 mb-2 transition-colors duration-300">{item.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

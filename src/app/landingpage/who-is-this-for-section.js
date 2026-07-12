import { Code, Users, GraduationCap, Lightbulb } from "lucide-react"
import Link from "next/link"

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
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2
          className="text-5xl font-bold text-center mb-16"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "bold", textAlign: "center", color: "#16803D", marginBottom: "4rem" }}
        >
          Who is this for?
        </h2>
         <div className="rounded-2xl overflow-hidden mb-12 shadow-md">
          <img
            src="/working3.jpg"
            alt="Team collaborating"
            className="w-full h-64 sm:h-80 object-cover"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audience.map((item, index) => (
            <Link key={index} href="/training-module">
              <div className="group bg-white rounded-2xl p-6 text-center border border-gray-200 hover:shadow-md hover:border-green-300 transition-all duration-300 h-full">

                {/* Icon container */}
                <div className="w-14 h-14 border-2 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300" style={{ borderColor: "#15803D" }}>
                  <item.icon className="w-6 h-6 transition-colors duration-300" style={{ color: "#15803D" }} />
                </div>

                {/* Content */}
                <h3 className="text-base font-bold transition-colors duration-300" style={{ color: "#15803D" }}>
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
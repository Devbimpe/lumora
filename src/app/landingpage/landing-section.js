import { Button } from "../components/button"

export default function LandingSection() {
  return (
    <section className="bg-green-600 text-white py-16">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Scenario-Based Learning
            <br />
            for Software Developers
          </h1>
          <p className="text-lg text-green-100 mb-8 leading-relaxed">
            Lumora is an interactive training platform that presents real-world scenarios to help developers build socially sustainable software.
          </p>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded">
            Get Started
          </Button>
        </div>
        <div className="flex justify-center">
          <img
            src="https://res.cloudinary.com/du6yiw4it/image/upload/v1772417656/main-page-illustration.png"
            alt="Interactive learning illustration"
            className="max-w-full h-auto w-96"
          />
        </div>
      </div>
    </section>
  )
}
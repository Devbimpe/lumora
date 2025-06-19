<<<<<<< HEAD
export default function Page() {
  return <h1 className="text-3xl font-bold underline">This is the "Root" of our project</h1>
}

=======
import CarouselSection from "./components/carousel-section"
import HowItWorksSection from "./components/how-it-works-section"
import TrainingModulesSection from "./components/training-modules-section"
import Footer from "./components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CarouselSection />
      <HowItWorksSection />
      <TrainingModulesSection />
      <Footer />
    </div>
  )
}
>>>>>>> cdbe4ff17828808fa314322cf324f8b536888966

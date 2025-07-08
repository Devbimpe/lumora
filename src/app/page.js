import CarouselSection from "./components/carousel-section"
import WhyThisMattersSection from "./components/why-this-matters-section"
import HowItWorksSection from "./components/how-it-works-section"
import TrainingModulesSection from "./components/training-modules-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CarouselSection />
      <WhyThisMattersSection />
      <TrainingModulesSection />
      <HowItWorksSection />
    </div>
  )
}

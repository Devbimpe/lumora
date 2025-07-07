export default function WhyThisMattersSection() {
  return (
    <section className="py-16" style={{ backgroundColor: "#FFF8E1" }}>
      <div className="max-w-6xl mx-auto px-4">
        <h2 
          className="text-5xl font-bold text-center text-green-700 mb-16"
          style={{ fontSize: "3rem", fontWeight: "bold", textAlign: "center", color: "#16803D", marginBottom: "4rem" }}
        >
          Why this Matters?
        </h2>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <img
              src="/main-page-illustration.png"
              alt="LUMORA illustration"
              className="max-w-full h-auto w-96 md:w-[450px]"
            />
          </div>
          <div>
            <p className="text-lg leading-relaxed text-gray-700 mb-6">
              Modern software shapes everything, from how we bank to how we access healthcare and education. Yet, many systems unintentionally reinforce bias, exclude marginalized users, or put privacy at risk.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              LUMORA helps developers recognize these risks and respond with thoughtful, socially aware solutions.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
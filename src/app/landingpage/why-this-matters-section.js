export default function WhyThisMattersSection() {
  return (
    <section className="py-20 relative overflow-hidden" style={{ 
      background: "linear-gradient(135deg, #FFF8E1 0%, #F0F8F4 100%)"
    }}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-100 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-100 rounded-full opacity-20 blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-bold" style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            background: "linear-gradient(135deg, #16803D 0%, #22C55E 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: "1.1"
          }}>
            Why This Matters?
          </h2>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image side with enhanced styling */}
          <div className="flex justify-center order-2 lg:order-1">
            <img
              src="http://res.cloudinary.com/du6yiw4it/image/upload/v1772417656/main-page-illustration.png"
              alt="LUMORA illustration"
              className="w-full max-w-md md:max-w-lg h-auto"
            />
          </div>
          
          {/* Content side */}
          <div className="space-y-8 order-1 lg:order-2">
            {/* Main description */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-green-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">The Challenge</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Modern software shapes everything, from how we bank to how we access healthcare and education. Yet, many systems unintentionally <span className="font-semibold text-green-700">reinforce bias</span>, <span className="font-semibold text-green-700">exclude marginalized users</span>, or <span className="font-semibold text-green-700">put privacy at risk</span>.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Solution */}
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-green-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Our Solution</h3>
                  <p className="text-gray-700 leading-relaxed">
                    <span className="font-bold text-green-700">LUMORA</span> empowers developers to recognize these risks and respond with thoughtful, socially aware solutions that create a more inclusive digital future.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stats or key points */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center shadow-md">
                <div className="text-3xl font-bold text-green-600 mb-1">Build</div>
                <div className="text-sm text-gray-600">Awareness</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center shadow-md">
                <div className="text-3xl font-bold text-green-600 mb-1">Learn</div>
                <div className="text-sm text-gray-600">Strategies</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center shadow-md">
                <div className="text-3xl font-bold text-green-600 mb-1">Create</div>
                <div className="text-sm text-gray-600">Impact</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
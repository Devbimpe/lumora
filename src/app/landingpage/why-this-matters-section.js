export default function WhyThisMattersSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className="font-bold"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#16803D",
              lineHeight: "1.1"
            }}
          >
            Why This Matters?
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image side */}
          <div className="flex justify-center order-2 lg:order-1">
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-md">
              <img
                src="/working2.jpeg"
                alt="LUMORA illustration"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Content side */}
          <div className="space-y-5 order-1 lg:order-2">
            {/* Main description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#16803D" }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">The Challenge</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Modern software shapes everything, from how we bank to how we access healthcare and education. Yet, many systems unintentionally <span className="font-semibold text-green-700">reinforce bias</span>, <span className="font-semibold text-green-700">exclude marginalized users</span>, or <span className="font-semibold text-green-700">put privacy at risk</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Solution */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FBBF24" }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Our Solution</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    <span className="font-bold text-green-700">LUMORA</span> empowers developers to recognize these risks and respond with thoughtful, socially aware solutions that create a more inclusive digital future.
                  </p>
                </div>
              </div>
            </div>

            {/* Build / Learn / Create */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: "#eafcf1" }}>
                  <svg className="w-5 h-5" fill="none" stroke="#16803D" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-3 3 3 3m8-6l3 3-3 3M14 4l-4 16" />
                  </svg>
                </div>
                <div className="text-sm font-semibold" style={{ color: "#16803D" }}>Build</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: "#eafcf1" }}>
                  <svg className="w-5 h-5" fill="none" stroke="#16803D" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-sm font-semibold" style={{ color: "#16803D" }}>Learn</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: "#eafcf1" }}>
                  <svg className="w-5 h-5" fill="none" stroke="#16803D" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div className="text-sm font-semibold" style={{ color: "#16803D" }}>Create</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
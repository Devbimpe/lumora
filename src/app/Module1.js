import React from 'react';

export default function Module1() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-white shadow">
        <div className="flex items-center">
          <img src="https://via.placeholder.com/50" alt="LUMORA Logo" className="mr-2" />
          <h1 className="text-2xl font-bold text-green-700">LUMORA</h1>
        </div>
        <nav className="flex space-x-4">
          <a href="#" className="text-orange-500 font-semibold px-4 py-2 rounded bg-orange-100">About</a>
          <a href="#" className="text-orange-500 font-semibold px-4 py-2 rounded bg-orange-100">Training Module</a>
          <a href="#" className="text-orange-500 font-semibold px-4 py-2 rounded bg-orange-100">Admin Login</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-green-700 mt-10">MODULE 1: What is Sustainability</h2>
        <div className="mt-4">
          <h3 className="text-xl font-semibold text-green-700">Part 1:</h3>
          <p className="text-lg text-gray-800">Introduction to sustainability and its relevance in tech</p>
        </div>

        {/* Questions Section */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-green-700">Questions</h3>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Introduction to sustainability?"
              className="w-full p-2 border rounded bg-gray-50 text-gray-800"
            />
            <button className="mt-4 px-4 py-2 bg-orange-500 text-white font-semibold rounded">Submit</button>
          </div>
        </div>
      </main>
    </div>
  );
}
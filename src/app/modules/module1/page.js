import React from "react";
import Link from "next/link";

const Module1 = () => {
  return (
    <div>
      {/* Main content */}
      <main className="max-w-4xl mx-auto p-8">
        <h2 className="text-4xl font-extrabold text-green-800 underline mb-8">
          MODULE 1: What is Sustainability
        </h2>

        <section className="mb-12">
          <h3 className="text-2xl font-bold text-green-800 mb-2">Part 1:</h3>
          <p className="text-black text-lg">
            Introduction to sustainability and its relevance in tech
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-green-800 mb-2">Questions</h3>
          <p className="mb-4">Introduction to sustainability?</p>
          <textarea
            className="w-full h-24 p-3 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Your answer here..."
          />
          <button className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
            Submit
          </button>
        </section>
      </main>
    </div>
  );
};

export default Module1;
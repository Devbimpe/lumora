'use client';

export default function ContentItemView({ item }) {
  const { overview, image, imageDescription, reading } = item ?? {};
  return (
    <div className="space-y-6">
      {overview && (
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
          {overview}
        </h3>
      )}
      {image && (
        <div className="flex justify-center items-center">
          <img
            src={image}
            alt={imageDescription || overview || 'Module content'}
            className="max-w-full h-auto rounded-lg"
          />
        </div>
      )}
      {reading && (
        <div className="prose prose-green max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
          {reading}
        </div>
      )}
      {!overview && !reading && !image && (
        <div className="text-center text-gray-500 p-8">
          <p>No content available for this section.</p>
        </div>
      )}
    </div>
  );
}

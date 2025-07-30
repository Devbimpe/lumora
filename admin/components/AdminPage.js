export default function AdminPage() {
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="bg-green-500 h-24 w-5/6 rounded text-white text-center flex items-center justify-center">
        Dashboard
      </div>
      <div className="bg-blue-500 h-24 w-11/12 rounded text-white text-center flex items-center justify-center">
        Module Overview
      </div>
      <div className="grid grid-cols-2 gap-4 h-100 w-5/6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-white border text-center p-4">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
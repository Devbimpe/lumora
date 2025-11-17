"use client";
import { useEffect, useState } from "react";
import db from "@/db/db";

export default function ModuleProgressPage() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await db.getAllModuleProgressWithUsers();
        setProgress(data);
      } catch (err) {
        console.error("Error fetching progress:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (loading)
    return <p className="text-center mt-10">Loading module progress...</p>;

  return (
    <div className="text-center text-black text-xl w-full">
      <h2 className="font-bold mb-4">Module Progress</h2>

      {progress.length > 0 ? (
        <div className="space-y-4">
          {progress.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded shadow">
              <p><strong>User ID:</strong> {p.userId}</p>
              <p><strong>User Name:</strong> {p.userName}</p>
              <p><strong>Full Name:</strong> {p.fullName}</p>
              <p><strong>Module ID:</strong> {p.moduleId}</p>
              <p><strong>Progress:</strong> {Math.round(p.progress * 100)}%</p>
              <p><strong>Completed:</strong> {p.completed ? "Yes" : "No"}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No user progress found.</p>
      )}
    </div>
  );
}

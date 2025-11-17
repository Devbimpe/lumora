"use client";
import { useEffect, useState } from "react";
import db from "@/db/db";

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const data = await db.getAllFeedbackWithUsers();
        setFeedback(data);
      } catch (err) {
        console.error("Error fetching feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading feedback...</p>;

  return (
    <div className="text-center text-black text-xl w-full">
      <h2 className="font-bold mb-4">Feedback</h2>

      {feedback.length > 0 ? (
        <div className="space-y-4">
          {feedback.map((f) => (
            <div key={f.id} className="bg-white p-4 rounded shadow">
              <p><strong>Type:</strong> {f.displayType}</p>
              <p><strong>User ID:</strong> {f.userId}</p>
              <p><strong>User Name:</strong> {f.userName}</p>
              <p><strong>Full Name:</strong> {f.fullName}</p>
              <p><strong>Message:</strong> {f.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No feedback found.</p>
      )}
    </div>
  );
}

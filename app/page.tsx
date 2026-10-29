"use client";
import { useState, useEffect } from "react";
import jsPDF from "jspdf"; // PDF library import karein

export default function Home() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ topic: string; content: string }[]>(
    [],
  );

  // LocalStorage logic
  useEffect(() => {
    const savedHistory = localStorage.getItem("ai_history_v2");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("ai_history_v2", JSON.stringify(history));
    }
  }, [history]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic }),
      });
      const data = await response.json();
      if (data.output) {
        setResult(data.output);
        setHistory((prev) => [{ topic, content: data.output }, ...prev]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- PDF Download Logic ---
  const downloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();

    // PDF Styling
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Generated Content", 10, 20);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Topic: ${topic}`, 10, 30);

    doc.setDrawColor(0, 0, 0);
    doc.line(10, 35, 200, 35); // Horizontal line

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);

    // Text wrapping taake content page se bahar na jaye
    const splitText = doc.splitTextToSize(result, 180);
    doc.text(splitText, 10, 45);

    doc.save(`${topic.replace(/\s+/g, "_")}_content.pdf`);
  };

  return (
    <div className="flex flex-col bg-gray-300 min-h-screen font-mono">
      <div className="flex justify-center items-center py-7 text-gray-700 text-3xl font-bold">
        AI Content Writer
      </div>

      <div className="grid grid-cols-5 flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="bg-gray-400 flex flex-col items-center pt-7 border-r border-gray-500 overflow-y-auto">
          <span className="font-bold text-gray-800 mb-4 text-xl">History</span>
          <div className="w-full px-2">
            {history.map((item, index) => (
              <div
                key={index}
                className="bg-gray-500 text-white text-xs p-2 mb-2 rounded truncate cursor-pointer hover:bg-gray-600 border border-gray-600"
                onClick={() => {
                  setTopic(item.topic);
                  setResult(item.content);
                }}
              >
                {item.topic}
              </div>
            ))}
          </div>
        </div>

        {/* Main Area */}
        <div className="px-10 col-span-4 py-7 overflow-y-auto">
          <div className="flex flex-col max-w-2xl mx-auto">
            <label className="mb-2 text-xl font-bold text-gray-700">
              Add Topic
            </label>
            <input
              type="text"
              className="bg-white border border-gray-600 p-2 text-black rounded shadow-inner"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your topic..."
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleGenerate}
                className="px-6 py-2 bg-gray-700 text-white hover:bg-black rounded shadow-md transition-all"
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Topic"}
              </button>

              {/* PDF Button - Sirf tab dikhega jab result ho */}
              {result && (
                <button
                  onClick={downloadPDF}
                  className="px-6 py-2 bg-green-700 text-white hover:bg-green-800 rounded shadow-md transition-all flex items-center gap-2"
                >
                  📥 Download PDF
                </button>
              )}
            </div>

            <textarea
              className="mt-6 p-4 bg-white border border-gray-400 text-black rounded shadow-lg"
              rows={12}
              value={result}
              readOnly
              placeholder="Your AI content will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

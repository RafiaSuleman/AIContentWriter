"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  
  // History ab objects ki array hai
  const [history, setHistory] = useState<{topic: string, content: string}[]>([]);

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
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic }),
      });
      const data = await response.json();
      if (data.output) {
        setResult(data.output);
        // Save BOTH topic and content
        setHistory((prev) => [{ topic, content: data.output }, ...prev]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-gray-300 min-h-screen">
      <div className="flex justify-center items-center py-7 font-mono text-gray-700 text-3xl font-bold">
        AI Content Writer
      </div>
      
      <div className="grid grid-cols-5 flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="bg-gray-400 flex flex-col items-center pt-7 border-r border-gray-500 overflow-y-auto">
          <span className="font-mono font-bold text-gray-800 mb-4">History</span>
          <div className="w-full px-2">
            {history.map((item, index) => (
              <div 
                key={index} 
                className="bg-gray-500 text-white text-xs p-2 mb-2 rounded font-mono truncate cursor-pointer hover:bg-gray-600 border border-gray-600"
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
        <div className="px-10 col-span-4 py-7">
          <div className="flex flex-col max-w-2xl mx-auto">
            <label className="mb-2 font-mono text-xl">Add Topic</label>
            <input
              type="text"
              className="bg-white border border-gray-600 p-2 font-mono text-black"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <button 
              onClick={handleGenerate}
              className="mt-4 px-6 py-2 bg-gray-700 text-white font-mono hover:bg-black"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Topic"}
            </button>
            
            <textarea 
              className="mt-6 p-4 bg-white border border-gray-400 text-black font-mono" 
              rows={12}
              value={result}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}
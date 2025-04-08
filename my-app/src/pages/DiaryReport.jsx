import React, { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useParams } from "react-router-dom";

const DiaryReport = () => {
  const [entries, setEntries] = useState([]);
  const [cumulativeScores, setCumulativeScores] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { folderId } = useParams();
  console.log("Folder ID from useParams:", folderId);

  useEffect(() => {
    const fetchReport = async () => {
      if (!folderId) {
        console.warn("Folder ID is missing, waiting...");
        return;
      }

      setLoading(true); // Set loading to true at the start of fetch
      setError(null); // Clear previous errors

      try {
        const response = await fetch(`http://127.0.0.1:8000/diary/folders/${folderId}/report/`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid JSON response");
        }

        const data = await response.json();
        console.log("Fetched data:", data);

        setEntries(data.entries || []);
        setCumulativeScores({
          depression: data.cumulative_depression_score,
          anxiety: data.cumulative_anxiety_score,
          stress: data.cumulative_stress_score,
        });
      } catch (err) {
        console.error("Error fetching report:", err);
        setError(err.message);
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
      }
    };

    fetchReport();
  }, [folderId]);

  if (loading) return <p className="p-6 text-center">Loading report...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="p-6">
      {/* Cumulative Scores */}
      <div className="border p-4 rounded-lg shadow-md mb-4 bg-white">
        <h2 className="text-xl font-bold text-gray-700">Cumulative DAS Scores</h2>
        {cumulativeScores ? (
          <div className="mt-2">
            <p>
              <strong>Depression:</strong> {cumulativeScores.depression}
            </p>
            <p>
              <strong>Anxiety:</strong> {cumulativeScores.anxiety}
            </p>
            <p>
              <strong>Stress:</strong> {cumulativeScores.stress}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">No cumulative scores available.</p>
        )}
      </div>

      {/* Tabs for each entry */}
      {entries && entries.length > 0 ? (
        <div className="mb-4">
          <div className="flex border-b overflow-x-auto">
            {entries.map((_, index) => (
              <button
                key={index}
                className={`py-2 px-4 transition-all ${
                  activeTab === index
                    ? "border-b-2 border-blue-500 font-bold text-blue-600"
                    : "text-gray-500 hover:text-blue-500"
                }`}
                onClick={() => setActiveTab(index)}
              >
                Entry {index + 1}
              </button>
            ))}
          </div>
          {entries.length > activeTab && entries[activeTab] ? (
            <div className="border p-4 rounded-lg mt-2 bg-gray-100">
              <h3 className="font-bold text-gray-700">DAS Scores for Entry {activeTab + 1}</h3>
              <p>
                <strong>Depression:</strong> {entries[activeTab]?.depression_score}
              </p>
              <p>
                <strong>Anxiety:</strong> {entries[activeTab]?.anxiety_score}
              </p>
              <p>
                <strong>Stress:</strong> {entries[activeTab]?.stress_score}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No data available for this entry.</p>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No diary entries available.</p>
      )}

      {/* Charts */}
      <div className="border p-4 mt-4 rounded-lg shadow-md bg-white">
        <h3 className="font-bold text-gray-700">DAS Score Comparison</h3>
        {entries && entries.length > 0 ? (
          <div style={{ width: "100%", height: "400px" }}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart width={500} height={300} data={entries}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="depression_score" fill="#8884d8" />
                <Bar dataKey="anxiety_score" fill="#82ca9d" />
                <Bar dataKey="stress_score" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500 text-center p-4">No data for charts.</p>
        )}
      </div>

      <div className="border p-4 mt-4 rounded-lg shadow-md bg-white">
        <h3 className="font-bold text-gray-700">DAS Score Trend</h3>
        {entries.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={entries}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="depression_score" stroke="#8884d8" />
              <Line type="monotone" dataKey="anxiety_score" stroke="#82ca9d" />
              <Line type="monotone" dataKey="stress_score" stroke="#ffc658" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center p-4">No trend data available.</p>
        )}
      </div>
    </div>
  );
};

export default DiaryReport;
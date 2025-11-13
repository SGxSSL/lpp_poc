"use client";

import { X, ChevronDown, ChevronUp, Brain } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { getLeadDetails } from "@/services/leadService";

export default function LeadModal({ lead, onClose }) {
  const [leadDetails, setLeadDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLogs, setExpandedLogs] = useState({});
  const [expandedAI, setExpandedAI] = useState({});

  useEffect(() => {
    const fetchLeadDetails = async () => {
      try {
        const data = await getLeadDetails(lead.id);
        setLeadDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLeadDetails();
  }, [lead.id]);

  if (!lead) return null;

  const chartData = [
    { label: "Credit Score", value: lead.credit_score || 0 },
    { label: "Interest Level", value: lead.interest_level || 0 },
    { label: "Overall Score", value: ((lead.credit_score || 0) + (lead.interest_level || 0)) / 2 },
  ];

  const toggleExpand = (index) => {
    setExpandedLogs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleAIExpand = (index) => {
    setExpandedAI((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-11/12 max-w-6xl h-[85vh] rounded-2xl shadow-xl overflow-hidden flex animate-fadeIn relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={22} />
        </button>

        {/* LEFT: Lead Info */}
        <div className="w-2/5 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
          <div className="flex flex-col items-center mb-6">
            <div className="w-28 h-28 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 text-white text-3xl flex items-center justify-center font-semibold mb-4">
              {lead.name?.[0] || "?"}
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{lead.name}</h2>
            <p className="text-sm text-gray-500 mb-6">{lead.lead_type || "Lead"}</p>
          </div>

          <div className="space-y-3">
            <Info label="Email" value={lead.email || "N/A"} />
            <Info label="Phone" value={lead.phone || "N/A"} />
            <Info label="Source" value={lead.source || "N/A"} />
            <Info label="Status" value={lead.status || "N/A"} />
            <Info label="Credit Score" value={lead.credit_score || "N/A"} />
            <Info label="Interest Level" value={lead.interest_level || "N/A"} />
            <Info label="Last Contact" value={lead.last_contact_date || "N/A"} />
            <Info label="Created At" value={new Date(lead.created_at).toLocaleDateString()} />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">AI Insights</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <XAxis dataKey="label" />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: Call Logs & AI */}
        <div className="w-3/5 p-6 overflow-y-auto">
          {loading && (
            <div className="text-center mt-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-3 text-gray-600">Loading details...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
              Error loading lead details: {error}
            </div>
          )}

          {!loading && !error && leadDetails && (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Call History</h3>
              {leadDetails.call_logs?.length > 0 ? (
                <div className="space-y-4">
                  {leadDetails.call_logs.map((log, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            Call ID: {log.id} — {log.channel || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.call_date).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">
                          Duration: {log.duration_minutes} min
                        </p>
                      </div>

                      {/* Summary */}
                      <p className="text-sm text-gray-700 mb-3">
                        <span className="font-medium">Summary:</span>{" "}
                        {log.summary || "No summary available"}
                      </p>

                      {/* Transcription */}
                      {log.transcription && (
                        <div className="mb-3">
                          <p className="font-medium text-sm mb-1">Transcription</p>
                          {expandedLogs[index] ? (
                            <>
                              <div className="bg-white border border-gray-100 rounded p-3">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {log.transcription}
                                </p>
                              </div>
                              <button
                                onClick={() => toggleExpand(index)}
                                className="mt-2 text-indigo-600 text-sm flex items-center gap-1 hover:text-indigo-800"
                              >
                                <ChevronUp size={14} /> Show Less
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="bg-white border border-gray-100 rounded p-3">
                                <p className="text-sm text-gray-700 line-clamp-3">
                                  {log.transcription}
                                </p>
                              </div>
                              <button
                                onClick={() => toggleExpand(index)}
                                className="mt-2 text-indigo-600 text-sm flex items-center gap-1 hover:text-indigo-800"
                              >
                                <ChevronDown size={14} /> Show More
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* 🧠 AI Analysis Section */}
                      {log.unstructured_analyses?.length > 0 && (
                        <div className="mt-4 border-t border-gray-100 pt-3">
                          <button
                            onClick={() => toggleAIExpand(index)}
                            className="w-full flex justify-between items-center text-indigo-700 font-medium text-sm hover:text-indigo-900"
                          >
                            <span className="flex items-center gap-2">
                              <Brain size={16} /> AI Analysis
                            </span>
                            {expandedAI[index] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>

                          {expandedAI[index] && (
                            <div className="mt-3 bg-gray-50 p-3 rounded-lg text-sm text-gray-700 space-y-2">
                              {log.unstructured_analyses.map((analysis, i) => (
                                <div key={i} className="border border-gray-100 rounded-lg p-3 mb-2 bg-white">
                                  <p><span className="font-medium">Sentiment:</span> {analysis.sentiment}</p>
                                  <p><span className="font-medium">Intent:</span> {analysis.intent_type}</p>
                                  <p><span className="font-medium">Intent Strength:</span> {analysis.intent_strength}</p>
                                  <p><span className="font-medium">Decision Stage:</span> {analysis.decision_stage}</p>
                                  <p><span className="font-medium">Confidence:</span> {analysis.confidence}</p>
                                  <p><span className="font-medium">Conversion Probability:</span> {analysis.conversion_probability}</p>

                                  <div className="mt-2">
                                    <p className="font-medium mb-1">Summary:</p>
                                    <p className="text-gray-600">{analysis.summary_ai}</p>
                                  </div>

                                  {analysis.keywords?.length > 0 && (
                                    <div className="mt-2">
                                      <p className="font-medium mb-1">Keywords:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {analysis.keywords.map((k, j) => (
                                          <span key={j} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                                            {typeof k === "string" ? k : k.keyword}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No call logs available.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, color = "text-gray-700" }) {
  return (
    <div className="flex justify-between w-full text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${color}`}>{value}</span>
    </div>
  );
}

"use client";

import { X, PhoneCall, Mail, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { getLeadDetails } from "@/services/leadService";

export default function LeadModal({ lead, onClose }) {
  const [leadDetails, setLeadDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLogs, setExpandedLogs] = useState({});
  console.log('LeadModal lead:', leadDetails);
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
    setExpandedLogs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
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


        </div>

        {/* RIGHT: Officer + Call Logs */}

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
              {/* Officer Info */}
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
                <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Assigned Officer</h3>
                <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <p><span className="font-medium">Officer ID:</span> {leadDetails.officer?.id || "N/A"}</p>
                  <p><span className="font-medium">Name:</span> {leadDetails.officer?.name || "N/A"}</p>
                  <p><span className="font-medium">Region:</span> {leadDetails.officer?.region || "N/A"}</p>
                  <p><span className="font-medium">Specialty:</span> {leadDetails.officer?.specialty || "N/A"}</p>
                  <p><span className="font-medium">Experience:</span> {leadDetails.officer?.experience_years || 0} years</p>
                  <p><span className="font-medium">Joined:</span> {leadDetails.officer?.created_at ? new Date(leadDetails.officer.created_at).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>

              {/* Call Logs */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Call History</h3>
                {leadDetails.call_logs?.length > 0 ? (
                  <div className="space-y-4">
                    {leadDetails.call_logs.map((log, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
                      >
                        {/* Header with basic info */}
                        <div className="flex justify-between items-center mb-3">
                          <div className="grow">
                            <div className="flex items-center gap-3">
                              <p className="text-sm font-medium text-gray-900">
                                Call ID: {log.id}
                              </p>
                              <p className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                                {log.channel || "N/A"}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Created: {new Date(log.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-900">
                              {new Date(log.call_date).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Duration: {log.duration_minutes} minutes
                            </p>
                          </div>
                        </div>

                        {/* Call Details Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-3 bg-gray-50 p-3 rounded-lg">
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="font-medium">Lead ID:</span>{" "}
                              <span className="text-gray-600">{log.lead_id || "N/A"}</span>
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Officer ID:</span>{" "}
                              <span className="text-gray-600">{log.officer_id || "N/A"}</span>
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Intent:</span>{" "}
                              <span className="text-gray-600">{log.intent || "N/A"}</span>
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Outcome:</span>{" "}
                              <span className="text-gray-600">{log.outcome || "N/A"}</span>
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="font-medium">Sentiment:</span>{" "}
                              <span className="text-gray-600">{log.sentiment || "N/A"}</span>
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Objections:</span>{" "}
                              <span className="text-gray-600">{log.objections || "N/A"}</span>
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Channel:</span>{" "}
                              <span className="text-gray-600">{log.channel || "N/A"}</span>
                            </p>
                          </div>
                        </div>

                        {/* Summary Section */}
                        <div className="bg-white border border-gray-100 rounded p-3 mb-3">
                          <p className="font-medium text-sm mb-2">Summary</p>
                          <p className="text-sm text-gray-600">
                            {log.summary || "No summary available"}
                          </p>
                        </div>


                        {/* Transcription Read More */}
                        {log.transcription && (
                          <div>
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No call logs available.</p>
                )}
              </div>
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

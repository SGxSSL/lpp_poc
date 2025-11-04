"use client";

import { X, PhoneCall, Mail, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function LeadModal({ lead, onClose }) {
  if (!lead) return null;

  const chartData = [
    { label: "Sentiment", value: lead.aiScore },
    { label: "Engagement", value: Math.min(lead.aiScore + 10, 100) },
    { label: "Interest", value: Math.max(lead.aiScore - 5, 0) },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-11/12 max-w-5xl h-[80vh] rounded-2xl shadow-xl overflow-hidden flex animate-fadeIn relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={22} />
        </button>

        {/* Left Section */}
        <div className="w-2/5 bg-gray-50 border-r border-gray-200 p-6 flex flex-col items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 text-white text-3xl flex items-center justify-center font-semibold mb-4">
            {lead.name[0]}
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            {lead.name}
          </h2>
          <p className="text-sm text-gray-500 mb-4">{lead.loanType}</p>

          <div className="w-full space-y-3">
            <Info label="Officer" value={lead.officer} />
            <Info label="Sentiment" value={lead.sentiment} color={
              lead.sentiment === "Positive"
                ? "text-green-600"
                : lead.sentiment === "Neutral"
                ? "text-yellow-600"
                : "text-red-600"
            } />
            <Info label="Last Call" value={lead.lastCall} />
            <Info label="Loan Amount" value={lead.loanAmount} />
          </div>

          <div className="mt-6 flex gap-3">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <PhoneCall size={16} /> Call Lead
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg">
              <Mail size={16} /> Send Email
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-3/5 flex flex-col">
          {/* AI Insights / Graph */}
          <div className="p-6 border-b border-gray-100 h-1/2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                AI Analysis
              </h3>
              <div className="flex items-center text-indigo-600 font-medium">
                <TrendingUp size={16} className="mr-1" />
                AI Score: {lead.aiScore}%
              </div>
            </div>

            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={chartData}>
                <XAxis dataKey="label" />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Loan & Call Summary */}
          <div className="p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Loan & Call Summary
            </h3>

            <div className="space-y-4 text-sm text-gray-700">
              <p>
                <span className="font-medium">Loan Type:</span>{" "}
                {lead.loanType}
              </p>
              <p>
                <span className="font-medium">Loan Amount:</span>{" "}
                {lead.loanAmount}
              </p>
              <p>
                <span className="font-medium">Officer:</span>{" "}
                {lead.officer}
              </p>

              <div className="mt-4">
                <p className="font-medium text-gray-800 mb-1">
                  Recent Call Summary:
                </p>
                <p className="text-gray-600 leading-relaxed">
                  The last call with {lead.name.split(" ")[0]} was on{" "}
                  <strong>{lead.lastCall}</strong>. The sentiment was{" "}
                  <span
                    className={`font-medium ${
                      lead.sentiment === "Positive"
                        ? "text-green-600"
                        : lead.sentiment === "Neutral"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {lead.sentiment}
                  </span>
                  , indicating{" "}
                  {lead.sentiment === "Positive"
                    ? "high interest and strong engagement."
                    : lead.sentiment === "Neutral"
                    ? "moderate interest that may need follow-up."
                    : "low interest; consider adjusting communication strategy."}
                </p>
              </div>
            </div>
          </div>
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

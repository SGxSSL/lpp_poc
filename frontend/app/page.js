"use client";

import { useState } from "react";
import { ArrowUpRight, Users, PhoneCall, Star, TrendingUp } from "lucide-react";
import LeadModal from "@/components/LeadModal";

export default function DashboardPage() {
  const [selectedLead, setSelectedLead] = useState(null);

  // --- Mock Data ---
  const [leads] = useState([
    {
      id: 1,
      name: "Ravi Kumar",
      loanType: "Home Loan",
      loanAmount: "₹45,00,000",
      sentiment: "Positive",
      aiScore: 92,
      officer: "Officer 1",
      lastCall: "2025-10-24",
    },
    {
      id: 2,
      name: "Priya Sharma",
      loanType: "Car Loan",
      loanAmount: "₹12,00,000",
      sentiment: "Neutral",
      aiScore: 78,
      officer: "Officer 2",
      lastCall: "2025-10-23",
    },
    {
      id: 3,
      name: "Ankit Patel",
      loanType: "Business Loan",
      loanAmount: "₹60,00,000",
      sentiment: "Negative",
      aiScore: 52,
      officer: "Officer 3",
      lastCall: "2025-10-20",
    },
  ]);

  const summary = [
    {
      title: "Total Leads",
      value: leads.length,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active Calls",
      value: 18,
      icon: PhoneCall,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "High Priority Leads",
      value: leads.filter((l) => l.aiScore > 80).length,
      icon: Star,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Avg AI Score",
      value:
        Math.round(leads.reduce((sum, l) => sum + l.aiScore, 0) / leads.length) +
        "%",
      icon: TrendingUp,
      color: "bg-indigo-100 text-indigo-600",
    },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          AI Lead Prioritization Dashboard
        </h1>
        <p className="text-gray-500 text-sm">
          Real-time insights generated from call transcripts and lead data
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map(({ title, value, icon: Icon, color }) => (
          <div
            key={title}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition"
          >
            <div>
              <p className="text-sm text-gray-500">{title}</p>
              <h2 className="text-xl font-semibold text-gray-800">{value}</h2>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
              <Icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Lead Insights</h2>
          <button className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View all <ArrowUpRight size={16} />
          </button>
        </div>

        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="py-3 px-4 text-left">Lead Name</th>
              <th className="py-3 px-4 text-left">Loan Type</th>
              <th className="py-3 px-4 text-left">Loan Amount</th>
              <th className="py-3 px-4 text-left">Sentiment</th>
              <th className="py-3 px-4 text-left">AI Score</th>
              <th className="py-3 px-4 text-left">Officer</th>
              <th className="py-3 px-4 text-left">Last Call</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-gray-50 cursor-pointer transition"
                onClick={() => setSelectedLead(lead)}
              >
                <td className="py-3 px-4 font-medium text-gray-800">
                  {lead.name}
                </td>
                <td className="py-3 px-4 text-gray-600">{lead.loanType}</td>
                <td className="py-3 px-4 text-gray-600">{lead.loanAmount}</td>
                <td
                  className={`py-3 px-4 font-medium ${
                    lead.sentiment === "Positive"
                      ? "text-green-600"
                      : lead.sentiment === "Neutral"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {lead.sentiment}
                </td>
                <td className="py-3 px-4 font-semibold text-gray-700">
                  {lead.aiScore}%
                </td>
                <td className="py-3 px-4 text-gray-600">{lead.officer}</td>
                <td className="py-3 px-4 text-gray-600">{lead.lastCall}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lead Modal */}
      {selectedLead && (
        <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}

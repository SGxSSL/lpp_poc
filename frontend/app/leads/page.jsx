"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import LeadModal from "@/components/LeadModal";

export default function LeadsPage() {
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const leads = [
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
    {
      id: 4,
      name: "Neha Verma",
      loanType: "Personal Loan",
      loanAmount: "₹8,00,000",
      sentiment: "Positive",
      aiScore: 86,
      officer: "Officer 1",
      lastCall: "2025-10-25",
    },
  ];

  // Filter leads based on search
  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.loanType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.officer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Leads</h1>
          <p className="text-gray-500 text-sm">
            View and manage all active leads across loan officers
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search leads..."
            className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
            {filteredLeads.map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-indigo-50/60 cursor-pointer transition"
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

        {filteredLeads.length === 0 && (
          <div className="p-6 text-center text-gray-500 text-sm">
            No leads found.
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedLead && (
        <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}

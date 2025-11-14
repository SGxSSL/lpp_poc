"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import LeadModal from "@/components/LeadModal";
import { getAllLeads } from "@/services/leadService";

export default function LeadsPage() {
  const router = useRouter();
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  // Sorting function
  const handleSort = (key) => {
    setSortConfig((prevSort) => ({
      key,
      direction:
        prevSort.key === key && prevSort.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Sort indicator component
  const SortIndicator = ({ column }) => {
    if (sortConfig.key !== column) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 text-indigo-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-indigo-600" />
    );
  };

  // ✅ Fetch leads on mount
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await getAllLeads();
        setLeads(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch leads:", err);
        setError(err.message || "Failed to load leads");
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg animate-pulse text-gray-700">
          Loading leads...
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  // ✅ Filter and sort leads
  const sortedAndFilteredLeads = [...leads]
    .filter((lead) => {
      const query = searchQuery.toLowerCase();
      return (
        lead.name?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phone?.toLowerCase().includes(query) ||
        lead.lead_type?.toLowerCase().includes(query) ||
        lead.status?.toLowerCase().includes(query) ||
        lead.source?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key] || "";
      const bValue = b[sortConfig.key] || "";

      // Handle numeric fields
      if (["credit_score", "interest_level"].includes(sortConfig.key)) {
        const numA = Number(aValue) || 0;
        const numB = Number(bValue) || 0;
        return sortConfig.direction === "asc" ? numA - numB : numB - numA;
      }

      // Handle dates
      if (sortConfig.key === "last_contact_date") {
        const dateA = aValue ? new Date(aValue).getTime() : 0;
        const dateB = bValue ? new Date(bValue).getTime() : 0;
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      // Handle strings
      return sortConfig.direction === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Leads</h1>
          <p className="text-gray-500 text-sm">
            View and manage all active leads across loan officers.
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-120px)]">
        <div className="overflow-auto h-full">
          <table className=" divide-y divide-gray-100 table-fixed w-full">
            <thead className="bg-gray-50 text-gray-600 text-sm sticky top-0 z-10">
              <tr>
                <th
                  className="py-3 px-4 text-left w-32 cursor-pointer hover:bg-gray-100 group"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Name
                    <SortIndicator column="name" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-left w-32 cursor-pointer hover:bg-gray-100 group"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center gap-1">
                    Email
                    <SortIndicator column="email" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-left w-32 cursor-pointer hover:bg-gray-100 group"
                  onClick={() => handleSort("phone")}
                >
                  <div className="flex items-center gap-1">
                    Phone
                    <SortIndicator column="phone" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-left w-32 cursor-pointer hover:bg-gray-100 group"
                  onClick={() => handleSort("lead_type")}
                >
                  <div className="flex items-center gap-1">
                    Lead Type
                    <SortIndicator column="lead_type" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-left w-32 cursor-pointer hover:bg-gray-100 group"
                  onClick={() => handleSort("credit_score")}
                >
                  <div className="flex items-center gap-1">
                    Credit Score
                    <SortIndicator column="credit_score" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-left w-20 cursor-pointer hover:bg-gray-100 group"
                  onClick={() => handleSort("interest_level")}
                >
                  <div className="flex items-center gap-1">
                    Interest Level
                    <SortIndicator column="interest_level" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-left w-32 cursor-pointer hover:bg-gray-100 group"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <SortIndicator column="status" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-left w-32 cursor-pointer hover:bg-gray-100 group"
                  onClick={() => handleSort("last_contact_date")}
                >
                  <div className="flex items-center gap-1">
                    Last Contact
                    <SortIndicator column="last_contact_date" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedAndFilteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-indigo-50/60 cursor-pointer transition wrap-anywhere"
                  onClick={() => router.push(`/leads/${lead.id}`)}
                >
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {lead.name || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {lead.email || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {lead.phone || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {lead.lead_type || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {lead.credit_score ?? "N/A"}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {lead.interest_level ?? "N/A"}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <span
                      className={`font-medium ${
                        lead.status === "Active"
                          ? "text-green-600"
                          : lead.status === "Pending"
                          ? "text-yellow-600"
                          : "text-gray-600"
                      }`}
                    >
                      {lead.status || "N/A"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {lead.last_contact_date
                      ? new Date(lead.last_contact_date).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedAndFilteredLeads.length === 0 && (
            <div className="p-6 text-center text-gray-500 text-sm">
              No leads found.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedLead && (
        <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}

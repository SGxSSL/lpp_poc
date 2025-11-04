"use client";

import { useState } from "react";
import { User, Star, TrendingUp, Users } from "lucide-react";

export default function OfficersPage() {
  const [officers] = useState([
    {
      id: 1,
      name: "Officer 1",
      email: "officer1@loancrm.com",
      phone: "+91 98765 43210",
      leads: 12,
      avgScore: 88,
      topSentiment: "Positive",
    },
    {
      id: 2,
      name: "Officer 2",
      email: "officer2@loancrm.com",
      phone: "+91 87654 32109",
      leads: 9,
      avgScore: 73,
      topSentiment: "Neutral",
    },
    {
      id: 3,
      name: "Officer 3",
      email: "officer3@loancrm.com",
      phone: "+91 76543 21098",
      leads: 7,
      avgScore: 65,
      topSentiment: "Negative",
    },
    {
      id: 4,
      name: "Officer 4",
      email: "officer4@loancrm.com",
      phone: "+91 99887 66554",
      leads: 15,
      avgScore: 91,
      topSentiment: "Positive",
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Loan Officers</h1>
        <p className="text-gray-500 text-sm">
          Overview of all officers and their performance insights
        </p>
      </div>

      {/* Officers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {officers.map((officer) => (
          <div
            key={officer.id}
            className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer p-5 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold mb-4">
              {officer.name.split(" ")[1] || officer.name[0]}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {officer.name}
            </h3>
            <p className="text-gray-500 text-sm mb-3">{officer.email}</p>

            <div className="w-full space-y-2 text-sm text-gray-600">
              <InfoRow icon={Users} label="Leads Assigned" value={officer.leads} />
              <InfoRow
                icon={TrendingUp}
                label="Avg AI Score"
                value={`${officer.avgScore}%`}
              />
              <InfoRow
                icon={Star}
                label="Top Sentiment"
                value={officer.topSentiment}
                color={
                  officer.topSentiment === "Positive"
                    ? "text-green-600"
                    : officer.topSentiment === "Neutral"
                    ? "text-yellow-600"
                    : "text-red-600"
                }
              />
              <InfoRow icon={User} label="Contact" value={officer.phone} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center justify-between w-full border-b border-gray-50 pb-1">
      <div className="flex items-center gap-2 text-gray-500">
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <span className={`font-medium ${color || "text-gray-700"}`}>
        {value}
      </span>
    </div>
  );
}

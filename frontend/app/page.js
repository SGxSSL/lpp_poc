"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  Users,
  PhoneCall,
  Star,
  TrendingUp,
  Flame,
  Target,
  Clock,
  Activity,
  Brain,
  AlertCircle,
  TrendingDown,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  Zap,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Phone,
  Lightbulb,
  MessageSquare,
  Shield,
  Award,
  TrendingUpDown,
  Grid3x3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getDashboardData } from "@/services/leadService";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { metrics, analytics, priority_leads } = dashboardData;

  // Transform analytics data for charts
  const statusChartData = analytics.status_distribution.map((item) => ({
    name: item.status,
    value: item.count,
  }));

  const typeChartData = analytics.type_distribution.map((item) => ({
    name: item.lead_type,
    value: item.count,
  }));

  const interestChartData = analytics.interest_distribution.map((item) => ({
    name: item.level,
    value: item.count,
  }));

  const creditChartData = analytics.credit_distribution.map((item) => ({
    name: item.bucket,
    value: item.count,
  }));

  const decisionStageData = analytics.decision_stage_distribution.map(
    (item) => ({
      name: item.stage,
      count: item.count,
      conversion: item.avg_conversion_prob || 0,
    })
  );

  const intentStrengthData = analytics.intent_strength_distribution.map(
    (item) => ({
      name: item.strength,
      value: item.count,
    })
  );

  const emotionData = analytics.emotion_distribution.map((item) => ({
    name: item.emotion,
    value: item.count,
  }));

  const followupData = analytics.followup_priority_distribution.map((item) => ({
    name: item.priority,
    value: item.count,
  }));

  const conversionTrendData = analytics.conversion_trends.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    conversion: item.avg_conversion * 100,
    count: item.count,
  }));

  const trustTrendData = analytics.trust_trends.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    trust: item.avg_trust * 10,
    count: item.count,
  }));

  const riskOpportunityData = analytics.risk_opportunity_matrix.map((item) => ({
    segment: item.segment
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    count: item.count,
    conversion: item.avg_conversion * 100,
    trust: item.avg_trust * 10,
  }));

  const COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#ef4444",
  ];

  const summary = [
    {
      title: "Total Leads",
      value: metrics.total_leads,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active Leads",
      value: metrics.active_leads,
      icon: Activity,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Hot Leads",
      value: metrics.hot_leads,
      icon: Flame,
      color: "bg-red-100 text-red-600",
      subtitle: "High Priority",
    },
    {
      title: "Avg Credit Score",
      value: Math.round(metrics.avg_credit_score),
      icon: Award,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Avg Conversion",
      value: `${Math.round((metrics.avg_conversion_probability || 0) * 100)}%`,
      icon: Target,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Avg Trust Score",
      value: ((metrics.avg_trust_score || 0) * 10).toFixed(0) + "%",
      icon: Shield,
      color: "bg-teal-100 text-teal-600",
    },
    {
      title: "Avg Clarity",
      value: ((metrics.avg_clarity_score || 0) * 10).toFixed(0) + "%",
      icon: MessageSquare,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Avg Empathy",
      value: ((metrics.avg_empathy_score || 0) * 10).toFixed(0) + "%",
      icon: Heart,
      color: "bg-pink-100 text-pink-600",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Lead Intelligence Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Comprehensive insights and analytics for lead prioritization
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map(({ title, value, icon: Icon, color, subtitle }) => (
          <div
            key={title}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <h2 className="text-3xl font-bold text-gray-800">{value}</h2>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        ))}
      </div>
      {/* Priority Leads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Priority Leads
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              High interest or excellent credit score
            </p>
          </div>
          <button
            onClick={() => router.push("/leads")}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Name
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interest
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit Score
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Contact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {priority_leads.length > 0 ? (
                priority_leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => router.push(`/leads/${lead.id}`)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-800">
                          {lead.name || "N/A"}
                        </div>
                        {lead.interest_level >= 8 && (
                          <Flame className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {lead.lead_type || "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          lead.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : lead.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {lead.status || "Unknown"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              lead.interest_level >= 8
                                ? "bg-red-500"
                                : lead.interest_level >= 5
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                            }`}
                            style={{
                              width: `${(lead.interest_level || 0) * 10}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {lead.interest_level || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`font-semibold ${
                          lead.credit_score >= 750
                            ? "text-green-600"
                            : lead.credit_score >= 700
                            ? "text-blue-600"
                            : lead.credit_score >= 650
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {lead.credit_score || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {lead.source || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {lead.last_contact_date
                        ? new Date(lead.last_contact_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    No priority leads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Lead Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {statusChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Interest Level Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-600" />
            Interest Level Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={interestChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Lead Type Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={typeChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {typeChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Credit Score Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Credit Score Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={creditChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Funnel & Decision Stages */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUpDown className="w-5 h-5 text-blue-600" />
          Conversion Funnel - Decision Stages
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={decisionStageData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={120} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#6366f1" name="Lead Count" />
            <Bar dataKey="conversion" fill="#10b981" name="Avg Conversion %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Conversion Trend (30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={conversionTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="conversion"
                stroke="#10b981"
                fill="#86efac"
                name="Conversion %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600" />
            Trust Score Trend (30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trustTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="trust"
                stroke="#14b8a6"
                fill="#5eead4"
                name="Trust %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Behavioral Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Intent Strength
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={intentStrengthData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {intentStrengthData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            Dominant Emotions
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={emotionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Follow-up Priority
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={followupData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {followupData.map((entry, index) => {
                  const color =
                    entry.name === "High"
                      ? "#ef4444"
                      : entry.name === "Medium"
                      ? "#f59e0b"
                      : "#10b981";
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-row gap-6">
          <div className="flex-1">
            <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Common Pain Points
            </h4>
            <div className="flex flex-wrap gap-2">
              {analytics.top_pain_points &&
              analytics.top_pain_points.length > 0 ? (
                analytics.top_pain_points.slice(0, 10).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="font-medium text-gray-700">
                      {item.pain_point}
                    </span>
                    <span className="text-xs text-gray-500 bg-red-100 px-2 py-1 rounded-full">
                      {item.frequency}x
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No pain points available yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

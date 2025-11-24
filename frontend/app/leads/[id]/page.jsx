"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  User,
  TrendingUp,
  Brain,
  MessageSquare,
  BarChart3,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Target,
  Heart,
  Zap,
  Users,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Activity,
  Gauge,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Sparkles,
  Flame,
  RefreshCw,
} from "lucide-react";
import { getLeadDetails, analyzeLead } from "@/services/leadService";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id;

  const [leadData, setLeadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedCalls, setExpandedCalls] = useState({});
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLeadDetails(leadId);
        setLeadData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [leadId]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysisStatus(null);
    try {
      const status = await analyzeLead(leadId);
      setAnalysisStatus(status);

      // Refresh lead data after analysis
      const refreshedData = await getLeadDetails(leadId);
      setLeadData(refreshedData);
    } catch (err) {
      setAnalysisStatus({
        success: false,
        actions_taken: [err.message],
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleCallExpand = (callId) => {
    setExpandedCalls((prev) => ({ ...prev, [callId]: !prev[callId] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lead details...</p>
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
          <button
            onClick={() => router.push("/leads")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  if (!leadData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Lead not found</p>
      </div>
    );
  }

  // Aggregate AI analysis from all calls
  const allAnalyses =
    leadData.call_logs?.flatMap((log) => log.unstructured_analyses || []) || [];
  const latestAnalysis = allAnalyses[allAnalyses.length - 1] || {};

  // Check for unanalyzed calls
  const unanalyzedCalls =
    leadData.call_logs?.filter(
      (call) =>
        call.transcription &&
        (!call.unstructured_analyses || call.unstructured_analyses.length === 0)
    ) || [];
  const hasUnanalyzedCalls = unanalyzedCalls.length > 0;

  // Calculate average metrics
  const avgConversionProb =
    allAnalyses.length > 0
      ? (
          allAnalyses.reduce(
            (sum, a) => sum + (a.conversion_probability || 0),
            0
          ) / allAnalyses.length
        ).toFixed(1)
      : 0;
  const avgTrustScore =
    allAnalyses.length > 0
      ? (
          allAnalyses.reduce((sum, a) => sum + (a.trust_score || 0), 0) /
          allAnalyses.length
        ).toFixed(1)
      : 0;
  const avgClarityScore =
    allAnalyses.length > 0
      ? (
          allAnalyses.reduce((sum, a) => sum + (a.clarity_score || 0), 0) /
          allAnalyses.length
        ).toFixed(1)
      : 0;
  const avgEmpathyScore =
    allAnalyses.length > 0
      ? (
          allAnalyses.reduce((sum, a) => sum + (a.empathy_score || 0), 0) /
          allAnalyses.length
        ).toFixed(1)
      : 0;

  // Calculate engagement metrics
  const totalCalls = leadData.call_logs?.length || 0;
  const avgCallDuration =
    totalCalls > 0
      ? Math.round(
          leadData.call_logs.reduce(
            (sum, c) => sum + (c.duration_minutes || 0),
            0
          ) / totalCalls
        )
      : 0;
  const daysSinceLastContact = leadData.last_contact_date
    ? Math.floor(
        (new Date() - new Date(leadData.last_contact_date)) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  // Conversion trend calculation
  const conversionTrend =
    allAnalyses.length > 1
      ? (allAnalyses[allAnalyses.length - 1]?.conversion_probability || 0) -
        (allAnalyses[0]?.conversion_probability || 0)
      : 0;

  // Determine priority level
  const latestConversion = latestAnalysis.conversion_probability || 0;
  const priorityLevel =
    latestConversion >= 70 ? "high" : latestConversion >= 40 ? "medium" : "low";
  const priorityLabel =
    latestConversion >= 70
      ? "Hot Lead"
      : latestConversion >= 40
      ? "Warm Lead"
      : "Cold Lead";

  // Sentiment distribution
  const sentimentCounts = allAnalyses.reduce((acc, a) => {
    const sentiment = a.sentiment || "neutral";
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {});
  const sentimentData = Object.entries(sentimentCounts).map(
    ([name, value]) => ({ name, value })
  );

  // Conversation quality trends across calls
  const qualityTrend =
    leadData.call_logs?.map((log, idx) => {
      const analysis = log.unstructured_analyses?.[0];
      return {
        call: `Call ${idx + 1}`,
        callNum: idx + 1,
        conversion: analysis?.conversion_probability || 0,
        trust: analysis?.trust_score ? analysis.trust_score * 10 : 0,
        clarity: analysis?.clarity_score ? analysis.clarity_score * 10 : 0,
        empathy: analysis?.empathy_score ? analysis.empathy_score * 10 : 0,
      };
    }) || [];

  // Multi-metric radar for latest call
  const radarData = [
    { metric: "Trust", value: latestAnalysis.trust_score || 0, fullMark: 10 },
    {
      metric: "Clarity",
      value: latestAnalysis.clarity_score || 0,
      fullMark: 10,
    },
    {
      metric: "Empathy",
      value: latestAnalysis.empathy_score || 0,
      fullMark: 10,
    },
    {
      metric: "Politeness",
      value: latestAnalysis.politeness_level || 0,
      fullMark: 10,
    },
    {
      metric: "Formality",
      value: latestAnalysis.formality_level || 0,
      fullMark: 10,
    },
  ];

  // Emotion profile data
  const emotionData = latestAnalysis.emotion_profile
    ? Object.entries(latestAnalysis.emotion_profile).map(
        ([emotion, score]) => ({
          name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
          value: (score * 100).toFixed(0),
        })
      )
    : [];

  // Keywords frequency
  const keywordsData = latestAnalysis.keywords
    ? Array.isArray(latestAnalysis.keywords)
      ? latestAnalysis.keywords.slice(0, 10).map((kw, i) => ({
          keyword: typeof kw === "string" ? kw : kw.keyword,
          frequency: typeof kw === "object" ? kw.frequency || 10 - i : 10 - i,
        }))
      : []
    : [];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/leads")}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">{leadData.name}</h1>
          <p className="text-gray-500">{leadData.lead_type || "Lead"}</p>
        </div>
        <div className="flex gap-2">
          {hasUnanalyzedCalls && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition"
            >
              <RefreshCw
                className={`w-4 h-4 ${analyzing ? "animate-spin" : ""}`}
              />
              {analyzing
                ? "Analyzing..."
                : `Analyze ${unanalyzedCalls.length} Call${
                    unanalyzedCalls.length > 1 ? "s" : ""
                  }`}
            </button>
          )}
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
              priorityLevel === "high"
                ? "bg-red-100 text-red-700"
                : priorityLevel === "medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {priorityLevel === "high" ? (
              <Flame className="w-4 h-4" />
            ) : priorityLevel === "medium" ? (
              <Zap className="w-4 h-4" />
            ) : (
              <Target className="w-4 h-4" />
            )}
            {priorityLabel}
          </span>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              leadData.status === "Active"
                ? "bg-green-100 text-green-700"
                : leadData.status === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {leadData.status}
          </span>
        </div>
      </div>

      {/* Analysis Status Alert */}
      {analysisStatus && (
        <div
          className={`rounded-lg border p-4 ${
            analysisStatus.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {analysisStatus.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4
                className={`font-semibold mb-1 ${
                  analysisStatus.success ? "text-green-900" : "text-red-900"
                }`}
              >
                {analysisStatus.success
                  ? "Analysis Complete"
                  : "Analysis Failed"}
              </h4>
              <ul className="text-sm space-y-1">
                {analysisStatus.actions_taken?.map((action, idx) => (
                  <li
                    key={idx}
                    className={
                      analysisStatus.success ? "text-green-700" : "text-red-700"
                    }
                  >
                    • {action}
                  </li>
                ))}
                {analysisStatus.analysis_errors?.map((error, idx) => (
                  <li key={idx} className="text-red-700">
                    • Error: {error}
                  </li>
                ))}
              </ul>
              {analysisStatus.newly_analyzed > 0 && (
                <p className="text-sm text-green-700 mt-2">
                  ✓ Analyzed {analysisStatus.newly_analyzed} call
                  {analysisStatus.newly_analyzed > 1 ? "s" : ""}
                </p>
              )}
              {analysisStatus.newly_scored && analysisStatus.score_value && (
                <p className="text-sm text-green-700 mt-1">
                  ✓ Lead score: {analysisStatus.score_value}
                </p>
              )}
            </div>
            <button
              onClick={() => setAnalysisStatus(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Unanalyzed Calls Warning - Show only call details */}
      {hasUnanalyzedCalls && allAnalyses.length === 0 ? (
        <div className="space-y-6">
          {/* Call Details with Analyze Prompt */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Call History
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {unanalyzedCalls.length} call
                  {unanalyzedCalls.length > 1 ? "s" : ""} ready for AI analysis
                </p>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition shadow-md hover:shadow-lg"
              >
                <Brain
                  className={`w-5 h-5 ${analyzing ? "animate-spin" : ""}`}
                />
                {analyzing ? "Analyzing..." : "Analyze All Calls"}
              </button>
            </div>

            {/* Call Cards */}
            <div className="space-y-4">
              {leadData.call_logs.map((call, idx) => (
                <div
                  key={call.id}
                  className="border border-gray-200 rounded-lg p-5 hover:border-indigo-300 transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-indigo-100 rounded-lg p-3">
                        <Phone className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          Call #{idx + 1}
                          {!call.unstructured_analyses ||
                          call.unstructured_analyses.length === 0 ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              Not Analyzed
                            </span>
                          ) : null}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(call.call_date).toLocaleDateString()} at{" "}
                          {new Date(call.call_date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="text-xl font-bold text-gray-800">
                        {call.duration_minutes}m
                      </p>
                    </div>
                  </div>

                  {/* Summary if available */}
                  {call.summary && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Summary
                      </p>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        {call.summary}
                      </p>
                    </div>
                  )}

                  {/* Transcription */}
                  {call.transcription && (
                    <div className="border-t border-gray-100 pt-4">
                      <button
                        onClick={() => toggleCallExpand(call.id)}
                        className="text-indigo-600 text-sm flex items-center gap-2 hover:text-indigo-800 font-medium mb-3"
                      >
                        {expandedCalls[call.id] ? (
                          <>
                            <ChevronUp size={16} /> Hide Transcription
                          </>
                        ) : (
                          <>
                            <ChevronDown size={16} /> Show Transcription
                          </>
                        )}
                      </button>
                      {expandedCalls[call.id] && (
                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed max-h-96 overflow-y-auto">
                          {call.transcription}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Lead Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Lead Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={leadData.email || "N/A"}
              />
              <InfoRow
                icon={<Phone className="w-4 h-4" />}
                label="Phone"
                value={leadData.phone || "N/A"}
              />
              <InfoRow
                icon={<Calendar className="w-4 h-4" />}
                label="Source"
                value={leadData.source || "N/A"}
              />
              <InfoRow
                icon={<TrendingUp className="w-4 h-4" />}
                label="Credit Score"
                value={leadData.credit_score || "N/A"}
              />
              <InfoRow
                icon={<Target className="w-4 h-4" />}
                label="Lead Type"
                value={leadData.lead_type || "N/A"}
              />
              <InfoRow
                icon={<Activity className="w-4 h-4" />}
                label="Status"
                value={leadData.status || "N/A"}
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Executive Summary - KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard
              icon={<Gauge className="w-5 h-5" />}
              label="Conversion Score"
              value={`${latestConversion.toFixed(0)}%`}
              trend={conversionTrend}
              trendLabel={
                conversionTrend > 0
                  ? `+${conversionTrend.toFixed(0)}%`
                  : conversionTrend < 0
                  ? `${conversionTrend.toFixed(0)}%`
                  : "No change"
              }
              color={
                priorityLevel === "high"
                  ? "green"
                  : priorityLevel === "medium"
                  ? "yellow"
                  : "blue"
              }
            />
            <KPICard
              icon={<Heart className="w-5 h-5" />}
              label="Trust Score"
              value={`${(latestAnalysis.trust_score || 0).toFixed(1)}/10`}
              subtitle={`Avg: ${avgTrustScore}`}
              color="pink"
            />
            <KPICard
              icon={<Sparkles className="w-5 h-5" />}
              label="Engagement"
              value={leadData.interest_level || "N/A"}
              subtitle={`${totalCalls} calls`}
              color="purple"
            />
            <KPICard
              icon={<Activity className="w-5 h-5" />}
              label="Avg Call Duration"
              value={`${avgCallDuration}m`}
              subtitle={`Total: ${totalCalls} calls`}
              color="indigo"
            />
            <KPICard
              icon={<Clock className="w-5 h-5" />}
              label="Last Contact"
              value={
                daysSinceLastContact !== null
                  ? `${daysSinceLastContact}d`
                  : "N/A"
              }
              subtitle={
                daysSinceLastContact > 7 ? "Follow up needed" : "Recent"
              }
              color={daysSinceLastContact > 7 ? "red" : "green"}
            />
          </div>

          {!leadData.call_logs || leadData.call_logs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center mt-6">
              <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Call History Yet
              </h3>
              <p className="text-gray-500 mb-6">
                There are no call logs available for this lead. Once calls are
                recorded and analyzed, detailed insights will appear here.
              </p>
              <div className="bg-indigo-50 rounded-lg p-6 max-w-md mx-auto">
                <h4 className="font-semibold text-indigo-900 mb-2">
                  Lead Information
                </h4>
                <div className="space-y-3 text-left">
                  <InfoRow
                    icon={<Mail className="w-4 h-4" />}
                    label="Email"
                    value={leadData.email || "N/A"}
                  />
                  <InfoRow
                    icon={<Phone className="w-4 h-4" />}
                    label="Phone"
                    value={leadData.phone || "N/A"}
                  />
                  <InfoRow
                    icon={<Calendar className="w-4 h-4" />}
                    label="Source"
                    value={leadData.source || "N/A"}
                  />
                  <InfoRow
                    icon={<TrendingUp className="w-4 h-4" />}
                    label="Credit Score"
                    value={leadData.credit_score || "N/A"}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex gap-6">
                  <TabButton
                    active={activeTab === "overview"}
                    onClick={() => setActiveTab("overview")}
                    icon={<BarChart3 className="w-4 h-4" />}
                    label="Intelligence Dashboard"
                  />
                  <TabButton
                    active={activeTab === "conversion"}
                    onClick={() => setActiveTab("conversion")}
                    icon={<TrendingUp className="w-4 h-4" />}
                    label="Conversion Analysis"
                  />
                  <TabButton
                    active={activeTab === "emotional"}
                    onClick={() => setActiveTab("emotional")}
                    icon={<Heart className="w-4 h-4" />}
                    label="Emotional Intelligence"
                  />
                  <TabButton
                    active={activeTab === "calls"}
                    onClick={() => setActiveTab("calls")}
                    icon={<MessageSquare className="w-4 h-4" />}
                    label="Call Details"
                  />
                  <TabButton
                    active={activeTab === "insights"}
                    onClick={() => setActiveTab("insights")}
                    icon={<Brain className="w-4 h-4" />}
                    label="AI Insights"
                  />
                </div>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Conversion Journey Tracker */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-600" />
                        Conversion Journey Progress
                      </h3>
                      <ConversionJourneyTracker
                        currentStage={
                          latestAnalysis.decision_stage || "awareness"
                        }
                        intentStrength={
                          latestAnalysis.intent_strength || "weak"
                        }
                      />
                    </div>

                    {/* Multi-Metric Performance */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Performance Across Calls
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <ComposedChart data={qualityTrend}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f0f0f0"
                            />
                            <XAxis dataKey="call" />
                            <YAxis
                              label={{
                                value: "Score",
                                angle: -90,
                                position: "insideLeft",
                              }}
                            />
                            <Tooltip />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="conversion"
                              fill="#6366f1"
                              fillOpacity={0.2}
                              stroke="#6366f1"
                              strokeWidth={2}
                              name="Conversion %"
                            />
                            <Line
                              type="monotone"
                              dataKey="trust"
                              stroke="#ec4899"
                              strokeWidth={2}
                              name="Trust (x10)"
                            />
                            <Line
                              type="monotone"
                              dataKey="empathy"
                              stroke="#8b5cf6"
                              strokeWidth={2}
                              name="Empathy (x10)"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Conversation Quality Radar
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis
                              dataKey="metric"
                              tick={{ fill: "#6b7280", fontSize: 12 }}
                            />
                            <PolarRadiusAxis
                              angle={90}
                              domain={[0, 10]}
                              tick={{ fill: "#9ca3af", fontSize: 10 }}
                            />
                            <Radar
                              name="Current"
                              dataKey="value"
                              stroke="#6366f1"
                              fill="#6366f1"
                              fillOpacity={0.5}
                              strokeWidth={2}
                            />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Contact Info & Quick Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-indigo-600" />
                          Lead Information
                        </h3>
                        <div className="space-y-4">
                          <InfoRow
                            icon={<Mail className="w-4 h-4" />}
                            label="Email"
                            value={leadData.email || "N/A"}
                          />
                          <InfoRow
                            icon={<Phone className="w-4 h-4" />}
                            label="Phone"
                            value={leadData.phone || "N/A"}
                          />
                          <InfoRow
                            icon={<Calendar className="w-4 h-4" />}
                            label="Source"
                            value={leadData.source || "N/A"}
                          />
                          <InfoRow
                            icon={<TrendingUp className="w-4 h-4" />}
                            label="Credit Score"
                            value={leadData.credit_score || "N/A"}
                          />
                        </div>
                      </div>

                      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-600" />
                          Key Insights & Recommendations
                        </h3>
                        <KeyInsightsPanel
                          latestAnalysis={latestAnalysis}
                          conversionTrend={conversionTrend}
                          daysSinceLastContact={daysSinceLastContact}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "conversion" && (
                  <div className="space-y-6">
                    {/* Conversion Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <MetricCard
                        icon={<Target className="w-6 h-6 text-indigo-600" />}
                        label="Current Conversion"
                        value={`${latestConversion.toFixed(0)}%`}
                        subtitle={`Average: ${avgConversionProb}%`}
                        trend={conversionTrend}
                      />
                      <MetricCard
                        icon={<Zap className="w-6 h-6 text-yellow-600" />}
                        label="Intent Strength"
                        value={latestAnalysis.intent_strength || "Unknown"}
                        subtitle={latestAnalysis.intent_type || "N/A"}
                      />
                      <MetricCard
                        icon={<Activity className="w-6 h-6 text-purple-600" />}
                        label="Decision Stage"
                        value={latestAnalysis.decision_stage || "Unknown"}
                        subtitle={
                          latestAnalysis.outcome_classification || "N/A"
                        }
                      />
                    </div>

                    {/* Pain Points & Objections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          Pain Points
                        </h3>
                        {latestAnalysis.pain_points ? (
                          <p className="text-sm text-gray-700 bg-red-50 rounded-lg p-4">
                            {latestAnalysis.pain_points}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            No pain points identified
                          </p>
                        )}
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-orange-600" />
                          Objections
                        </h3>
                        {latestAnalysis.objections ? (
                          <p className="text-sm text-gray-700 bg-orange-50 rounded-lg p-4">
                            {latestAnalysis.objections}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            No objections raised
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Next Actions */}
                    {latestAnalysis.next_actions && (
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-100 p-6">
                        <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-indigo-600" />
                          Recommended Next Actions
                        </h3>
                        <p className="text-sm text-indigo-800 mb-3">
                          {latestAnalysis.next_actions}
                        </p>
                        <div className="flex items-center gap-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              latestAnalysis.followup_priority === "High"
                                ? "bg-red-200 text-red-800"
                                : latestAnalysis.followup_priority === "Medium"
                                ? "bg-yellow-200 text-yellow-800"
                                : "bg-green-200 text-green-800"
                            }`}
                          >
                            Priority:{" "}
                            {latestAnalysis.followup_priority || "Medium"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "emotional" && (
                  <div className="space-y-6">
                    {/* Emotional Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <EmotionalMetricCard
                        label="Sentiment"
                        value={latestAnalysis.sentiment || "neutral"}
                        icon={
                          latestAnalysis.sentiment === "positive" ? (
                            <ThumbsUp className="w-5 h-5" />
                          ) : latestAnalysis.sentiment === "negative" ? (
                            <ThumbsDown className="w-5 h-5" />
                          ) : (
                            <Minus className="w-5 h-5" />
                          )
                        }
                        color={
                          latestAnalysis.sentiment === "positive"
                            ? "green"
                            : latestAnalysis.sentiment === "negative"
                            ? "red"
                            : "gray"
                        }
                      />
                      <EmotionalMetricCard
                        label="Dominant Emotion"
                        value={latestAnalysis.dominant_emotion || "Unknown"}
                        icon={<Heart className="w-5 h-5" />}
                        color="pink"
                      />
                      <EmotionalMetricCard
                        label="Tone"
                        value={latestAnalysis.tone || "Unknown"}
                        icon={<MessageSquare className="w-5 h-5" />}
                        color="purple"
                      />
                      <EmotionalMetricCard
                        label="Empathy Score"
                        value={`${(latestAnalysis.empathy_score || 0).toFixed(
                          1
                        )}/10`}
                        icon={<Heart className="w-5 h-5" />}
                        color="indigo"
                      />
                    </div>

                    {/* Emotion Profile & Sentiment Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {emotionData.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Emotion Profile Distribution
                          </h3>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={emotionData} layout="vertical">
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f0f0f0"
                              />
                              <XAxis type="number" domain={[0, 100]} />
                              <YAxis
                                type="category"
                                dataKey="name"
                                width={100}
                              />
                              <Tooltip />
                              <Bar
                                dataKey="value"
                                fill="#ec4899"
                                name="Intensity %"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Sentiment Across Calls
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={sentimentData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label={(entry) => `${entry.name}: ${entry.value}`}
                            >
                              {sentimentData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    entry.name === "positive"
                                      ? "#10b981"
                                      : entry.name === "negative"
                                      ? "#ef4444"
                                      : "#6b7280"
                                  }
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "calls" && (
                  <div className="space-y-4">
                    {leadData.call_logs && leadData.call_logs.length > 0 ? (
                      leadData.call_logs.map((call, idx) => (
                        <EnhancedCallCard
                          key={call.id}
                          call={call}
                          callNumber={idx + 1}
                          expanded={expandedCalls[call.id]}
                          onToggle={() => toggleCallExpand(call.id)}
                        />
                      ))
                    ) : (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                          No call logs available
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          Call history will appear here once calls are recorded
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "insights" && (
                  <div className="space-y-6">
                    {allAnalyses.length > 0 ? (
                      allAnalyses.map((analysis, idx) => (
                        <AIAnalysisCard
                          key={idx}
                          analysis={analysis}
                          index={idx}
                        />
                      ))
                    ) : (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                        <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                          No AI analysis available
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// Helper Components
function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
        active
          ? "border-indigo-600 text-indigo-600 font-medium"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function AIAnalysisCard({ analysis, index }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-indigo-600" />
        <h4 className="text-lg font-semibold text-gray-800">
          Analysis #{index + 1}
        </h4>
        <span className="ml-auto text-xs text-gray-500">
          {analysis.model_name}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <MetricCard label="Sentiment" value={analysis.sentiment} />
        <MetricCard label="Tone" value={analysis.tone} />
        <MetricCard label="Intent" value={analysis.intent_type} />
        <MetricCard label="Intent Strength" value={analysis.intent_strength} />
        <MetricCard label="Decision Stage" value={analysis.decision_stage} />
        <MetricCard
          label="Conversion Probability"
          value={`${analysis.conversion_probability}%`}
        />
        <MetricCard label="Trust Score" value={`${analysis.trust_score}/10`} />
        <MetricCard
          label="Clarity Score"
          value={`${analysis.clarity_score}/10`}
        />
        <MetricCard
          label="Empathy Score"
          value={`${analysis.empathy_score}/10`}
        />
      </div>

      {analysis.summary_ai && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">AI Summary</p>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
            {analysis.summary_ai}
          </p>
        </div>
      )}

      {analysis.keywords && analysis.keywords.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Keywords</p>
          <div className="flex flex-wrap gap-2">
            {analysis.keywords.map((kw, i) => (
              <span
                key={i}
                className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full"
              >
                {typeof kw === "string" ? kw : kw.keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.pain_points && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Pain Points</p>
          <p className="text-sm text-gray-600">{analysis.pain_points}</p>
        </div>
      )}

      {analysis.objections && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Objections</p>
          <p className="text-sm text-gray-600">{analysis.objections}</p>
        </div>
      )}

      {analysis.next_actions && (
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm font-medium text-indigo-900 mb-2">
            Recommended Next Actions
          </p>
          <p className="text-sm text-indigo-700">{analysis.next_actions}</p>
          <p className="text-xs text-indigo-600 mt-2">
            Priority: {analysis.followup_priority}
          </p>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || "N/A"}</p>
    </div>
  );
}

// New Helper Components for Enhanced Dashboard

function KPICard({ icon, label, value, trend, trendLabel, subtitle, color }) {
  const colorClasses = {
    green: "bg-green-50 text-green-600 border-green-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    pink: "bg-pink-50 text-pink-600 border-pink-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    red: "bg-red-50 text-red-600 border-red-200",
  };

  const trendColorClasses =
    trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-600";
  const TrendIcon =
    trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus;

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6 hover:shadow-md transition">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
      {(subtitle || trendLabel) && (
        <div className="flex items-center gap-2">
          {trendLabel && trend !== undefined && (
            <span
              className={`flex items-center text-xs font-medium ${trendColorClasses}`}
            >
              <TrendIcon className="w-3 h-3 mr-1" />
              {trendLabel}
            </span>
          )}
          {subtitle && !trendLabel && (
            <p className="text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}

function ConversionJourneyTracker({ currentStage, intentStrength }) {
  const stages = [
    {
      id: "awareness",
      label: "Awareness",
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      id: "consideration",
      label: "Consideration",
      icon: <Brain className="w-5 h-5" />,
    },
    { id: "decision", label: "Decision", icon: <Target className="w-5 h-5" /> },
    {
      id: "action",
      label: "Action",
      icon: <CheckCircle className="w-5 h-5" />,
    },
  ];

  const currentIndex = stages.findIndex(
    (s) => s.id === currentStage?.toLowerCase()
  );
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  const intentColors = {
    strong: "bg-green-500",
    moderate: "bg-yellow-500",
    weak: "bg-gray-400",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {stages.map((stage, idx) => (
          <div key={stage.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition ${
                  idx <= activeIndex
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {stage.icon}
              </div>
              <p
                className={`text-xs font-medium ${
                  idx <= activeIndex ? "text-indigo-600" : "text-gray-400"
                }`}
              >
                {stage.label}
              </p>
            </div>
            {idx < stages.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 rounded transition ${
                  idx < activeIndex ? "bg-indigo-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 justify-center pt-4">
        <span className="text-sm text-gray-600">Intent Strength:</span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
            intentColors[intentStrength?.toLowerCase()] || "bg-gray-400"
          }`}
        >
          {intentStrength || "Unknown"}
        </span>
      </div>
    </div>
  );
}

function KeyInsightsPanel({
  latestAnalysis,
  conversionTrend,
  daysSinceLastContact,
}) {
  const insights = [];

  if (conversionTrend > 10) {
    insights.push({
      icon: <TrendingUp className="w-5 h-5 text-green-600" />,
      text: `Conversion probability increased by ${conversionTrend.toFixed(
        0
      )}% - Strong positive trend!`,
      type: "success",
    });
  } else if (conversionTrend < -10) {
    insights.push({
      icon: <TrendingDown className="w-5 h-5 text-red-600" />,
      text: `Conversion probability declined by ${Math.abs(
        conversionTrend
      ).toFixed(0)}% - Immediate attention needed`,
      type: "warning",
    });
  }

  if (daysSinceLastContact > 7) {
    insights.push({
      icon: <Clock className="w-5 h-5 text-orange-600" />,
      text: `No contact for ${daysSinceLastContact} days - Schedule follow-up soon`,
      type: "warning",
    });
  }

  if (latestAnalysis.followup_priority === "High") {
    insights.push({
      icon: <Flame className="w-5 h-5 text-red-600" />,
      text: "High priority follow-up required - Hot lead opportunity",
      type: "urgent",
    });
  }

  if ((latestAnalysis.trust_score || 0) >= 8) {
    insights.push({
      icon: <Heart className="w-5 h-5 text-pink-600" />,
      text: "High trust score - Strong relationship established",
      type: "success",
    });
  }

  if (latestAnalysis.objections) {
    insights.push({
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
      text: "Active objections identified - Address concerns in next interaction",
      type: "info",
    });
  }

  const bgColors = {
    success: "bg-green-50 border-green-200",
    warning: "bg-orange-50 border-orange-200",
    urgent: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div className="space-y-3">
      {insights.length > 0 ? (
        insights.map((insight, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 p-4 rounded-lg border ${
              bgColors[insight.type]
            }`}
          >
            {insight.icon}
            <p className="text-sm text-gray-700 flex-1">{insight.text}</p>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500 italic">
          No significant insights at this time
        </p>
      )}
    </div>
  );
}

function EmotionalMetricCard({ label, value, icon, color }) {
  const colorClasses = {
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
    pink: "bg-pink-50 text-pink-700 border-pink-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-lg font-bold capitalize">{value}</p>
    </div>
  );
}

function EnhancedCallCard({ call, callNumber, expanded, onToggle }) {
  const analysis = call.unstructured_analyses?.[0];
  const sentiment = call.sentiment || analysis?.sentiment || "neutral";
  const sentimentColor =
    sentiment === "positive"
      ? "green"
      : sentiment === "negative"
      ? "red"
      : "gray";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-4">
          <div className="bg-indigo-100 rounded-lg p-3">
            <Phone className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              Call #{callNumber}
              {analysis && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    sentimentColor === "green"
                      ? "bg-green-100 text-green-700"
                      : sentimentColor === "red"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {sentiment}
                </span>
              )}
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(call.call_date).toLocaleDateString()} at{" "}
              {new Date(call.call_date).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Duration</p>
          <p className="text-xl font-bold text-gray-800">
            {call.duration_minutes}m
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      {analysis && (
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Conversion</p>
            <p className="text-lg font-bold text-indigo-600">
              {analysis.conversion_probability}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Trust</p>
            <p className="text-lg font-bold text-pink-600">
              {(analysis.trust_score || 0).toFixed(1)}/10
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Clarity</p>
            <p className="text-lg font-bold text-purple-600">
              {(analysis.clarity_score || 0).toFixed(1)}/10
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Empathy</p>
            <p className="text-lg font-bold text-green-600">
              {(analysis.empathy_score || 0).toFixed(1)}/10
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      {(call.summary || analysis?.summary_ai) && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Summary
          </p>
          <p className="text-sm text-gray-600 bg-indigo-50 rounded-lg p-3">
            {analysis?.summary_ai || call.summary}
          </p>
        </div>
      )}

      {/* Transcription Toggle */}
      {call.transcription && (
        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={onToggle}
            className="text-indigo-600 text-sm flex items-center gap-2 hover:text-indigo-800 font-medium mb-3"
          >
            {expanded ? (
              <>
                <ChevronUp size={16} /> Hide Transcription
              </>
            ) : (
              <>
                <ChevronDown size={16} /> Show Transcription
              </>
            )}
          </button>
          {expanded && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
              {call.transcription}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

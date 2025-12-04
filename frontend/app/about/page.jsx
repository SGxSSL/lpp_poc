"use client";

import {
  Brain,
  Target,
  Phone,
  TrendingUp,
  Shield,
  Heart,
  Zap,
  MessageSquare,
  BarChart3,
  Users,
  Award,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
} from "lucide-react";

export default function AboutPage() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description:
        "Advanced Gemini AI analyzes call transcriptions to extract deep insights including sentiment, intent, emotions, and behavioral patterns.",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: MessageSquare,
      title: "Clarity Analysis",
      description:
        "Measures communication effectiveness, identifies objections, and tracks how well messages are conveyed during calls.",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      icon: Heart,
      title: "Emotional Intelligence",
      description:
        "Detects and tracks emotional states throughout conversations including joy, frustration, interest, and hesitation.",
      color: "bg-pink-100 text-pink-600",
    },
    {
      icon: Shield,
      title: "Trust Scoring",
      description:
        "Analyzes conversation dynamics, politeness levels, and cooperation to measure customer trust and relationship quality.",
      color: "bg-teal-100 text-teal-600",
    },
    {
      icon: Target,
      title: "Lead Scoring",
      description:
        "Intelligent scoring system combines structured data (credit score, demographics) with unstructured AI insights to prioritize high-value leads.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: TrendingUp,
      title: "Conversion Prediction",
      description:
        "Machine learning models predict conversion probability based on call quality, customer engagement, and historical patterns.",
      color: "bg-green-100 text-green-600",
    },
  ];

  const metrics = [
    {
      icon: Users,
      label: "Total Leads",
      description: "All leads in the system",
    },
    {
      icon: Activity,
      label: "Active Leads",
      description: "Currently engaged prospects",
    },
    {
      icon: Phone,
      label: "Analyzed Calls",
      description: "AI-processed conversations",
    },
    {
      icon: Award,
      label: "Hot Leads",
      description: "High-priority opportunities",
    },
    {
      icon: Target,
      label: "Conversion Rate",
      description: "Predicted success probability",
    },
    {
      icon: Shield,
      label: "Trust Score",
      description: "Relationship quality metric",
    },
    {
      icon: MessageSquare,
      label: "Clarity Score",
      description: "Communication effectiveness",
    },
    {
      icon: Heart,
      label: "Empathy Score",
      description: "Emotional connection level",
    },
  ];

  const dashboardSections = [
    {
      title: "KPI Cards",
      description:
        "8 key performance indicators showing total leads, active leads, hot leads, average credit score, conversion probability, trust score, clarity, and empathy scores.",
      icon: BarChart3,
      color: "text-blue-600",
    },
    {
      title: "Distribution Charts",
      description:
        "Visual breakdowns of lead status, types, interest levels, credit scores showing the composition of your lead pipeline.",
      icon: BarChart3,
      color: "text-purple-600",
    },
    {
      title: "Conversion Funnel",
      description:
        "Track leads through decision stages (Awareness → Consideration → Decision → Action) with conversion rates at each stage.",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Performance Trends",
      description:
        "30-day trends for conversion probability and trust scores to identify patterns and improvements over time.",
      icon: Activity,
      color: "text-teal-600",
    },
    {
      title: "Behavioral Insights",
      description:
        "Intent strength analysis, dominant emotions tracking, and follow-up priority distribution for strategic engagement.",
      icon: Zap,
      color: "text-yellow-600",
    },
    {
      title: "AI Insights Summary",
      description:
        "Top keywords and common pain points extracted from customer conversations to understand market needs.",
      icon: Lightbulb,
      color: "text-orange-600",
    },
    {
      title: "Priority Leads Table",
      description:
        "Top 10 high-priority leads based on interest level and credit score with detailed metrics and contact information.",
      icon: Users,
      color: "text-red-600",
    },
  ];

  const aiCapabilities = [
    "Sentiment Analysis (Positive, Neutral, Negative)",
    "Intent Detection (Purchase, Information, Complaint)",
    "Decision Stage Identification (Awareness, Consideration, Decision, Action)",
    "Emotion Profiling (Joy, Frustration, Interest, Hesitation, Anger)",
    "Pain Point Extraction",
    "Objection Identification",
    "Keyword & Topic Extraction",
    "Conversation Quality Scoring",
    "Trust & Empathy Measurement",
    "Next Action Recommendations",
    "Follow-up Priority Classification",
    "Deception Marker Detection",
    "Talk Ratio Analysis",
    "Interruption Tracking",
    "Response Latency Measurement",
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-8">
        <h1 className="text-4xl font-bold mb-3">Lead Intelligence Platform</h1>
        <p className="text-xl text-indigo-100">
          AI-powered lead prioritization and customer intelligence system
        </p>
      </div>

      {/* Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Platform Overview
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          The Lead Intelligence Platform is a comprehensive CRM solution that
          leverages advanced AI to analyze customer interactions, predict
          conversion probability, and prioritize leads based on multiple
          behavioral and demographic factors.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Using Google's Gemini 2.5 Flash AI model, the platform processes call
          transcriptions to extract deep insights about customer sentiment,
          intent, emotional state, and engagement level. These insights are
          combined with structured data (credit scores, demographics,
          interaction history) to generate actionable intelligence for sales
          teams.
        </p>
      </div>

      {/* Key Features */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
            >
              <div
                className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}
              >
                <feature.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Dashboard Metrics Explained
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                <metric.icon size={24} className="text-gray-600" />
              </div>
              <h4 className="font-semibold text-gray-800 text-sm mb-1">
                {metric.label}
              </h4>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard Sections */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Dashboard Sections
        </h2>
        <div className="space-y-4">
          {dashboardSections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-4"
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0`}
              >
                <section.icon size={20} className={section.color} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {section.title}
                </h3>
                <p className="text-gray-600 text-sm">{section.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Capabilities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Brain className="w-7 h-7 text-purple-600" />
          AI Analysis Capabilities
        </h2>
        <p className="text-gray-600 mb-6">
          The platform's AI engine extracts 25+ data points from each call
          transcription:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {aiCapabilities.map((capability, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
            >
              <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">{capability}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">How It Works</h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Lead Creation & Call Logging
              </h3>
              <p className="text-gray-600">
                Leads are added to the system with demographic and contact
                information. Customer service officers log calls with
                transcriptions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                AI Analysis
              </h3>
              <p className="text-gray-600">
                Gemini AI processes transcriptions using 4 parallel analysis
                calls to extract sentiment, emotions, intent, behavioral
                patterns, and conversation quality metrics.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Lead Scoring
              </h3>
              <p className="text-gray-600">
                The scoring engine combines structured data (credit score,
                status, source) with AI insights (sentiment, trust, conversion
                probability) to generate a comprehensive lead score.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Dashboard Visualization
              </h3>
              <p className="text-gray-600">
                All insights are visualized in an interactive dashboard with
                charts, trends, and actionable recommendations for sales teams
                to prioritize their efforts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6">Technology Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-300">
              Backend
            </h3>
            <ul className="space-y-2 text-gray-400">
              <li>• FastAPI (Python async framework)</li>
              <li>• PostgreSQL (Supabase hosted)</li>
              <li>• SQLAlchemy (ORM with async support)</li>
              <li>• Google Gemini 2.5 Flash AI</li>
              <li>• Alembic (Database migrations)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-300">
              Frontend
            </h3>
            <ul className="space-y-2 text-gray-400">
              <li>• Next.js 16 (React 19)</li>
              <li>• Tailwind CSS 4</li>
              <li>• Recharts (Data visualization)</li>
              <li>• Lucide Icons</li>
              <li>• Server & Client Components</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

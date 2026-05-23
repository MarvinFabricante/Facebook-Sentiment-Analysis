import React, { useState } from "react";
import { ScanLine, Loader2, CheckCircle, AlertCircle, Trash2, MessageSquare, Layout } from "lucide-react";
import API_BASE_URL from "../../apiConfig";

const Scan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [commentsText, setCommentsText] = useState("");
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);
  const [scanDate, setScanDate] = useState(new Date().toISOString().split('T')[0]);

  const resultConfig = {
    positive: {
      label: "Positive",
      icon: <CheckCircle className="text-green-600" size={24} />,
      bg: "bg-green-100",
      description: "Majority of comments reflect a positive reaction.",
    },
    neutral: {
      label: "Neutral",
      icon: <AlertCircle className="text-indigo-600" size={24} />,
      bg: "bg-indigo-100",
      description: "Audience reaction is mixed or moderate.",
    },
    negative: {
      label: "Negative",
      icon: <AlertCircle className="text-amber-600" size={24} />,
      bg: "bg-amber-100",
      description: "Content may be perceived negatively.",
    },
    analysis_error: { label: "Error", icon: <AlertCircle className="text-red-600" size={24} />, bg: "bg-red-100", description: "Error analyzing content." }
  };

  const getDominantSentiment = (summary) => {
    if (!summary) return "neutral";
    const { positive, negative, neutral } = summary;
    if (positive >= negative && positive >= neutral) return "positive";
    if (negative >= positive && negative >= neutral) return "negative";
    return "neutral";
  };

  const handleScan = async () => {
    if (!postContent.trim() || !commentsText.trim()) {
      setError("Both Post Content and Comments are required.");
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/ml/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          post_content: postContent,
          raw_text: commentsText,
          scan_date: scanDate
        }),
      });

      if (!response.ok) throw new Error("Failed to analyze content");

      const data = await response.json();
      setAnalysisData(data);
      setHasResult(true);
    } catch (err) {
      setError("Connection failed. Ensure the backend is running.");
    } finally {
      setIsScanning(false);
    }
  };

  const clearResults = () => {
    setHasResult(false);
    setAnalysisData(null);
    setPostContent("");
    setCommentsText("");
    setError(null);
  };

  const dominant = getDominantSentiment(analysisData?.summary);
  const current = resultConfig[dominant];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <ScanLine size={28} className="text-cyan-300" />
            <h2 className="text-2xl font-bold">Content Scanner</h2>
          </div>
          <p className="text-indigo-100 max-w-2xl opacity-90">
            Separate your inputs for better accuracy. Paste the main post first, then all comments below.
          </p>
        </div>
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 gap-6">
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
              <Layout size={16} className="text-indigo-500" />
              1. Main Post Content
            </label>
            <input
              type="text"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Example: Si Jeremi nag patuli na!! abangann"
              className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
              <MessageSquare size={16} className="text-emerald-500" />
              2. Bulk Comments
            </label>
            <textarea
              value={commentsText}
              onChange={(e) => setCommentsText(e.target.value)}
              placeholder="Paste raw comments here (Name, Comment, Timestamp format)..."
              className="w-full h-48 px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-sm font-medium resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
              <ScanLine size={16} className="text-blue-500" />
              3. Scan Date (Attribution)
            </label>
            <input
              type="date"
              value={scanDate}
              onChange={(e) => setScanDate(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm font-medium"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-pulse">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <button
          onClick={handleScan}
          disabled={isScanning || !postContent || !commentsText}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none transition-all flex items-center justify-center gap-3"
        >
          {isScanning ? (
            <><Loader2 className="animate-spin" size={20} /> Processing Analysis...</>
          ) : (
            <><ScanLine size={20} /> Begin Deep Scan</>
          )}
        </button>
      </div>

      {hasResult && analysisData && (
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex items-center justify-between animate-in zoom-in-95 duration-500">
          <div className="flex items-center gap-5">
            <div className={`p-4 ${current.bg} rounded-2xl shadow-inner`}>{current.icon}</div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Audience Mood</p>
              <h3 className="text-2xl font-black text-slate-900">{current.label}</h3>
              <p className="text-sm text-slate-500 font-medium">{current.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Data Points</p>
            <p className="text-4xl font-black text-indigo-600">{analysisData.total}</p>
          </div>
        </div>
      )}

      {hasResult && analysisData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-8 hover:translate-y-[-4px] transition-transform">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><CheckCircle size={20} /></div>
              <span className="text-2xl font-black text-emerald-700">{analysisData.summary.positive}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Positive</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">Engagement showing community support.</p>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2rem] p-8 hover:translate-y-[-4px] transition-transform">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><AlertCircle size={20} /></div>
              <span className="text-2xl font-black text-indigo-700">{analysisData.summary.neutral}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Neutral</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">Balanced or informational discourse.</p>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 rounded-[2rem] p-8 hover:translate-y-[-4px] transition-transform">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><AlertCircle size={20} /></div>
              <span className="text-2xl font-black text-amber-700">{analysisData.summary.negative}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Negative</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">Detected friction or critical feedback.</p>
          </div>
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-400">
           <AlertCircle size={14} />
           <p className="text-xs font-medium italic">Model: LSTM-IMDB + Google Translation Engine</p>
        </div>
        <button 
          onClick={clearResults}
          className="px-6 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:text-red-500 hover:border-red-200 transition-all flex items-center gap-2"
        >
          <Trash2 size={14} /> Clear Scan Data
        </button>
      </div>
    </div>
  );
};

export default Scan;

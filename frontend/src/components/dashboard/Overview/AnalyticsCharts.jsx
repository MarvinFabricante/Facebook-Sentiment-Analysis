import React, { useState, useEffect, useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, ChevronDown, Loader2 } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

import API_BASE_URL from '../../../apiConfig';

const AnalyticsCharts = ({ startDate, endDate, searchTerm }) => {
  const [stats, setStats] = useState({
    total: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    analysis_error: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/ml/stats?start_date=${startDate}&end_date=${endDate}&search=${searchTerm}`);
        
        if (!response.ok) throw new Error('Failed to fetch stats');
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [startDate, endDate, searchTerm]);

  const positivePct = useMemo(() => 
    stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0
  , [stats]);

  const sentimentPieData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [stats.positive, stats.neutral, stats.negative],
        backgroundColor: ['#10b981', '#6366f1', '#f43f5e'],
        hoverOffset: 15,
        borderWidth: 0,
        borderRadius: 5,
      }
    ]
  };

  const sentimentBarData = {
    labels: ['Current Dataset'],
    datasets: [
      {
        label: 'Positive',
        data: [stats.positive],
        backgroundColor: '#10b981',
        borderRadius: 6,
        barThickness: 40,
      },
      {
        label: 'Neutral',
        data: [stats.neutral],
        backgroundColor: '#6366f1',
        borderRadius: 6,
        barThickness: 40,
      },
      {
        label: 'Negative',
        data: [stats.negative],
        backgroundColor: '#f43f5e',
        borderRadius: 6,
        barThickness: 40,
      },
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 12,
        titleFont: { size: 12, weight: 'bold' },
      }
    },
    scales: {
      y: { 
        grid: { color: '#f1f5f9', drawBorder: false }, 
        ticks: { color: '#94a3b8', font: { size: 10 } },
        beginAtZero: true 
      },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-gray-500 font-medium">Fetching real-time analytics...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 bg-red-50 rounded-xl border border-red-100">Error: {error}</div>;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Analytics Overview</h2>
          <p className="text-sm text-gray-500 font-medium">Real-time breakdown of {stats.total} total comments.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors">
            Live Database <ChevronDown size={14} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Distribution Analysis</h3>
              <p className="text-xs text-gray-400">Comparison of sentiment labels across all comments</p>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <Bar data={sentimentBarData} options={chartOptions} />
          </div>
        </div>

        <div className="lg:col-span-1 bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
          
          <div className="relative z-10">
            <h3 className="font-bold text-lg mb-1 text-white">Sentiment Score</h3>
            <p className="text-slate-400 text-xs mb-8">Overall community health</p>
            
            <div className="h-44 mb-8 relative">
              <Doughnut 
                data={sentimentPieData} 
                options={{
                  ...chartOptions,
                  cutout: '82%',
                }} 
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white">{positivePct}%</span>
                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Positive</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            {[
              { label: 'Positive', val: stats.positive, color: 'bg-emerald-500', pct: stats.total > 0 ? (stats.positive / stats.total) * 100 : 0 },
              { label: 'Neutral', val: stats.neutral, color: 'bg-indigo-400', pct: stats.total > 0 ? (stats.neutral / stats.total) * 100 : 0 },
              { label: 'Negative', val: stats.negative, color: 'bg-rose-500', pct: stats.total > 0 ? (stats.negative / stats.total) * 100 : 0 },
            ].map((s) => (
              <div key={s.label} className="group">
                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-slate-400 group-hover:text-white transition-colors uppercase tracking-tight">{s.label}</span>
                  <span className="font-mono text-slate-200">{s.val.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`${s.color} h-full rounded-full transition-all duration-1000`} 
                    style={{ width: `${s.pct}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
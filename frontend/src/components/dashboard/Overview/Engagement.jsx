import React, { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { TrendingUp, ArrowUpRight, BarChart3, Zap, Loader2 } from 'lucide-react';
import API_BASE_URL from '../../../apiConfig';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

const Engagement = ({ startDate, endDate, searchTerm }) => {
  const [stats, setStats] = useState({ positive: 0, neutral: 0, negative: 0, total: 0 });
  const [trends, setTrends] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, tRes] = await Promise.all([
          fetch(`${API_BASE_URL}/ml/stats?start_date=${startDate}&end_date=${endDate}&search=${searchTerm}`),
          fetch(`${API_BASE_URL}/ml/trends?start_date=${startDate}&end_date=${endDate}&search=${searchTerm}`)
        ]);
        const sData = await sRes.json();
        const tData = await tRes.json();
        setStats(sData);
        setTrends(tData);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [startDate, endDate, searchTerm]);

  const colors = {
    positive: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.08)' },
    neutral: { stroke: '#6366f1', fill: 'rgba(99, 102, 241, 0.08)' },
    negative: { stroke: '#f43f5e', fill: 'rgba(244, 63, 94, 0.08)' },
  };

  const timelineData = useMemo(() => {
    const dates = Object.keys(trends);
    return {
      labels: dates.length > 0 ? dates : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Positive',
          data: dates.map(d => trends[d].positive),
          borderColor: colors.positive.stroke,
          backgroundColor: colors.positive.fill,
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 2,
          pointHoverRadius: 6,
          pointBackgroundColor: '#fff',
        },
        {
          label: 'Neutral',
          data: dates.map(d => trends[d].neutral),
          borderColor: colors.neutral.stroke,
          backgroundColor: colors.neutral.fill,
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 2,
          pointHoverRadius: 6,
          pointBackgroundColor: '#fff',
        },
        {
          label: 'Negative',
          data: dates.map(d => trends[d].negative),
          borderColor: colors.negative.stroke,
          backgroundColor: colors.negative.fill,
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 2,
          pointHoverRadius: 6,
          pointBackgroundColor: '#fff',
        }
      ]
    };
  }, [trends]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 12,
      }
    },
    scales: {
      y: { grid: { color: '#f1f5f9', drawBorder: false }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    }
  };

  if (loading) return (
    <div className="w-full h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  return (
    <div className="w-full space-y-8 p-4 md:p-0">

      <div className="relative overflow-hidden bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-100">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
              <Zap size={24} className="text-yellow-300 fill-yellow-300" />
            </div>
            <span className="text-sm font-semibold tracking-widest uppercase opacity-80">Live Analytics</span>
          </div>
          <h2 className="text-4xl font-bold mb-2">Sentiment Momentum</h2>
          <p className="text-indigo-100/80 max-w-2xl">
            Real-time data stream from your community. Currently analyzing **{stats.total.toLocaleString()}** interactions.
          </p>
        </div>
        <div className="absolute top-[-20%] right-[-5%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Positive', value: stats.positive, color: 'text-emerald-500', bg: 'bg-emerald-50', icon: <ArrowUpRight /> },
          { label: 'Neutral', value: stats.neutral, color: 'text-indigo-500', bg: 'bg-indigo-50', icon: <BarChart3 /> },
          { label: 'Negative', value: stats.negative, color: 'text-rose-500', bg: 'bg-rose-50', icon: <TrendingUp className="rotate-90" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Reach</span>
            </div>
            <h4 className="text-4xl font-black text-gray-800">{stat.value.toLocaleString()}</h4>
            <p className="text-gray-500 font-medium mt-1">{stat.label} Feedback</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Engagement Velocity</h3>
            <p className="text-gray-400 font-medium">Daily volume of categorized community sentiment</p>
          </div>
          
          <div className="flex gap-4 bg-gray-50 p-3 rounded-2xl">
            {[
              { label: 'Positive', color: 'bg-emerald-500' },
              { label: 'Neutral', color: 'bg-indigo-500' },
              { label: 'Negative', color: 'bg-rose-500' }
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2 px-3">
                <div className={`w-3 h-3 rounded-full ${l.color}`} />
                <span className="text-xs font-bold text-gray-600 uppercase">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="h-[450px] w-full">
          <Line data={timelineData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Engagement;
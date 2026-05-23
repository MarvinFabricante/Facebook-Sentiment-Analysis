import React from 'react';
import { FileText, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';
import API_BASE_URL from '../../../apiConfig';

const Stats = ({ startDate, endDate, searchTerm }) => {
  const [stats, setStats] = React.useState(null);

  React.useEffect(() => {
    setStats(null); // Trigger loading state
    fetch(`${API_BASE_URL}/ml/stats?start_date=${startDate}&end_date=${endDate}&search=${searchTerm}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Failed to fetch stats:", err));
  }, [startDate, endDate, searchTerm]);

  const statData = [
    { 
      label: 'Total Comments', 
      value: stats ? stats.total.toLocaleString() : '...', 
      icon: <MessageSquare size={18} className="text-indigo-600" />,
      trend: stats ? `Positive: ${stats.positive}` : 'Loading...',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statData.map((stat, idx) => (
        <div 
          key={idx} 
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border-l-indigo-500 transition-all duration-200"
        >
          <div className="flex justify-between items-center mb-5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {stat.label}
            </span>
            <div className="p-2 bg-gray-50 rounded-xl flex items-center justify-center">
              {stat.icon}
            </div>
          </div>
          
          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight mb-1">
            {stat.value}
          </h3>

          <p className="text-xs md:text-sm text-gray-500 font-medium">
            {stat.trend}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Stats;

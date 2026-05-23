import React, { useState } from 'react';
import { FileText, Download, Printer, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';

const Reports = ({ startDate, endDate, searchTerm }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const reportItems = [
    "Executive summary with key metrics",
    "Post-by-post performance details",
    "Reaction and sentiment breakdown",
    "Administrator insights and notes",
    "Engagement trends over time",
  ];

  const handleExportCSV = () => {
    window.location.href = `${API_BASE_URL}/reports/export-csv?start_date=${startDate}&end_date=${endDate}&search=${searchTerm}`;
  };

  const handleViewPDF = () => {
    window.open(`${API_BASE_URL}/reports/export-pdf?start_date=${startDate}&end_date=${endDate}&search=${searchTerm}`, '_blank');
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await fetch(`${API_BASE_URL}/ml/stats`);
      setTimeout(() => setIsRefreshing(false), 800);
    } catch (err) {
      console.error("Refresh failed", err);
      setIsRefreshing(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <FileText size={28} className="text-cyan-300" />
            <h2 className="text-2xl font-bold">Reports & Export</h2>
          </div>
          <p className="text-indigo-100 max-w-2xl">
            Generate, export, and print analytics reports including sentiment insights,
            engagement metrics, and performance summaries.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-indigo-600 mb-3">
            <Download size={18} />
            <h3 className="font-bold uppercase tracking-tight">CSV Export</h3>
          </div>

          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Download raw analytics data in CSV format for further analysis in Excel, Numbers, or Google Sheets.
          </p>

          <button 
            onClick={handleExportCSV}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all text-sm font-semibold shadow-md shadow-indigo-100"
          >
            <Download size={16} />
            Export to CSV
          </button>

          <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-wider font-medium">
            FR-19: Data Summarization
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-indigo-600 mb-3">
            <Printer size={18} />
            <h3 className="font-bold uppercase tracking-tight">Printable Report</h3>
          </div>

          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Generate a clean, professional PDF report optimized for management review and physical printing.
          </p>

          <button 
            onClick={handleViewPDF}
            className="w-full border border-gray-300 text-gray-900 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-[0.98] transition-all text-sm font-semibold"
          >
            <Printer size={16} />
            View Printable Report
          </button>

          <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-wider font-medium">
            FR-20: Document Generation
          </p>
        </div>

      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">
          Standard Report Includes:
        </h4>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
          {reportItems.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-3 text-gray-600 text-sm group"
            >
              <div className="p-1 bg-indigo-50 rounded-full group-hover:bg-indigo-100 transition-colors">
                <CheckCircle2 className="text-indigo-500" size={14} />
              </div>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border border-slate-100">
            <AlertCircle size={16} className="text-slate-400" />
          </div>
          <p className="text-xs text-slate-500 font-medium leading-tight">
            Last data sync: <span className="text-slate-700 font-bold">Today, {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </p>
        </div>

        <button 
          onClick={handleRefreshData}
          disabled={isRefreshing}
          className="px-6 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isRefreshing ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Syncing...
            </>
          ) : (
            "Refresh Data"
          )}
        </button>
      </div>

    </div>
  );
};

export default Reports;

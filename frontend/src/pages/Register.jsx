import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import API_BASE_URL from "../apiConfig";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Registration failed");
        return;
      }

      // Automatically log in or just navigate to login
      navigate("/login");
    } catch (err) {
      setError("Server error, please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] flex items-center justify-center min-h-screen font-sans p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl -ml-48 -mt-48 opacity-50" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-100 rounded-full blur-3xl -mr-48 -mb-48 opacity-50" />

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 w-full max-w-[480px] relative z-10 border border-slate-50 transition-all duration-500 animate-in fade-in zoom-in-95">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-indigo-600 p-4 rounded-2xl mb-6 shadow-xl shadow-indigo-200 transform hover:rotate-6 transition-transform duration-300">
            <UserPlus size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Create Account
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Join the administrator network for sentiment analysis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-medium animate-shake">
              <ShieldCheck size={18} /> {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
              Work Email
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
              Verify Security
            </label>
            <div className="relative group">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-base hover:bg-black hover:shadow-xl hover:shadow-slate-200 active:scale-[0.98] transition-all duration-300 mt-2 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Initialize Account"
            )}
          </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-4">
          <button 
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Secure Login
          </button>
          
          <div className="w-full pt-6 border-t border-slate-50 text-center">
             <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
               Authorized Administrator Access Only
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
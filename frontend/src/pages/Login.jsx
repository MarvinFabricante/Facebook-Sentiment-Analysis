import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import API_BASE_URL from "../apiConfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Login failed");
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_email", email);

      navigate("/");
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
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl -mr-48 -mt-48 opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-100 rounded-full blur-3xl -ml-48 -mb-48 opacity-50" />

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 w-full max-w-[480px] relative z-10 border border-slate-50 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-indigo-600 p-4 rounded-2xl mb-6 shadow-xl shadow-indigo-200">
            <LogIn size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Administrator Login
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Secure access to social media sentiment analytics
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-medium">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@analytics.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
              Secret Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-base hover:bg-black hover:shadow-xl hover:shadow-slate-200 active:scale-[0.98] transition-all duration-300 mt-2 flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-black mb-2">
              New to the platform?
            </p>
            <button 
              onClick={() => navigate("/register")}
              className="text-sm text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-colors"
            >
              Create an administrator account
            </button>
          </div>
          
          <div className="w-full pt-6 border-t border-slate-50 text-center">
             <p className="text-[10px] text-slate-300 font-medium italic">
               Demo: garcia@example.com / admin123
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
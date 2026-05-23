import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ThumbsUp, MessageSquare, Share2, FileText, Loader2, RefreshCw } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';

const PostsMetrics = ({ startDate, endDate, searchTerm }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredPosts = React.useMemo(() => {
    if (!searchTerm) return posts;
    return posts.filter(post => 
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [posts, searchTerm]);

  const fetchPosts = useCallback(async (showFullLoader = false) => {
    if (showFullLoader) setLoading(true);
    else setIsRefreshing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/posts/?start_date=${startDate}&end_date=${endDate}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                <FileText size={24} className="text-cyan-300" />
              </div>
              <h2 className="text-2xl font-bold">Posts & Metrics</h2>
            </div>
            <button 
              onClick={() => fetchPosts(false)}
              disabled={isRefreshing || loading}
              className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            >
              <RefreshCw size={20} className={`${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-indigo-100 max-w-2xl mt-2 opacity-90">
            Analyzing '{filteredPosts.length}' individual Facebook posts. Track engagement velocity and content performance at a glance.
          </p>
        </div>
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Posts Overview</h3>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">
              Data synchronized with local database
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase">
              Live Feed
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center py-20 text-gray-400">
              <Loader2 className="animate-spin mb-4 text-indigo-600" size={40} />
              <p className="text-sm font-semibold tracking-wide uppercase">Syncing with Meta API...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="group border border-gray-100 rounded-3xl p-6 hover:bg-slate-50/50 hover:border-indigo-100 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                    <div className="p-1.5 bg-slate-100 rounded-lg">
                      <Calendar size={12} />
                    </div>
                    <span>{post.date}</span>
                  </div>
                  <span className="bg-white text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                    {post.id}
                  </span>
                </div>

                <p className="text-slate-700 text-sm mb-6 leading-relaxed font-medium">
                  {post.content}
                </p>

                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2 text-slate-500 group-hover:text-emerald-600 transition-colors">
                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                      <ThumbsUp size={16} />
                    </div>
                    <span className="text-sm font-bold">{post.reactions.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 group-hover:text-indigo-600 transition-colors">
                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                      <MessageSquare size={16} />
                    </div>
                    <span className="text-sm font-bold">{post.comments.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 group-hover:text-amber-600 transition-colors">
                    <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                      <Share2 size={16} />
                    </div>
                    <span className="text-sm font-bold">{post.shares.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
               <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm mx-auto mb-4">
                  <FileText className="text-slate-300" size={24} />
               </div>
               <p className="text-slate-400 text-sm font-medium">No posts discovered in the local database.</p>
               <button 
                onClick={() => fetchPosts(true)}
                className="mt-4 text-xs font-bold text-indigo-600 hover:underline"
               >
                 Try manual sync
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostsMetrics;

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { User, Mail, ShieldCheck, Edit, Save, X } from "lucide-react";

export default function UserProfile() {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.put("/api/users/profile", { username, avatar });
      setUser(res.data.user);
      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 transition-colors duration-200">
      <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 shadow-2xl rounded-3xl p-8 space-y-6">
        
        {/* User Card Header */}
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-200/50 dark:border-slate-800/35">
          <div className="relative group">
            <img 
              src={avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} 
              alt="Profile Avatar" 
              className="h-24 w-24 rounded-2xl border-2 border-brand bg-slate-50 object-cover shadow-md group-hover:scale-103 transition duration-300"
            />
            {editing && (
              <button 
                type="button"
                onClick={() => setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random().toString(36).substring(7)}`)}
                className="absolute -bottom-2 -right-2 p-2 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs shadow-lg transition active:scale-90"
                title="Randomize avatar"
              >
                <Edit className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="text-center sm:text-left space-y-1.5 flex-grow">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {user.username}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              {user.role === "admin" ? "System Administrator" : "Guest / Host Member"}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
              <div className="flex items-center text-[10px] text-brand dark:text-brand-light font-extrabold uppercase bg-brand/10 dark:bg-brand/15 px-2.5 py-0.5 rounded-lg tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5 shrink-0" /> Verified Identity
              </div>
              {user.role === "admin" && (
                <div className="flex items-center text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-lg tracking-wider border border-indigo-200/30">
                  🛡️ System Admin
                </div>
              )}
            </div>
          </div>
        </div>

        {success && (
          <p className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-3.5 text-xs font-bold text-center">
            {success}
          </p>
        )}
        {error && (
          <p className="bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100 dark:border-red-900/40 rounded-2xl p-3.5 text-xs font-bold text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex flex-col space-y-1.5 text-left">
            <label className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center">
              <User className="h-3.5 w-3.5 mr-2 text-brand" /> Username
            </label>
            <input 
              type="text" 
              required
              disabled={!editing}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3.5 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/60 disabled:opacity-65 disabled:cursor-not-allowed rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-brand dark:focus:border-indigo-500 transition font-bold"
            />
          </div>

          <div className="flex flex-col space-y-1.5 text-left">
            <label className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center">
              <Mail className="h-3.5 w-3.5 mr-2 text-brand" /> Email Address
            </label>
            <input 
              type="email" 
              disabled
              value={user.email}
              className="w-full p-3.5 border border-slate-200 dark:border-slate-850 bg-slate-100 dark:bg-slate-950/60 disabled:opacity-75 disabled:cursor-not-allowed rounded-xl text-xs sm:text-sm text-slate-500 outline-none font-semibold"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Email address is locked for security</p>
          </div>

          {editing && (
            <div className="flex flex-col space-y-1.5 text-left">
              <label className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Avatar Image Link</label>
              <input 
                type="text" 
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full p-3.5 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/60 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-brand dark:focus:border-indigo-500 transition font-medium"
              />
            </div>
          )}

          <div className="flex justify-end pt-4">
            {editing ? (
              <div className="flex space-x-2.5">
                <button
                  type="button"
                  onClick={() => { setEditing(false); setUsername(user.username); setAvatar(user.avatar); }}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full text-xs font-bold transition active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-full text-xs font-bold shadow-md transition active:scale-95 flex items-center cursor-pointer"
                >
                  <Save className="h-4 w-4 mr-2" /> {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-full text-xs font-bold shadow-md hover:shadow-brand/10 transition active:scale-95 flex items-center cursor-pointer uppercase tracking-wider"
              >
                <Edit className="h-4 w-4 mr-2" /> Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, PlusCircle, ArrowLeft } from "lucide-react";

export default function Signup({ onToggleAuth, onBackToHome }) {
  const { register, loginWithGoogle } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || "user"}`;
    try {
      await register(username, email, password, avatar);
      onBackToHome();
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Email or username might be in use.");
    } finally {
      setLoading(false);
    }
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "95738473620-mockid.apps.googleusercontent.com";
  const isMockClient = clientId === "95738473620-mockid.apps.googleusercontent.com";

  const handleMockGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle("google_oauth_bypass_token");
      onBackToHome();
    } catch (err) {
      setError(err.response?.data?.message || "Google bypass authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.google && !isMockClient) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          setLoading(true);
          setError("");
          try {
            await loginWithGoogle(response.credential);
            onBackToHome();
          } catch (err) {
            setError(err.response?.data?.message || "Google authentication failed.");
          } finally {
            setLoading(false);
          }
        }
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-signup-btn"),
        { theme: "outline", size: "large", width: "100%", text: "signup_with" }
      );
    }
  }, [clientId, isMockClient, loginWithGoogle, onBackToHome]);

  return (
    <div className="max-w-md mx-auto px-4 py-16 transition-colors duration-200">
      <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 shadow-2xl rounded-3xl p-8 space-y-6">
        
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Join AntiGravity and find luxury listings</p>
        </div>

        {error && (
          <p className="bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100 dark:border-red-900/40 rounded-2xl p-3.5 text-xs font-bold text-center leading-tight">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1.5 text-left">
            <label className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center">
              <User className="h-3.5 w-3.5 mr-2 text-brand" /> Username
            </label>
            <input 
              type="text" 
              required
              placeholder="username_1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3.5 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/60 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-brand dark:focus:border-indigo-500 transition font-medium"
            />
          </div>

          <div className="flex flex-col space-y-1.5 text-left">
            <label className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center">
              <Mail className="h-3.5 w-3.5 mr-2 text-brand" /> Email Address
            </label>
            <input 
              type="email" 
              required
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/60 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-brand dark:focus:border-indigo-500 transition font-medium"
            />
          </div>

          <div className="flex flex-col space-y-1.5 text-left">
            <label className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center">
              <Lock className="h-3.5 w-3.5 mr-2 text-brand" /> Password
            </label>
            <input 
              type="password" 
              required
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/60 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-brand dark:focus:border-indigo-500 transition font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-brand to-pink-650 hover:from-brand-dark hover:to-pink-700 text-white rounded-xl font-bold tracking-wide shadow-md hover:shadow-brand/10 transition flex items-center justify-center cursor-pointer mt-6 text-xs uppercase"
          >
            <PlusCircle className="h-4 w-4 mr-2" /> {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800/40"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase font-bold tracking-wider">or continue with</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800/40"></div>
        </div>

        <div className="w-full flex flex-col items-center space-y-2.5">
          {!isMockClient ? (
            <div id="google-signup-btn" className="w-full"></div>
          ) : (
            <button
              type="button"
              onClick={handleMockGoogleLogin}
              className="w-full py-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl font-bold transition flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer text-xs"
            >
              <svg className="h-4 w-4 mr-2.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Simulate Google Login (Dev Mode)
            </button>
          )}
        </div>

        <hr className="border-slate-200/50 dark:border-slate-800/40" />
        
        <div className="text-center text-xs text-slate-500 dark:text-slate-450 font-medium">
          <span>Already have an account?</span>{" "}
          <button 
            onClick={onToggleAuth} 
            className="text-brand dark:text-brand-light hover:underline font-bold flex items-center justify-center mx-auto mt-1 cursor-pointer"
          >
            Log in <ArrowLeft className="h-3 w-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

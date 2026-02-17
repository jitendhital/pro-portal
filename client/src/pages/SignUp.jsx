import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState, } from "react";
import OAuth from "../components/OAuth";

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {  // to keep track of changes in input fields
    setFormData({
      ...formData,  // keep old values
      [e.target.name]: e.target.value // overwrite only the changed field
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();  // stops page reload when the form submits.
    try {
      setLoading(true); //flips a loading state so the UI can disable the button / show spinner.
      const res = await fetch('/api/auth/signup', {   //sends the collected formData to your backend.
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      })

      // Safely parse JSON; handle empty/non-JSON responses
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (_) {
        data = {};
      }

      if (!res.ok || data.success === false) {
        setLoading(false);
        setError(data.message || res.statusText || 'Signup failed');
        return;
      }
      setLoading(false);
      setError(null);
      navigate('/signIn');

    } catch (error) {
      setLoading(false);
      setError(error.message);
    }

  }
  const handleGoogle = () => {
    // trigger your OAuth flow here
    console.log("continue with Google");
  }





  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-md bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-2xl shadow-xl dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700">
        {/* Top pill/title */}
        <div className="px-8 pt-6 pb-4">
          <div className="inline-block px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold text-sm">Signup</div>
        </div>

        <div className="px-8 pb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Join us — enter your details to get started.</p>


          <form onSubmit={handleSubmit} className="mt-6 space-y-4" aria-label="signup form">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 shadow-sm placeholder-slate-400 dark:placeholder-slate-500 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="your username"
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 shadow-sm placeholder-slate-400 dark:placeholder-slate-500 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="you@example.com"
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 shadow-sm placeholder-slate-400 dark:placeholder-slate-500 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Create a strong password"
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 text-white font-semibold px-4 py-2 shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
              disabled={loading}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
            {error && <div className="mt-4 text-red-600 dark:text-red-400 text-center">{error}</div>}
          </form>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
            <span className="text-xs text-slate-400 dark:text-slate-500">or</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
          </div>

          <OAuth />
          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Have an account? <Link to="/signIn" className="font-semibold text-purple-600 dark:text-purple-400 hover:underline">Sign in</Link>
          </p>

          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 text-center">
            By signing up you agree to our{" "}
            <Link to="/terms" className="underline">Terms</Link> and{" "}
            <Link to="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </div>

      </div>

    </div>
  );
}


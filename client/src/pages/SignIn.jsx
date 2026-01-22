import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInStart, signInSuccess, signInFailure } from "../redux/user/userSlice.js";
import OAuth from "../components/OAuth.jsx";

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (_) {
        data = {};
      }

      if (!res.ok || data.success === false) {
        dispatch(signInFailure(data.message || "Sign in failed"));
        return;
      }

      // Backend returns user directly, not wrapped in data.user
      dispatch(signInSuccess(data));
      navigate("/");
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  const handleGoogle = () => {
    console.log("continue with Google");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-slate-200">
        {/* Top pill/title */}
        <div className="px-8 pt-6 pb-4">
<<<<<<< HEAD
          <div className="inline-block px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-semibold text-sm">
=======
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-sm">
>>>>>>> fdfe698ed9ee8244061cf64cdccf894bda33e9f2
            Sign In
          </div>
        </div>

        <div className="px-8 pb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">Sign in to your account</h1>
          <p className="mt-2 text-sm text-slate-500">Welcome back! Please enter your details.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" aria-label="signin form">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
<<<<<<< HEAD
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
=======
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
>>>>>>> fdfe698ed9ee8244061cf64cdccf894bda33e9f2
                placeholder="you@example.com"
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
<<<<<<< HEAD
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
=======
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
>>>>>>> fdfe698ed9ee8244061cf64cdccf894bda33e9f2
                placeholder="Enter your password"
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
<<<<<<< HEAD
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 text-white font-semibold px-4 py-2 shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
=======
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold px-4 py-2 shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
>>>>>>> fdfe698ed9ee8244061cf64cdccf894bda33e9f2
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
          </form>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <OAuth />
          <p className="mt-5 text-center text-sm text-slate-500">
            Don't have an account?{" "}
<<<<<<< HEAD
            <Link to="/signUp" className="font-semibold text-purple-600 hover:underline">
=======
            <Link to="/signUp" className="font-semibold text-emerald-600 hover:underline">
>>>>>>> fdfe698ed9ee8244061cf64cdccf894bda33e9f2
              Sign up
            </Link>
          </p>

          <p className="mt-4 text-xs text-slate-400 text-center">
            By signing in you agree to our{" "}
            <Link to="/terms" className="underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

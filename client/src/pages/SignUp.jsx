import React from "react";
import { Link } from "react-router-dom";

export default function SignUp() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const payload = {
      username: form.get("username"),
      email: form.get("email"),
      password: form.get("password"),
    };
    // wire this to your auth API
    console.log("signup payload", payload);
  };

  const handleGoogle = () => {
    // trigger your OAuth flow here
    console.log("continue with Google");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-slate-200">
        {/* Top pill/title */}
        <div className="px-8 pt-6 pb-4">
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm">Signup</div>
        </div>

        <div className="px-8 pb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">Join us — enter your details to get started.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" aria-label="signup form">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="your username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Create a strong password"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-semibold px-4 py-2 shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              Sign up
            </button>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="mt-4">
            <button
              onClick={handleGoogle}
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-slate-200 px-4 py-2 bg-white hover:shadow focus:outline-none"
              aria-label="Continue with Google"
            >
              <svg width="18" height="18" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M533.5 278.4c0-18.5-1.5-37-4.7-54.6H272v103.4h147.6c-6.4 34.6-25.6 63.9-54.6 83.5v69.4h88.1c51.6-47.6 81.4-117.5 81.4-201.7z" fill="#4285F4"/>
                <path d="M272 544.3c73.7 0 135.6-24.4 180.8-66.1l-88.1-69.4c-24.5 16.5-55.9 26.3-92.8 26.3-71 0-131.4-47.9-153-112.4H29.5v70.6C74.8 480 167.6 544.3 272 544.3z" fill="#34A853"/>
                <path d="M119 324.7c-10.8-32.4-10.8-67.1 0-99.5V154.6H29.5c-39.7 77.1-39.7 169 0 246.1L119 324.7z" fill="#FBBC05"/>
                <path d="M272 107.7c39 0 74.3 13.5 102 40.1l76.3-76.3C403.2 24.9 339.7 0 272 0 167.6 0 74.8 64.3 29.5 154.6l89.5 70.6C140.6 155.6 201 107.7 272 107.7z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">
            Have an account? <Link to="/signin" className="font-semibold text-indigo-600 hover:underline">Sign in</Link>
          </p>

          <p className="mt-4 text-xs text-slate-400 text-center">
            By signing up you agree to our{" "}
            <Link to="/terms" className="underline">Terms</Link> and{" "}
            <Link to="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

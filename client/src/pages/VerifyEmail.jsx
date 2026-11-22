import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import { getStoredUser, saveStoredUser } from "../services/auth";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState(token ? "verifying" : "error");
  const [message, setMessage] = useState(
    token ? "Verifying your email..." : "Missing verification token."
  );

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function verify() {
      try {
        const response = await apiRequest("/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token }),
        });

        if (cancelled) return;

        const currentUser = getStoredUser();
        if (currentUser) {
          saveStoredUser({ ...currentUser, isEmailVerified: true });
        }

        setStatus("success");
        setMessage(response.message || "Email verified successfully!");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setMessage(err.message || "Verification link is invalid or expired.");
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
            CR
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Code Review AI</h1>
            <p className="text-sm text-slate-400">Email Verification</p>
          </div>
        </div>

        <p
          className={`p-3 text-sm rounded-lg ${
            status === "success"
              ? "bg-emerald-500/10 text-emerald-300"
              : status === "error"
              ? "bg-red-500/10 text-red-300"
              : "bg-slate-800 text-slate-200"
          }`}>
          {message}
        </p>

        <div className="mt-6">
          <Link
            to="/"
            className="block w-full rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-500">
            Continue to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

export default VerifyEmail;

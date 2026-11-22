import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { apiRequest } from "../../services/api";
import { getStoredUser, saveStoredUser } from "../../services/auth";

function MainLayout({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [resending, setResending] = useState(false);
  const [bannerMsg, setBannerMsg] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/auth/me")
      .then((res) => {
        if (cancelled) return;
        const freshUser = res?.data?.user;
        if (freshUser) {
          saveStoredUser(freshUser);
          setUser(freshUser);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleResend() {
    if (!user?.email) return;
    setResending(true);
    setBannerMsg("");
    try {
      const res = await apiRequest("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: user.email }),
      });
      setBannerMsg(res.message || "Verification email sent!");
    } catch (err) {
      setBannerMsg(err.message || "Could not send verification email.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMenu={() => setMobileMenuOpen(true)} />

        {user && user.isEmailVerified === false && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 sm:px-6">
            <p>
              Please verify your email (<strong>{user.email}</strong>) to secure your account.
              {bannerMsg && <span className="ml-2 text-emerald-300">{bannerMsg}</span>}
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-60"
            >
              {resending ? "Sending..." : "Resend verification email"}
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { apiRequest } from "../../services/api";
import { getStoredUser, saveStoredUser } from "../../services/auth";
function MainLayout({ children }) {
  const [user, setUser] = useState(() => getStoredUser()); const [resending, setResending] = useState(false); const [bannerMsg, setBannerMsg] = useState(""); const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => { let c = false; apiRequest("/auth/me").then((r) => { if (!c && r?.data?.user) { saveStoredUser(r.data.user); setUser(r.data.user); } }).catch(() => {}); return () => { c = true; }; }, []);
  async function handleResend() { if (!user?.email) return; setResending(true); setBannerMsg(""); try { const r = await apiRequest("/auth/resend-verification", { method: "POST", body: JSON.stringify({ email: user.email }) }); setBannerMsg(r.message || "Verification email sent!"); } catch (e) { setBannerMsg(e.message || "Could not send verification email."); } finally { setResending(false); } }
  return (<div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100"><Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} /><div className="flex min-w-0 flex-1 flex-col"><Header onOpenMenu={() => setMobileMenuOpen(true)} />{user && user.isEmailVerified === false && (<div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 sm:px-6"><p>Please verify your email (<strong>{user.email}</strong>) to secure your account.{bannerMsg && <span className="ml-2 font-medium text-emerald-700 dark:text-emerald-300">{bannerMsg}</span>}</p><button type="button" onClick={handleResend} disabled={resending} className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-60 dark:text-slate-950">{resending ? "Sending..." : "Resend verification email"}</button></div>)}<main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">{children}</main></div></div>);
}
export default MainLayout;

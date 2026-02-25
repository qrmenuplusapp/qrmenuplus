"use client";
import { useState, useEffect } from "react";
import { createClient as createClientInDB, getAllClients } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// ══════════════════════════════════════════
//  بيانات دخول الأدمن — لتغييرها عدّل هنا
// ══════════════════════════════════════════
const ADMIN_USERNAME = "omar";
const ADMIN_PASSWORD = "omar.111";
// ══════════════════════════════════════════


type Client = {
  id: string; name: string; subdomain: string; plan: string; planKey: string;
  status: string; created: string; expires: string; expiresDate: Date | null;
  emoji: string; color: string; frozenAt?: string | null;
};

type ActivityLog = { id: string; type: string; message: string; client_name: string; created_at: string };
type Notification = { id: string; type: "new_client" | "expiring_soon" | "expired"; message: string; client_name: string; created_at: string; read: boolean };

// ── الأسعار بالليرة السورية ──
const PLANS = {
  trial:   { label: "تجريبي مجاني", days: 7,   price: 0,      color: "#4b5563",  pill: "trial"   },
  monthly: { label: "شهري",         days: 30,  price: 50000,  color: "#f97316",  pill: "monthly" },
  semi:    { label: "نصف سنوي",     days: 180, price: 270000, color: "#a855f7",  pill: "semi"    },
  annual:  { label: "سنوي",         days: 365, price: 480000, color: "#3b82f6",  pill: "annual"  },
};

function formatSYP(n: number) { return n.toLocaleString("ar-SY") + " ل.س"; }

function daysLeft(date: Date | null): number {
  if (!date) return 0;
  return Math.ceil((date.getTime() - Date.now()) / 86400000);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `منذ ${m} دق`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  return `منذ ${Math.floor(h / 24)} يوم`;
}

const S: Record<string, any> = {
  page: { minHeight: "100vh", background: "#09090f", color: "#f1f5f9", fontFamily: "'Cairo','Tajawal',sans-serif", display: "flex" },
  sidebar: { width: 220, flexShrink: 0, background: "#0e1017", borderLeft: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 },
  navLink: (active: boolean): React.CSSProperties => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 10, cursor: "pointer", marginBottom: 2, background: active ? "rgba(249,115,22,0.12)" : "transparent", border: active ? "1px solid rgba(249,115,22,0.2)" : "1px solid transparent" }),
  navIcon: { width: 30, height: 30, borderRadius: 8, background: "#1c1f2c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 },
  navLabel: (active: boolean): React.CSSProperties => ({ fontSize: "0.85rem", fontWeight: 700, color: active ? "#fb923c" : "#94a3b8" }),
  navBadge: (color: string): React.CSSProperties => ({ marginRight: "auto", padding: "2px 7px", borderRadius: 50, fontSize: "0.62rem", fontWeight: 800, background: color, color: "#fff" }),
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 },
  topbar: { height: 56, background: "rgba(9,9,15,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", flexShrink: 0 },
  content: { flex: 1, overflowY: "auto", padding: 22 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 },
  statCard: { background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 16 },
  card: { background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  th: { padding: "10px 14px", textAlign: "right" as const, fontSize: "0.7rem", fontWeight: 800, color: "#4b5563", textTransform: "uppercase" as const, letterSpacing: 0.8, whiteSpace: "nowrap" as const, background: "#0e1017" },
  td: { padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.85rem", verticalAlign: "middle" as const },
  pill: (type: string): React.CSSProperties => {
    const map: Record<string, [string, string]> = {
      active: ["rgba(34,197,94,0.13)", "#22c55e"],
      expired: ["rgba(239,68,68,0.12)", "#ef4444"],
      expiring: ["rgba(245,158,11,0.13)", "#f59e0b"],
      frozen: ["rgba(59,130,246,0.13)", "#3b82f6"],
      trial: ["rgba(255,255,255,0.06)", "#94a3b8"],
      monthly: ["rgba(249,115,22,0.13)", "#fb923c"],
      annual: ["rgba(59,130,246,0.13)", "#3b82f6"],
      semi: ["rgba(168,85,247,0.13)", "#a855f7"],
    };
    const [bg, color] = map[type] || map.monthly;
    return { display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 50, fontSize: "0.68rem", fontWeight: 800, background: bg, color };
  },
  btn: (variant: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      accent:  { background: "#f97316", color: "#fff", boxShadow: "0 3px 12px rgba(249,115,22,0.3)" },
      ghost:   { background: "#1c1f2c", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.06)" },
      success: { background: "rgba(34,197,94,0.13)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" },
      danger:  { background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" },
      warning: { background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" },
      blue:    { background: "rgba(59,130,246,0.12)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" },
      icon:    { background: "#1c1f2c", border: "1px solid rgba(255,255,255,0.06)", width: 30, height: 30, padding: 0 },
    };
    return { border: "none", borderRadius: 9, padding: "8px 14px", fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "opacity 0.2s", ...map[variant] };
  },
  overlay: { position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" },
  modal: { background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, width: "100%", maxWidth: 500, margin: 20, maxHeight: "90vh", overflowY: "auto" },
  modalHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  formGroup: { marginBottom: 13 },
  formLabel: { display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#4b5563", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  formInput: { width: "100%", background: "#1c1f2c", border: "1.5px solid rgba(255,255,255,0.06)", borderRadius: 9, color: "#f1f5f9", padding: "10px 12px", fontSize: "0.88rem", fontFamily: "'Cairo',sans-serif", outline: "none" },
  toast: (show: boolean): React.CSSProperties => ({ position: "fixed", bottom: 22, left: 22, background: "#2a2f44", border: "1px solid rgba(249,115,22,0.22)", borderRadius: 12, padding: "11px 16px", zIndex: 400, opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(10px)", transition: "all 0.3s", pointerEvents: "none", fontSize: "0.88rem", fontWeight: 700 }),
};

// ── دالة مساعدة لتسجيل النشاط في قاعدة البيانات ──
async function logActivity(type: string, message: string, clientName: string) {
  try {
    await supabase.from("activity_logs").insert({ type, message, client_name: clientName });
  } catch {}
}

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [modal, setModal] = useState(false);
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [editModal, setEditModal] = useState<Client | null>(null);
  const [extendModal, setExtendModal] = useState<Client | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ action: string; client: Client } | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [statusFilter, setStatusFilter] = useState("all");

  // Add client fields
  const [newName, setNewName] = useState(""); const [newSub, setNewSub] = useState("");
  const [newEmail, setNewEmail] = useState(""); const [newPhone, setNewPhone] = useState("");
  const [newPlan, setNewPlan] = useState("trial"); const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Edit fields
  const [editPlan, setEditPlan] = useState("monthly"); const [extendDays, setExtendDays] = useState("30");

  const showToast = (msg: string) => { setToast({ show: true, msg }); setTimeout(() => setToast({ show: false, msg: "" }), 2800); };

  const handleLogin = () => {
    if (loginUser === ADMIN_USERNAME && loginPass === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setLoginPass("");
    }
  };

  const statusLabel: Record<string, string> = { active: "● نشط", expired: "✕ منتهي", expiring: "⏰ ينتهي قريباً", trial: "◎ تجريبي", frozen: "❄ مجمد" };
  const planKey: Record<string, string> = { "شهري": "monthly", "سنوي": "annual", "نصف سنوي": "semi", "تجريبي": "trial" };

  // ── تحميل البيانات ──
  useEffect(() => { loadClients(); loadActivityLogs(); }, []);

  const formatClient = (c: any): Client => {
    const expiresDate = c.expires_at ? new Date(c.expires_at) : null;
    const now = new Date();
    let status = c.status;
    if (status !== "frozen" && expiresDate) {
      if (expiresDate < now) status = "expired";
      else if ((expiresDate.getTime() - now.getTime()) < 7 * 86400000) status = "expiring";
    }
    return {
      id: c.id, name: c.name, subdomain: c.subdomain,
      planKey: c.plan,
      plan: PLANS[c.plan as keyof typeof PLANS]?.label || c.plan,
      status,
      created: new Date(c.created_at).toLocaleDateString("ar-SY"),
      expires: expiresDate ? expiresDate.toLocaleDateString("ar-SY") : "—",
      expiresDate,
      frozenAt: c.frozen_at || null,
      emoji: ["🏪", "☕", "🍽", "🥗", "🍖", "🍕", "🍔"][Math.floor(Math.random() * 7)],
      color: ["rgba(249,115,22,0.13)", "rgba(59,130,246,0.13)", "rgba(34,197,94,0.13)", "rgba(168,85,247,0.13)"][Math.floor(Math.random() * 4)],
    };
  };

  const loadClients = async () => {
    setLoadingClients(true);
    const result = await getAllClients();
    if (result.success && result.clients) {
      const formatted = result.clients.map(formatClient);
      setClients(formatted);
      buildNotifications(formatted);
    }
    setLoadingClients(false);
  };

  const loadActivityLogs = async () => {
    const { data } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(50);
    if (data) setActivityLogs(data);
  };

  const buildNotifications = (list: Client[]) => {
    const notifs: Notification[] = [];
    list.forEach(c => {
      if (c.status === "expiring") {
        const d = daysLeft(c.expiresDate);
        notifs.push({ id: c.id + "_exp", type: "expiring_soon", message: `اشتراك ${c.name} ينتهي خلال ${d} يوم`, client_name: c.name, created_at: new Date().toISOString(), read: false });
      }
      if (c.status === "expired") {
        notifs.push({ id: c.id + "_end", type: "expired", message: `انتهى اشتراك ${c.name}`, client_name: c.name, created_at: new Date().toISOString(), read: false });
      }
      if ((Date.now() - new Date(c.created).getTime()) < 86400000 * 2) {
        notifs.push({ id: c.id + "_new", type: "new_client", message: `عميل جديد: ${c.name} (${c.plan})`, client_name: c.name, created_at: new Date().toISOString(), read: false });
      }
    });
    setNotifications(notifs);
  };

  // ── إضافة عميل ──
  const addClient = async () => {
    if (!newName.trim() || !newSub.trim()) { showToast("⚠️ أدخل الاسم والـ Subdomain"); return; }
    if (!newUsername.trim() || !newPassword.trim()) { showToast("⚠️ أدخل اسم المستخدم وكلمة المرور"); return; }
    showToast("⏳ جارٍ إنشاء الحساب...");
    const result = await createClientInDB({ name: newName, subdomain: newSub, email: newEmail, phone: newPhone, plan: newPlan, username: newUsername, password: newPassword });
    if (!result.success) { showToast(`❌ فشل: ${result.error}`); return; }
    await logActivity("new_client", `تم إضافة عميل جديد: ${newName} (${PLANS[newPlan as keyof typeof PLANS]?.label})`, newName);
    loadClients(); loadActivityLogs();
    setModal(false); setNewName(""); setNewSub(""); setNewEmail(""); setNewPhone(""); setNewUsername(""); setNewPassword("");
    showToast(`✅ تم إنشاء "${newName}"`);
  };

  // ── تعديل الاشتراك ──
  const updatePlan = async () => {
    if (!editModal) return;
    const plan = PLANS[editPlan as keyof typeof PLANS];
    const expires = new Date(Date.now() + plan.days * 86400000);
    const { error } = await supabase.from("clients").update({ plan: editPlan, status: "active", expires_at: expires.toISOString() }).eq("id", editModal.id);
    if (error) { showToast("❌ خطأ في التحديث"); return; }
    await logActivity("plan_change", `تم تغيير خطة ${editModal.name} إلى ${plan.label}`, editModal.name);
    loadClients(); loadActivityLogs();
    setEditModal(null); showToast(`✅ تم تغيير الخطة إلى ${plan.label}`);
  };

  // ── إطالة المدة ──
  const extendSubscription = async () => {
    if (!extendModal) return;
    const days = parseInt(extendDays) || 30;
    const base = extendModal.expiresDate && extendModal.expiresDate > new Date() ? extendModal.expiresDate : new Date();
    const newExpiry = new Date(base.getTime() + days * 86400000);
    const { error } = await supabase.from("clients").update({ expires_at: newExpiry.toISOString(), status: "active" }).eq("id", extendModal.id);
    if (error) { showToast("❌ خطأ"); return; }
    await logActivity("extend", `تم إطالة اشتراك ${extendModal.name} بـ ${days} يوم`, extendModal.name);
    loadClients(); loadActivityLogs();
    setExtendModal(null); showToast(`✅ تم إطالة الاشتراك ${days} يوم`);
  };

  // ── إلغاء الاشتراك ──
  const cancelSubscription = async (c: Client) => {
    const { error } = await supabase.from("clients").update({ status: "expired", expires_at: new Date().toISOString() }).eq("id", c.id);
    if (error) { showToast("❌ خطأ"); return; }
    await logActivity("cancel", `تم إلغاء اشتراك ${c.name}`, c.name);
    loadClients(); loadActivityLogs();
    setConfirmModal(null); showToast(`🚫 تم إلغاء اشتراك ${c.name}`);
  };

  // ── تجميد الاشتراك ──
  const freezeSubscription = async (c: Client) => {
    const isFrozen = c.status === "frozen";
    const update = isFrozen
      ? { status: "active", frozen_at: null }
      : { status: "frozen", frozen_at: new Date().toISOString() };
    const { error } = await supabase.from("clients").update(update).eq("id", c.id);
    if (error) { showToast("❌ خطأ"); return; }
    await logActivity(isFrozen ? "unfreeze" : "freeze", `${isFrozen ? "تم رفع تجميد" : "تم تجميد"} اشتراك ${c.name}`, c.name);
    loadClients(); loadActivityLogs();
    setConfirmModal(null); showToast(isFrozen ? `✅ تم رفع التجميد عن ${c.name}` : `❄ تم تجميد ${c.name}`);
  };

  // ── حذف العميل ──
  const deleteClient = async (c: Client) => {
    const { error } = await supabase.from("clients").delete().eq("id", c.id);
    if (error) { showToast("❌ خطأ في الحذف"); return; }
    await logActivity("delete", `تم حذف حساب ${c.name}`, c.name);
    loadClients(); loadActivityLogs();
    setConfirmModal(null); setDetailClient(null);
    showToast(`🗑 تم حذف ${c.name} نهائياً`);
  };

  // ── حساب الإيرادات الحقيقية ──
  const calcRevenue = () => {
    const paidClients = clients.filter(c => c.planKey !== "trial" && c.status !== "expired");
    const monthly = clients.filter(c => c.planKey === "monthly" && c.status === "active").length;
    const semi = clients.filter(c => c.planKey === "semi" && c.status === "active").length;
    const annual = clients.filter(c => c.planKey === "annual" && c.status === "active").length;
    const monthlyRev = monthly * PLANS.monthly.price + semi * (PLANS.semi.price / 6) + annual * (PLANS.annual.price / 12);
    const totalRev = paidClients.reduce((acc, c) => acc + (PLANS[c.planKey as keyof typeof PLANS]?.price || 0), 0);
    const avg = paidClients.length > 0 ? totalRev / paidClients.length : 0;
    return { monthlyRev: Math.round(monthlyRev), totalRev, avg: Math.round(avg), paidCount: paidClients.length };
  };

  const filtered = statusFilter === "all" ? clients : clients.filter(c => c.status === statusFilter);
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const revenue = calcRevenue();

  const navLinks = [
    { id: "dashboard",     icon: "📊", label: "لوحة المتابعة" },
    { id: "clients",       icon: "🏪", label: "العملاء", badge: clients.length.toString(), badgeColor: "#f97316" },
    { id: "subscriptions", icon: "💳", label: "الاشتراكات" },
    { id: "revenue",       icon: "💰", label: "الإيرادات" },
    { id: "activity",      icon: "⚡", label: "سجل النشاط", badge: activityLogs.length > 0 ? activityLogs.length.toString() : undefined, badgeColor: "#ef4444" },
    { id: "settings",      icon: "⚙️", label: "الإعدادات" },
  ];

  const pageTitles: Record<string, string> = { dashboard: "لوحة المتابعة", clients: "إدارة العملاء", subscriptions: "الاشتراكات", revenue: "الإيرادات", activity: "سجل النشاط", settings: "الإعدادات" };

  // ── مكوّن أزرار الإجراءات ──
  const ActionButtons = ({ c, compact = false }: { c: Client; compact?: boolean }) => (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      <button title="تفاصيل" style={S.btn("icon")} onClick={() => setDetailClient(c)}>👁</button>
      <button title="تعديل الاشتراك" style={S.btn("icon")} onClick={() => { setEditModal(c); setEditPlan(c.planKey); }}>✏️</button>
      <button title="إطالة المدة" style={{ ...S.btn("icon"), background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)" }} onClick={() => { setExtendModal(c); setExtendDays("30"); }}>⏳</button>
      <button title={c.status === "frozen" ? "رفع التجميد" : "تجميد"} style={{ ...S.btn("icon"), background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)" }} onClick={() => setConfirmModal({ action: "freeze", client: c })}>❄</button>
      <button title="إلغاء الاشتراك" style={{ ...S.btn("icon"), background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }} onClick={() => setConfirmModal({ action: "cancel", client: c })}>🚫</button>
      <button title="حذف نهائي" style={{ ...S.btn("icon"), background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }} onClick={() => setConfirmModal({ action: "delete", client: c })}>🗑</button>
    </div>
  );

  const activityDot: Record<string, string> = { new_client: "#22c55e", plan_change: "#f97316", extend: "#3b82f6", cancel: "#ef4444", freeze: "#60a5fa", unfreeze: "#22c55e", delete: "#ef4444", expiring: "#f59e0b" };

  // ── شاشة تسجيل الدخول ──
  if (!isLoggedIn) return (
    <div style={{ minHeight: "100vh", background: "#09090f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cairo','Tajawal',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&family=Tajawal:wght@700;900&display=swap');*{box-sizing:border-box;}`}</style>
      <div style={{ width: "100%", maxWidth: 380, margin: 20 }}>
        {/* اللوغو */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 14px", boxShadow: "0 8px 32px rgba(249,115,22,0.35)" }}>🍽</div>
          <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.5rem", fontWeight: 900, color: "#f1f5f9" }}>QR<span style={{ color: "#f97316" }}>Menu</span></div>
          <div style={{ fontSize: "0.75rem", color: "#4b5563", marginTop: 4, fontWeight: 700 }}>لوحة تحكم المشرف</div>
        </div>

        {/* بطاقة الدخول */}
        <div style={{ background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 28 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#4b5563", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>اسم المستخدم</label>
            <input
              style={{ width: "100%", background: "#1c1f2c", border: `1.5px solid ${loginError ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, color: "#f1f5f9", padding: "11px 14px", fontSize: "0.92rem", fontFamily: "'Cairo',sans-serif", outline: "none", direction: "ltr" }}
              placeholder="username"
              value={loginUser}
              onChange={e => { setLoginUser(e.target.value); setLoginError(false); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              autoComplete="username"
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#4b5563", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>كلمة المرور</label>
            <input
              style={{ width: "100%", background: "#1c1f2c", border: `1.5px solid ${loginError ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, color: "#f1f5f9", padding: "11px 14px", fontSize: "0.92rem", fontFamily: "'Cairo',sans-serif", outline: "none", direction: "ltr" }}
              placeholder="••••••••"
              type="password"
              value={loginPass}
              onChange={e => { setLoginPass(e.target.value); setLoginError(false); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              autoComplete="current-password"
            />
          </div>
          {loginError && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: "0.82rem", color: "#ef4444", fontWeight: 700, textAlign: "center" }}>
              ❌ اسم المستخدم أو كلمة المرور غير صحيحة
            </div>
          )}
          <button
            onClick={handleLogin}
            style={{ width: "100%", background: "#f97316", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontFamily: "'Cairo',sans-serif", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(249,115,22,0.35)", transition: "opacity 0.2s" }}
          >
            🔐 تسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&family=Tajawal:wght@400;700;900&display=swap');*{box-sizing:border-box;}`}</style>

      {/* SIDEBAR */}
      <aside style={S.sidebar}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🍽</div>
          <div>
            <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1rem", fontWeight: 900 }}>QR<span style={{ color: "#f97316" }}>Menu</span></div>
            <div style={{ fontSize: "0.65rem", color: "#4b5563", fontWeight: 700 }}>Admin Panel</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
          <div style={{ fontSize: "0.62rem", fontWeight: 800, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.2, padding: "12px 8px 6px" }}>الرئيسية</div>
          {navLinks.slice(0, 2).map(n => (
            <div key={n.id} style={S.navLink(page === n.id)} onClick={() => setPage(n.id)}>
              <div style={S.navIcon}>{n.icon}</div>
              <span style={S.navLabel(page === n.id)}>{n.label}</span>
              {n.badge && <span style={S.navBadge(n.badgeColor!)}>{n.badge}</span>}
            </div>
          ))}
          <div style={{ fontSize: "0.62rem", fontWeight: 800, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.2, padding: "12px 8px 6px" }}>الإدارة</div>
          {navLinks.slice(2, 5).map(n => (
            <div key={n.id} style={S.navLink(page === n.id)} onClick={() => setPage(n.id)}>
              <div style={S.navIcon}>{n.icon}</div>
              <span style={S.navLabel(page === n.id)}>{n.label}</span>
              {n.badge && <span style={S.navBadge(n.badgeColor!)}>{n.badge}</span>}
            </div>
          ))}
          <div style={{ fontSize: "0.62rem", fontWeight: 800, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.2, padding: "12px 8px 6px" }}>الإعدادات</div>
          {navLinks.slice(5).map(n => (
            <div key={n.id} style={S.navLink(page === n.id)} onClick={() => setPage(n.id)}>
              <div style={S.navIcon}>{n.icon}</div>
              <span style={S.navLabel(page === n.id)}>{n.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900 }}>م</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: "0.82rem", fontWeight: 800 }}>{ADMIN_USERNAME}</div><div style={{ fontSize: "0.68rem", color: "#4b5563" }}>Super Admin</div></div>
          <button onClick={() => { setIsLoggedIn(false); setLoginUser(""); setLoginPass(""); }} title="تسجيل الخروج" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 8, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#ef4444", flexShrink: 0 }}>↩</button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={S.main}>
        {/* TOPBAR */}
        <div style={S.topbar}>
          <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1rem", fontWeight: 900 }}>{pageTitles[page]}</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1c1f2c", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "7px 12px" }}>
              <span>🔍</span>
              <input placeholder="بحث..." style={{ background: "none", border: "none", outline: "none", color: "#f1f5f9", fontFamily: "'Cairo',sans-serif", fontSize: "0.85rem", width: 140 }} />
            </div>
            {/* زر التنبيهات */}
            <div style={{ position: "relative" }}>
              <button style={{ ...S.btn("ghost"), width: 36, height: 36, padding: 0, position: "relative" }} onClick={() => setNotifOpen(!notifOpen)}>
                🔔
                {unreadNotifs > 0 && <span style={{ position: "absolute", top: 6, left: 6, width: 8, height: 8, borderRadius: "50%", background: "#f97316", border: "2px solid #09090f" }} />}
              </button>
              {notifOpen && (
                <div style={{ position: "absolute", top: 44, left: 0, width: 320, background: "#13161e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, zIndex: 300, boxShadow: "0 16px 48px rgba(0,0,0,0.5)", overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 800, fontSize: "0.88rem" }}>التنبيهات</span>
                    <span style={{ fontSize: "0.7rem", color: "#4b5563" }}>{unreadNotifs} جديد</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", color: "#4b5563", fontSize: "0.85rem" }}>لا توجد تنبيهات</div>
                  ) : notifications.map(n => (
                    <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 10, alignItems: "flex-start", background: n.read ? "transparent" : "rgba(249,115,22,0.04)" }}>
                      <span style={{ fontSize: 18 }}>{n.type === "new_client" ? "🎉" : n.type === "expiring_soon" ? "⏰" : "❌"}</span>
                      <div>
                        <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>{n.message}</div>
                        <div style={{ fontSize: "0.7rem", color: "#4b5563", marginTop: 2 }}>{timeAgo(n.created_at)}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: "10px 16px" }}>
                    <button style={{ ...S.btn("ghost"), width: "100%", fontSize: "0.78rem" }} onClick={() => { setNotifications(n => n.map(x => ({ ...x, read: true }))); setNotifOpen(false); }}>تعيين الكل كمقروء</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={S.content}>

          {/* ── DASHBOARD ── */}
          {page === "dashboard" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.2rem", fontWeight: 900 }}>مرحباً، المشرف 👋</div>
                  <div style={{ fontSize: "0.8rem", color: "#4b5563", marginTop: 3 }}>آخر تحديث: {new Date().toLocaleDateString("ar-SY")}</div>
                </div>
                <button style={S.btn("accent")} onClick={() => setModal(true)}>＋ عميل جديد</button>
              </div>
              <div style={S.statsGrid}>
                {[
                  { icon: "🏪", num: clients.length, label: "إجمالي العملاء", color: "rgba(59,130,246,0.13)" },
                  { icon: "✅", num: clients.filter(c => c.status === "active").length, label: "اشتراكات نشطة", color: "rgba(34,197,94,0.13)" },
                  { icon: "💰", num: formatSYP(revenue.monthlyRev), label: "الإيراد الشهري المقدر", color: "rgba(249,115,22,0.13)" },
                  { icon: "⏰", num: clients.filter(c => c.status === "expiring").length, label: "تنتهي قريباً", color: "rgba(239,68,68,0.13)" },
                ].map((s, i) => (
                  <div key={i} style={S.statCard}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 12 }}>{s.icon}</div>
                    <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.5rem", fontWeight: 900, marginBottom: 4 }}>{s.num}</div>
                    <div style={{ fontSize: "0.75rem", color: "#4b5563", fontWeight: 700 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 800 }}>📋 آخر العملاء</div>
                  <button style={S.btn("ghost")} onClick={() => setPage("clients")}>عرض الكل</button>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["العميل", "الخطة", "الحالة", "المتبقي", "الانتهاء", "إجراءات"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {loadingClients ? <tr><td colSpan={6} style={{ ...S.td, textAlign: "center", padding: 40, color: "#4b5563" }}>⏳ جارٍ التحميل...</td></tr>
                    : clients.length === 0 ? <tr><td colSpan={6} style={{ ...S.td, textAlign: "center", padding: 40, color: "#4b5563" }}>لا توجد عملاء</td></tr>
                    : clients.slice(0, 5).map(c => (
                      <tr key={c.id}>
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{c.emoji}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{c.name}</div>
                              <div style={{ fontSize: "0.7rem", color: "#f97316", direction: "ltr" }}>{c.subdomain}.{process.env.NEXT_PUBLIC_DOMAIN || 'pro.qrmenu.it.com'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={S.td}><span style={S.pill(c.planKey)}>{c.plan}</span></td>
                        <td style={S.td}><span style={S.pill(c.status)}>{statusLabel[c.status]}</span></td>
                        <td style={{ ...S.td, fontSize: "0.82rem", color: daysLeft(c.expiresDate) < 7 ? "#ef4444" : "#94a3b8" }}>
                          {c.expiresDate ? `${Math.max(0, daysLeft(c.expiresDate))} يوم` : "—"}
                        </td>
                        <td style={{ ...S.td, fontSize: "0.82rem", color: "#94a3b8" }}>{c.expires}</td>
                        <td style={S.td}><ActionButtons c={c} compact /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── CLIENTS ── */}
          {page === "clients" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.2rem", fontWeight: 900 }}>🏪 إدارة العملاء</div>
                  <div style={{ fontSize: "0.8rem", color: "#4b5563", marginTop: 3 }}>{clients.length} عميل مسجل</div>
                </div>
                <button style={S.btn("accent")} onClick={() => setModal(true)}>＋ إضافة عميل</button>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {[["all", `الكل (${clients.length})`], ["active", `نشط (${clients.filter(c => c.status === "active").length})`], ["trial", `تجريبي (${clients.filter(c => c.status === "trial").length})`], ["expiring", "ينتهي قريباً"], ["expired", "منتهي"], ["frozen", "مجمد"]].map(([val, label]) => (
                  <button key={val} style={{ ...S.btn("ghost"), border: statusFilter === val ? "1px solid #f97316" : "1px solid rgba(255,255,255,0.06)", color: statusFilter === val ? "#f97316" : "#94a3b8" }} onClick={() => setStatusFilter(val)}>{label}</button>
                ))}
              </div>
              <div style={S.card}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["العميل", "الخطة", "الحالة", "المتبقي", "الانتهاء", "الإجراءات"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filtered.length === 0 ? <tr><td colSpan={6} style={{ ...S.td, textAlign: "center", padding: 40, color: "#4b5563" }}>لا يوجد عملاء في هذه الفئة</td></tr>
                    : filtered.map(c => (
                      <tr key={c.id}>
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{c.emoji}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{c.name}</div>
                              <div style={{ fontSize: "0.7rem", color: "#f97316", direction: "ltr" }}>{c.subdomain}.{process.env.NEXT_PUBLIC_DOMAIN || 'pro.qrmenu.it.com'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={S.td}><span style={S.pill(c.planKey)}>{c.plan}</span></td>
                        <td style={S.td}><span style={S.pill(c.status)}>{statusLabel[c.status]}</span></td>
                        <td style={{ ...S.td, color: daysLeft(c.expiresDate) < 7 ? "#ef4444" : "#94a3b8", fontSize: "0.82rem", fontWeight: 700 }}>
                          {c.expiresDate ? `${Math.max(0, daysLeft(c.expiresDate))} يوم` : "—"}
                        </td>
                        <td style={{ ...S.td, fontSize: "0.82rem", color: "#94a3b8" }}>{c.expires}</td>
                        <td style={S.td}><ActionButtons c={c} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── SUBSCRIPTIONS ── */}
          {page === "subscriptions" && (
            <>
              <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.2rem", fontWeight: 900, marginBottom: 20 }}>💳 إدارة الاشتراكات</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { key: "trial",   icon: "🆓", label: "تجريبي (مجاني - 7 أيام)", color: "#94a3b8" },
                  { key: "monthly", icon: "📅", label: `شهري — ${formatSYP(PLANS.monthly.price)}`, color: "#f97316" },
                  { key: "semi",    icon: "📆", label: `نصف سنوي — ${formatSYP(PLANS.semi.price)}`, color: "#a855f7" },
                  { key: "annual",  icon: "🗓", label: `سنوي — ${formatSYP(PLANS.annual.price)}`, color: "#3b82f6" },
                ].map((s, i) => {
                  const count = clients.filter(c => c.planKey === s.key).length;
                  const pct = clients.length > 0 ? Math.round(count / clients.length * 100) : 0;
                  return (
                    <div key={i} style={S.statCard}>
                      <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                      <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.8rem", fontWeight: 900, color: s.color }}>{count}</div>
                      <div style={{ fontSize: "0.72rem", color: "#4b5563", fontWeight: 700, marginBottom: 10 }}>{s.label}</div>
                      <div style={{ height: 4, borderRadius: 4, background: "#1c1f2c" }}><div style={{ height: "100%", borderRadius: 4, background: s.color, width: `${pct}%`, transition: "width 0.5s" }} /></div>
                    </div>
                  );
                })}
              </div>
              <div style={S.card}>
                <div style={S.cardHeader}><div style={{ fontSize: "0.9rem", fontWeight: 800 }}>⏰ تنتهي خلال 30 يوم</div></div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["العميل", "الخطة", "المتبقي", "تاريخ الانتهاء", "إجراء"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {clients.filter(c => c.status === "expiring" || c.status === "trial").length === 0
                      ? <tr><td colSpan={5} style={{ ...S.td, textAlign: "center", padding: 30, color: "#4b5563" }}>لا توجد اشتراكات تنتهي قريباً</td></tr>
                      : clients.filter(c => c.status === "expiring" || c.status === "trial").map(c => (
                        <tr key={c.id}>
                          <td style={S.td}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 30, height: 30, borderRadius: 8, background: c.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{c.emoji}</div><span style={{ fontWeight: 700 }}>{c.name}</span></div></td>
                          <td style={S.td}><span style={S.pill(c.planKey)}>{c.plan}</span></td>
                          <td style={{ ...S.td, color: "#ef4444", fontWeight: 800 }}>{Math.max(0, daysLeft(c.expiresDate))} يوم</td>
                          <td style={{ ...S.td, color: "#94a3b8", fontSize: "0.82rem" }}>{c.expires}</td>
                          <td style={S.td}>
                            <button style={S.btn("accent")} onClick={() => { setExtendModal(c); setExtendDays("30"); }}>⏳ تمديد</button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── REVENUE ── */}
          {page === "revenue" && (
            <>
              <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.2rem", fontWeight: 900, marginBottom: 20 }}>💰 الإيرادات</div>
              <div style={S.statsGrid}>
                {[
                  { icon: "💵", num: formatSYP(revenue.monthlyRev), label: "الإيراد الشهري المقدر" },
                  { icon: "📈", num: formatSYP(revenue.totalRev), label: "إجمالي الاشتراكات المفعّلة" },
                  { icon: "🧾", num: formatSYP(revenue.avg), label: "متوسط قيمة الاشتراك" },
                  { icon: "👥", num: revenue.paidCount, label: "عدد المشتركين الفعليين" },
                ].map((s, i) => (
                  <div key={i} style={S.statCard}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(34,197,94,0.13)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 12 }}>{s.icon}</div>
                    <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.4rem", fontWeight: 900, marginBottom: 4 }}>{s.num}</div>
                    <div style={{ fontSize: "0.75rem", color: "#4b5563", fontWeight: 700 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={S.card}>
                <div style={S.cardHeader}><div style={{ fontSize: "0.9rem", fontWeight: 800 }}>تفصيل الإيرادات حسب الخطة</div></div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["الخطة", "عدد العملاء", "سعر الخطة", "الإجمالي"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {(["monthly", "semi", "annual"] as const).map(k => {
                      const count = clients.filter(c => c.planKey === k && c.status === "active").length;
                      const plan = PLANS[k];
                      return (
                        <tr key={k}>
                          <td style={S.td}><span style={S.pill(k)}>{plan.label}</span></td>
                          <td style={{ ...S.td, fontWeight: 800 }}>{count}</td>
                          <td style={{ ...S.td, color: "#94a3b8" }}>{formatSYP(plan.price)}</td>
                          <td style={{ ...S.td, fontWeight: 900, color: "#22c55e" }}>{formatSYP(count * plan.price)}</td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan={3} style={{ ...S.td, fontWeight: 900, color: "#f97316" }}>المجموع الكلي</td>
                      <td style={{ ...S.td, fontWeight: 900, color: "#f97316", fontSize: "1rem" }}>{formatSYP(revenue.totalRev)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── ACTIVITY ── */}
          {page === "activity" && (
            <>
              <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.2rem", fontWeight: 900, marginBottom: 20 }}>⚡ سجل النشاط</div>
              <div style={S.card}>
                {activityLogs.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "#4b5563" }}>لا يوجد نشاط مسجل بعد</div>
                ) : activityLogs.map((a, i) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 16px", borderBottom: i < activityLogs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: activityDot[a.type] || "#94a3b8", marginTop: 6, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: "0.85rem", lineHeight: 1.6 }}>{a.message}</div>
                    <div style={{ fontSize: "0.72rem", color: "#4b5563", whiteSpace: "nowrap" }}>{timeAgo(a.created_at)}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── SETTINGS ── */}
          {page === "settings" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.2rem", fontWeight: 900 }}>⚙️ إعدادات النظام</div>
                <button style={S.btn("accent")} onClick={() => showToast("💾 تم حفظ الإعدادات!")}>💾 حفظ</button>
              </div>
              {[
                { title: "معلومات المنصة", rows: [{ label: "اسم المنصة", value: "QRMenu" }, { label: "الدومين الرئيسي", value: process.env.NEXT_PUBLIC_DOMAIN || "pro.qrmenu.it.com" }] },
                { title: "الاشتراكات والأسعار (ليرة سورية)", rows: [
                  { label: "سعر الشهري (ل.س)", value: PLANS.monthly.price.toString() },
                  { label: "سعر نصف السنوي (ل.س)", value: PLANS.semi.price.toString() },
                  { label: "سعر السنوي (ل.س)", value: PLANS.annual.price.toString() },
                  { label: "مدة التجربة المجانية (أيام)", value: "7" },
                ]},
              ].map((sec, i) => (
                <div key={i} style={{ ...S.card, marginBottom: 14 }}>
                  <div style={{ padding: "12px 16px", background: "#0e1017", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "0.78rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8 }}>{sec.title}</div>
                  {sec.rows.map((row, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: j < sec.rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>{row.label}</span>
                      <input defaultValue={row.value} style={{ ...S.formInput, width: 180, padding: "8px 12px" }} />
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

        </div>
      </div>

      {/* ══ ADD CLIENT MODAL ══ */}
      {modal && (
        <div style={S.overlay} onClick={() => setModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1rem", fontWeight: 900 }}>🏪 إضافة عميل جديد</div>
              <button style={{ ...S.btn("ghost"), width: 28, height: 28, padding: 0 }} onClick={() => setModal(false)}>✕</button>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={S.formGroup}><label style={S.formLabel}>اسم المطعم</label><input style={S.formInput} placeholder="مطعم الفنار" value={newName} onChange={e => setNewName(e.target.value)} /></div>
                <div style={S.formGroup}><label style={S.formLabel}>Subdomain</label><input style={{ ...S.formInput, direction: "ltr" }} placeholder="alfanar" value={newSub} onChange={e => setNewSub(e.target.value)} /></div>
              </div>
              <div style={S.formGroup}><label style={S.formLabel}>البريد الإلكتروني</label><input style={{ ...S.formInput, direction: "ltr" }} type="email" placeholder="owner@restaurant.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} /></div>
              <div style={S.formGroup}><label style={S.formLabel}>رقم الهاتف</label><input style={S.formInput} placeholder="+963 9X XXX XXXX" value={newPhone} onChange={e => setNewPhone(e.target.value)} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={S.formGroup}><label style={S.formLabel}>اسم المستخدم</label><input style={{ ...S.formInput, direction: "ltr" }} placeholder="alfanar" value={newUsername} onChange={e => setNewUsername(e.target.value)} /></div>
                <div style={S.formGroup}><label style={S.formLabel}>كلمة المرور</label><input style={S.formInput} type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>نوع الاشتراك</label>
                <select style={S.formInput} value={newPlan} onChange={e => setNewPlan(e.target.value)}>
                  <option value="trial">تجريبي مجاني (7 أيام — مجاني)</option>
                  <option value="monthly">شهري — {formatSYP(PLANS.monthly.price)}</option>
                  <option value="semi">نصف سنوي — {formatSYP(PLANS.semi.price)}</option>
                  <option value="annual">سنوي — {formatSYP(PLANS.annual.price)}</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
                <button style={S.btn("ghost")} onClick={() => setModal(false)}>إلغاء</button>
                <button style={S.btn("accent")} onClick={addClient}>✅ حفظ العميل</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ EDIT PLAN MODAL ══ */}
      {editModal && (
        <div style={S.overlay} onClick={() => setEditModal(null)}>
          <div style={{ ...S.modal, maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1rem", fontWeight: 900 }}>✏️ تعديل اشتراك {editModal.name}</div>
              <button style={{ ...S.btn("ghost"), width: 28, height: 28, padding: 0 }} onClick={() => setEditModal(null)}>✕</button>
            </div>
            <div style={{ padding: 18 }}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>الخطة الجديدة</label>
                <select style={S.formInput} value={editPlan} onChange={e => setEditPlan(e.target.value)}>
                  <option value="monthly">شهري — {formatSYP(PLANS.monthly.price)}</option>
                  <option value="semi">نصف سنوي — {formatSYP(PLANS.semi.price)}</option>
                  <option value="annual">سنوي — {formatSYP(PLANS.annual.price)}</option>
                </select>
              </div>
              <div style={{ background: "#1c1f2c", borderRadius: 10, padding: 12, marginBottom: 16, fontSize: "0.82rem", color: "#94a3b8" }}>
                سيتم تمديد الاشتراك لـ <strong style={{ color: "#f1f5f9" }}>{PLANS[editPlan as keyof typeof PLANS]?.days} يوم</strong> من الآن
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button style={S.btn("ghost")} onClick={() => setEditModal(null)}>إلغاء</button>
                <button style={S.btn("accent")} onClick={updatePlan}>✅ حفظ التغيير</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ EXTEND MODAL ══ */}
      {extendModal && (
        <div style={S.overlay} onClick={() => setExtendModal(null)}>
          <div style={{ ...S.modal, maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1rem", fontWeight: 900 }}>⏳ إطالة اشتراك {extendModal.name}</div>
              <button style={{ ...S.btn("ghost"), width: 28, height: 28, padding: 0 }} onClick={() => setExtendModal(null)}>✕</button>
            </div>
            <div style={{ padding: 18 }}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>عدد الأيام الإضافية</label>
                <input style={S.formInput} type="number" min="1" value={extendDays} onChange={e => setExtendDays(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {[7, 14, 30, 90, 180, 365].map(d => (
                  <button key={d} style={{ ...S.btn("ghost"), fontSize: "0.78rem", border: extendDays === d.toString() ? "1px solid #f97316" : "1px solid rgba(255,255,255,0.06)", color: extendDays === d.toString() ? "#f97316" : "#94a3b8" }} onClick={() => setExtendDays(d.toString())}>{d} يوم</button>
                ))}
              </div>
              <div style={{ background: "#1c1f2c", borderRadius: 10, padding: 12, marginBottom: 16, fontSize: "0.82rem", color: "#94a3b8" }}>
                الانتهاء الجديد: <strong style={{ color: "#22c55e" }}>{(() => {
                  const base = extendModal.expiresDate && extendModal.expiresDate > new Date() ? extendModal.expiresDate : new Date();
                  return new Date(base.getTime() + parseInt(extendDays || "0") * 86400000).toLocaleDateString("ar-SY");
                })()}</strong>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button style={S.btn("ghost")} onClick={() => setExtendModal(null)}>إلغاء</button>
                <button style={S.btn("success")} onClick={extendSubscription}>⏳ تأكيد الإطالة</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ CONFIRM MODAL ══ */}
      {confirmModal && (
        <div style={S.overlay} onClick={() => setConfirmModal(null)}>
          <div style={{ ...S.modal, maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1rem", fontWeight: 900 }}>
                {confirmModal.action === "delete" ? "🗑 حذف نهائي" : confirmModal.action === "freeze" ? "❄ تجميد / رفع التجميد" : "🚫 إلغاء الاشتراك"}
              </div>
              <button style={{ ...S.btn("ghost"), width: 28, height: 28, padding: 0 }} onClick={() => setConfirmModal(null)}>✕</button>
            </div>
            <div style={{ padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{confirmModal.action === "delete" ? "🗑" : confirmModal.action === "freeze" ? "❄" : "🚫"}</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 8 }}>
                {confirmModal.action === "delete"
                  ? `هل تريد حذف "${confirmModal.client.name}" نهائياً؟`
                  : confirmModal.action === "freeze"
                  ? confirmModal.client.status === "frozen"
                    ? `هل تريد رفع التجميد عن "${confirmModal.client.name}"؟`
                    : `هل تريد تجميد اشتراك "${confirmModal.client.name}"؟`
                  : `هل تريد إلغاء اشتراك "${confirmModal.client.name}"؟`}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#4b5563", marginBottom: 20 }}>
                {confirmModal.action === "delete" ? "لا يمكن التراجع عن هذا الإجراء" : confirmModal.action === "freeze" ? "سيتوقف الوصول للقائمة فوراً حتى رفع التجميد" : "سيتوقف الوصول للقائمة فوراً"}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button style={S.btn("ghost")} onClick={() => setConfirmModal(null)}>إلغاء</button>
                <button
                  style={confirmModal.action === "delete" ? S.btn("danger") : confirmModal.action === "freeze" ? S.btn("blue") : S.btn("warning")}
                  onClick={() => {
                    if (confirmModal.action === "delete") deleteClient(confirmModal.client);
                    else if (confirmModal.action === "freeze") freezeSubscription(confirmModal.client);
                    else cancelSubscription(confirmModal.client);
                  }}
                >
                  {confirmModal.action === "delete" ? "🗑 حذف نهائي" : confirmModal.action === "freeze" ? confirmModal.client.status === "frozen" ? "✅ رفع التجميد" : "❄ تجميد" : "🚫 إلغاء الاشتراك"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ CLIENT DETAIL MODAL ══ */}
      {detailClient && (
        <div style={S.overlay} onClick={() => setDetailClient(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1rem", fontWeight: 900 }}>👁 تفاصيل العميل</div>
              <button style={{ ...S.btn("ghost"), width: 28, height: 28, padding: 0 }} onClick={() => setDetailClient(null)}>✕</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: detailClient.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 10px" }}>{detailClient.emoji}</div>
                <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.15rem", fontWeight: 900 }}>{detailClient.name}</div>
                <div style={{ fontSize: "0.8rem", color: "#f97316", direction: "ltr", marginTop: 4 }}>{detailClient.subdomain}.{process.env.NEXT_PUBLIC_DOMAIN || 'pro.qrmenu.it.com'}</div>
                <div style={{ marginTop: 8 }}><span style={S.pill(detailClient.status)}>{statusLabel[detailClient.status]}</span></div>
              </div>

              {/* حالة الاشتراك والمدة المتبقية */}
              <div style={{ background: "#1c1f2c", borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#4b5563", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>حالة الاشتراك</div>
                {[
                  { label: "الخطة", val: <span style={S.pill(detailClient.planKey)}>{detailClient.plan}</span> },
                  { label: "تاريخ التسجيل", val: detailClient.created },
                  { label: "تاريخ الانتهاء", val: detailClient.expires },
                  { label: "المدة المتبقية", val: detailClient.expiresDate ? <span style={{ fontWeight: 900, color: daysLeft(detailClient.expiresDate) < 7 ? "#ef4444" : "#22c55e" }}>{Math.max(0, daysLeft(detailClient.expiresDate))} يوم</span> : "—" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <span style={{ fontSize: "0.82rem", color: "#4b5563" }}>{row.label}</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{row.val}</span>
                  </div>
                ))}
              </div>

              {/* أزرار الإجراءات */}
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#4b5563", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>الإجراءات</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button style={{ ...S.btn("accent"), justifyContent: "center" }} onClick={() => { setDetailClient(null); setEditModal(detailClient); setEditPlan(detailClient.planKey); }}>✏️ تعديل الخطة</button>
                <button style={{ ...S.btn("success"), justifyContent: "center" }} onClick={() => { setDetailClient(null); setExtendModal(detailClient); setExtendDays("30"); }}>⏳ إطالة المدة</button>
                <button style={{ ...S.btn("blue"), justifyContent: "center" }} onClick={() => { setDetailClient(null); setConfirmModal({ action: "freeze", client: detailClient }); }}>
                  {detailClient.status === "frozen" ? "✅ رفع التجميد" : "❄ تجميد"}
                </button>
                <button style={{ ...S.btn("warning"), justifyContent: "center" }} onClick={() => { setDetailClient(null); setConfirmModal({ action: "cancel", client: detailClient }); }}>🚫 إلغاء الاشتراك</button>
                <button style={{ ...S.btn("danger"), justifyContent: "center", gridColumn: "1/-1" }} onClick={() => { setDetailClient(null); setConfirmModal({ action: "delete", client: detailClient }); }}>🗑 حذف الحساب نهائياً</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div style={S.toast(toast.show)}>{toast.msg}</div>
    </div>
  );
}

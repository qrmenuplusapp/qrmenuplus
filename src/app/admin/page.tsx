"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient as createClientInDB, getAllClients } from "@/lib/auth";

type Client = { id: string; name: string; subdomain: string; plan: string; status: string; created: string; expires: string; emoji: string; color: string };

  { id: "1", name: "مطعم الفنار", subdomain: "alfanar", plan: "شهري", status: "active", created: "10 يناير 2025", expires: "15 مارس 2025", emoji: "🍕", color: "rgba(249,115,22,0.13)" },
  { id: "2", name: "كافيه نوفا", subdomain: "nova", plan: "سنوي", status: "active", created: "1 يناير 2025", expires: "1 يناير 2026", emoji: "☕", color: "rgba(59,130,246,0.13)" },
  { id: "3", name: "مطعم الأصيل", subdomain: "aseel", plan: "نصف سنوي", status: "expiring", created: "20 أغسطس 2024", expires: "20 فبراير 2025", emoji: "🍖", color: "rgba(245,158,11,0.13)" },
  { id: "4", name: "سوشي تايم", subdomain: "sushi", plan: "شهري", status: "expired", created: "5 ديسمبر 2024", expires: "1 فبراير 2025", emoji: "🍣", color: "rgba(239,68,68,0.13)" },
  { id: "5", name: "فريش سلاد", subdomain: "fresh", plan: "سنوي", status: "active", created: "15 نوفمبر 2024", expires: "15 نوفمبر 2025", emoji: "🥗", color: "rgba(34,197,94,0.13)" },
  { id: "6", name: "برغر هاوس", subdomain: "burger", plan: "شهري", status: "trial", created: "10 فبراير 2025", expires: "10 مارس 2025", emoji: "🍔", color: "rgba(168,85,247,0.13)" },
];

const S: Record<string, any> = {
  page: { minHeight: "100vh", background: "#09090f", color: "#f1f5f9", fontFamily: "'Cairo','Tajawal',sans-serif", display: "flex" },
  sidebar: { width: 220, flexShrink: 0, background: "#0e1017", borderLeft: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 10, padding: "18px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  logoBox: { width: 32, height: 32, borderRadius: 9, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 },
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
    const map: Record<string, [string, string]> = { active: ["rgba(34,197,94,0.13)", "#22c55e"], expired: ["rgba(239,68,68,0.12)", "#ef4444"], expiring: ["rgba(245,158,11,0.13)", "#f59e0b"], trial: ["rgba(255,255,255,0.06)", "#4b5563"], monthly: ["rgba(249,115,22,0.13)", "#fb923c"], annual: ["rgba(59,130,246,0.13)", "#3b82f6"], semi: ["rgba(168,85,247,0.13)", "#a855f7"] };
    const [bg, color] = map[type] || map.monthly;
    return { display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 50, fontSize: "0.68rem", fontWeight: 800, background: bg, color };
  },
  btn: (variant: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      accent: { background: "#f97316", color: "#fff", boxShadow: "0 3px 12px rgba(249,115,22,0.3)" },
      ghost: { background: "#1c1f2c", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.06)" },
      success: { background: "rgba(34,197,94,0.13)", color: "#22c55e" },
      danger: { background: "rgba(239,68,68,0.12)", color: "#ef4444" },
      icon: { background: "#1c1f2c", border: "1px solid rgba(255,255,255,0.06)", width: 30, height: 30, padding: 0 },
    };
    return { border: "none", borderRadius: 9, padding: "8px 14px", fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, ...map[variant] };
  },
  overlay: { position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" },
  modal: { background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, width: "100%", maxWidth: 460, margin: 20, maxHeight: "90vh", overflowY: "auto" },
  modalHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  formGroup: { marginBottom: 13 },
  formLabel: { display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#4b5563", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  formInput: { width: "100%", background: "#1c1f2c", border: "1.5px solid rgba(255,255,255,0.06)", borderRadius: 9, color: "#f1f5f9", padding: "10px 12px", fontSize: "0.88rem", fontFamily: "'Cairo',sans-serif", outline: "none" },
  toast: (show: boolean): React.CSSProperties => ({ position: "fixed", bottom: 22, left: 22, background: "#2a2f44", border: "1px solid rgba(249,115,22,0.22)", borderRadius: 12, padding: "11px 16px", zIndex: 300, opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(10px)", transition: "all 0.3s", pointerEvents: "none", fontSize: "0.88rem", fontWeight: 700 }),
};

export default function Admin() {
  const [page, setPage] = useState("dashboard");
  const [clients, setClients] = useState<Client[]>([]);
const [loadingClients, setLoadingClients] = useState(true);
  const [modal, setModal] = useState(false);
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [newName, setNewName] = useState(""); const [newSub, setNewSub] = useState(""); const [newEmail, setNewEmail] = useState(""); const [newPhone, setNewPhone] = useState(""); const [newPlan, setNewPlan] = useState("trial");
  const [newUsername, setNewUsername] = useState(""); const [newPassword, setNewPassword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const showToast = (msg: string) => { setToast({ show: true, msg }); setTimeout(() => setToast({ show: false, msg: "" }), 2600); };

  // جلب العملاء عند تحميل الصفحة
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoadingClients(true);
    const result = await getAllClients();
    if (result.success && result.clients) {
      // تحويل البيانات للشكل المطلوب
      const formatted = result.clients.map((c: any) => ({
        id: c.id,
        name: c.name,
        subdomain: c.subdomain,
        plan: c.plan === 'trial' ? 'تجريبي' : c.plan === 'monthly' ? 'شهري' : c.plan === 'semi' ? 'نصف سنوي' : 'سنوي',
        status: c.status,
        created: new Date(c.created_at).toLocaleDateString("ar-SA"),
        expires: c.expires_at ? new Date(c.expires_at).toLocaleDateString("ar-SA") : "—",
        emoji: ["🏪", "☕", "🍽", "🥗", "🍖", "🍕", "🍔"][Math.floor(Math.random() * 7)],
        color: ["rgba(249,115,22,0.13)", "rgba(59,130,246,0.13)", "rgba(34,197,94,0.13)", "rgba(168,85,247,0.13)"][Math.floor(Math.random() * 4)]
      }));
      setClients(formatted);
    }
    setLoadingClients(false);
  };

  const addClient = async () => {
    if (!newName.trim() || !newSub.trim()) { showToast("⚠️ أدخل الاسم والـ Subdomain"); return; }
    if (!newUsername.trim() || !newPassword.trim()) { showToast("⚠️ أدخل اسم المستخدم وكلمة المرور"); return; }
    
    showToast("⏳ جارٍ إنشاء الحساب...");
    
    // حفظ في قاعدة البيانات
    const result = await createClientInDB({
      name: newName,
      subdomain: newSub,
      email: newEmail,
      phone: newPhone,
      plan: newPlan,
      username: newUsername,
      password: newPassword,
    });

    if (!result.success) {
      showToast(`❌ فشل: ${result.error}`);
      return;
    }

    // إضافة للواجهة
    const planMap: Record<string, string> = { trial: "تجريبي", monthly: "شهري", semi: "نصف سنوي", annual: "سنوي" };
    const emojis = ["🏪", "☕", "🍽", "🥗", "🍖", "🍕", "🍔"];
    const colors = ["rgba(249,115,22,0.13)", "rgba(59,130,246,0.13)", "rgba(34,197,94,0.13)", "rgba(168,85,247,0.13)"];
    const nc: Client = { 
      id: result.client.id, 
      name: newName, 
      subdomain: newSub, 
      plan: planMap[newPlan], 
      status: newPlan === "trial" ? "trial" : "active", 
      created: new Date().toLocaleDateString("ar-SA"), 
      expires: "—", 
      emoji: emojis[Math.floor(Math.random() * emojis.length)], 
      color: colors[Math.floor(Math.random() * colors.length)] 
    };
    
    // إعادة تحميل القائمة من قاعدة البيانات
    loadClients();
    
    setModal(false); 
    setNewName(""); setNewSub(""); setNewEmail(""); setNewPhone(""); setNewUsername(""); setNewPassword("");
    showToast(`✅ تم إنشاء "${newName}" - اسم المستخدم: ${newUsername}`);
  };
  const deleteClient = (id: string) => { setClients(c => c.filter(cl => cl.id !== id)); showToast("🗑 تم حذف العميل"); };

  const filtered = statusFilter === "all" ? clients : clients.filter(c => c.status === statusFilter);

  const statusLabel: Record<string, string> = { active: "● نشط", expired: "✕ منتهي", expiring: "⏰ ينتهي قريباً", trial: "◎ تجريبي" };
  const planType: Record<string, string> = { "شهري": "monthly", "سنوي": "annual", "نصف سنوي": "semi", "تجريبي": "trial" };

  const navLinks = [
    { id: "dashboard", icon: "📊", label: "لوحة المتابعة" },
    { id: "clients", icon: "🏪", label: "العملاء", badge: clients.length.toString(), badgeColor: "#f97316" },
    { id: "subscriptions", icon: "💳", label: "الاشتراكات" },
    { id: "revenue", icon: "💰", label: "الإيرادات" },
    { id: "activity", icon: "⚡", label: "سجل النشاط", badge: "3", badgeColor: "#ef4444" },
    { id: "settings", icon: "⚙️", label: "الإعدادات" },
  ];

  const pageTitles: Record<string, string> = { dashboard: "لوحة المتابعة", clients: "إدارة العملاء", subscriptions: "الاشتراكات", revenue: "الإيرادات", activity: "سجل النشاط", settings: "الإعدادات" };

  return (
    <div style={S.page}>

      {/* SIDEBAR */}
      <aside style={S.sidebar}>
        <div style={S.sidebarLogo}>
          <div style={S.logoBox}>🍽</div>
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
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 10, cursor: "pointer" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900 }}>م</div>
            <div><div style={{ fontSize: "0.82rem", fontWeight: 800 }}>المشرف العام</div><div style={{ fontSize: "0.68rem", color: "#4b5563" }}>Super Admin</div></div>
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
            <button style={{ ...S.btn("ghost"), width: 36, height: 36, padding: 0, position: "relative" }} onClick={() => showToast("🔔 3 تنبيهات جديدة")}>
              🔔
              <span style={{ position: "absolute", top: 6, left: 6, width: 8, height: 8, borderRadius: "50%", background: "#f97316", border: "2px solid #09090f" }} />
            </button>
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
                  <div style={{ fontSize: "0.8rem", color: "#4b5563", marginTop: 3 }}>آخر تحديث: اليوم</div>
                </div>
                <button style={S.btn("accent")} onClick={() => setModal(true)}>＋ عميل جديد</button>
              </div>
              <div style={S.statsGrid}>
                {[
                  { icon: "🏪", num: clients.length, label: "إجمالي العملاء", change: "▲ 12%", color: "rgba(59,130,246,0.13)" },
                  { icon: "✅", num: clients.filter(c => c.status === "active").length, label: "اشتراكات نشطة", change: "▲ 5%", color: "rgba(34,197,94,0.13)" },
                  { icon: "💰", num: "4,290", label: "إيراد هذا الشهر (ر.س)", change: "▲ 18%", color: "rgba(249,115,22,0.13)" },
                  { icon: "⏰", num: clients.filter(c => c.status === "expiring").length, label: "تنتهي قريباً", change: "▼ 2", color: "rgba(239,68,68,0.13)" },
                ].map((s, i) => (
                  <div key={i} style={S.statCard}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
                      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: s.change.startsWith("▲") ? "#22c55e" : "#ef4444" }}>{s.change}</span>
                    </div>
                    <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.7rem", fontWeight: 900, marginBottom: 4 }}>{s.num}</div>
                    <div style={{ fontSize: "0.75rem", color: "#4b5563", fontWeight: 700 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Recent table */}
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 800 }}>📋 آخر العملاء</div>
                  <button style={S.btn("ghost")} onClick={() => setPage("clients")}>عرض الكل</button>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["العميل", "الخطة", "الحالة", "الانتهاء", "إجراءات"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {loadingClients ? (
                      <tr><td colSpan={5} style={{ ...S.td, textAlign: "center", padding: "40px", color: "#4b5563" }}>⏳ جارٍ تحميل البيانات...</td></tr>
                    ) : clients.length === 0 ? (
                      <tr><td colSpan={5} style={{ ...S.td, textAlign: "center", padding: "40px", color: "#4b5563" }}>لا توجد عملاء بعد. اضغط "عميل جديد" لإضافة أول عميل</td></tr>
                    ) : (
                      clients.slice(0, 4).map(c => (
                      <tr key={c.id} style={{ transition: "background 0.15s" }}>
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{c.emoji}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{c.name}</div>
                              <div style={{ fontSize: "0.7rem", color: "#f97316", direction: "ltr", textAlign: "right" }}>{c.subdomain}.qrmenu.com</div>
                            </div>
                          </div>
                        </td>
                        <td style={S.td}><span style={S.pill(planType[c.plan] || "monthly")}>{c.plan}</span></td>
                        <td style={S.td}><span style={S.pill(c.status)}>{statusLabel[c.status]}</span></td>
                        <td style={S.td}><span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>{c.expires}</span></td>
                        <td style={S.td}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button style={S.btn("icon")} onClick={() => setDetailClient(c)}>👁</button>
                            <button style={S.btn("icon")} onClick={() => showToast("✏️ تعديل العميل")}>✏️</button>
                          </div>
                        </td>
                      </tr>
                    )))}
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
                {[["all", `الكل (${clients.length})`], ["active", `نشط (${clients.filter(c => c.status === "active").length})`], ["expiring", "ينتهي قريباً"], ["expired", "منتهي"], ["trial", "تجريبي"]].map(([val, label]) => (
                  <button key={val} style={{ ...S.btn("ghost"), border: statusFilter === val ? "1px solid #f97316" : "1px solid rgba(255,255,255,0.06)", color: statusFilter === val ? "#f97316" : "#94a3b8" }} onClick={() => setStatusFilter(val)}>{label}</button>
                ))}
              </div>
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 800 }}>قائمة العملاء</div>
                  <button style={S.btn("ghost")} onClick={() => showToast("📥 جارٍ تصدير CSV...")}>📥 تصدير</button>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["العميل", "الخطة", "الحالة", "تاريخ التسجيل", "الانتهاء", "إجراءات"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.id}>
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{c.emoji}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{c.name}</div>
                              <div style={{ fontSize: "0.7rem", color: "#f97316", direction: "ltr", textAlign: "right" }}>{c.subdomain}.qrmenu.com</div>
                            </div>
                          </div>
                        </td>
                        <td style={S.td}><span style={S.pill(planType[c.plan] || "monthly")}>{c.plan}</span></td>
                        <td style={S.td}><span style={S.pill(c.status)}>{statusLabel[c.status]}</span></td>
                        <td style={{ ...S.td, fontSize: "0.82rem", color: "#94a3b8" }}>{c.created}</td>
                        <td style={{ ...S.td, fontSize: "0.82rem", color: "#94a3b8" }}>{c.expires}</td>
                        <td style={S.td}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button style={S.btn("icon")} onClick={() => setDetailClient(c)}>👁</button>
                            <button style={S.btn("icon")} onClick={() => showToast("✏️ تعديل")}>✏️</button>
                            <button style={{ ...S.btn("icon"), background: "rgba(239,68,68,0.12)" }} onClick={() => deleteClient(c.id)}>🗑</button>
                          </div>
                        </td>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { icon: "📅", num: clients.filter(c => c.plan === "شهري").length, label: "شهري (39 ر.س/شهر)", color: "#f97316", pct: 42 },
                  { icon: "📆", num: clients.filter(c => c.plan === "نصف سنوي").length, label: "نصف سنوي (33 ر.س/شهر)", color: "#3b82f6", pct: 33 },
                  { icon: "🗓", num: clients.filter(c => c.plan === "سنوي").length, label: "سنوي (29 ر.س/شهر)", color: "#22c55e", pct: 25 },
                ].map((s, i) => (
                  <div key={i} style={S.statCard}>
                    <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
                    <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.8rem", fontWeight: 900, color: s.color }}>{s.num}</div>
                    <div style={{ fontSize: "0.75rem", color: "#4b5563", fontWeight: 700, marginBottom: 10 }}>{s.label}</div>
                    <div style={{ height: 4, borderRadius: 4, background: "#1c1f2c" }}><div style={{ height: "100%", borderRadius: 4, background: s.color, width: `${s.pct}%` }} /></div>
                  </div>
                ))}
              </div>
              <div style={S.card}>
                <div style={S.cardHeader}><div style={{ fontSize: "0.9rem", fontWeight: 800 }}>⏰ تنتهي خلال 30 يوم</div></div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["العميل", "الخطة", "تاريخ الانتهاء", "إجراء"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {clients.filter(c => c.status === "expiring" || c.status === "trial").map(c => (
                      <tr key={c.id}>
                        <td style={S.td}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 30, height: 30, borderRadius: 8, background: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{c.emoji}</div><span style={{ fontWeight: 700 }}>{c.name}</span></div></td>
                        <td style={S.td}><span style={S.pill(planType[c.plan] || "monthly")}>{c.plan}</span></td>
                        <td style={{ ...S.td, color: "#94a3b8", fontSize: "0.82rem" }}>{c.expires}</td>
                        <td style={S.td}><button style={S.btn("accent")} onClick={() => showToast(`📧 تم إرسال تذكير لـ ${c.name}`)}>إرسال تذكير</button></td>
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
                  { icon: "💵", num: "4,290", label: "إيراد هذا الشهر (ر.س)", change: "▲ 18%" },
                  { icon: "📈", num: "51,480", label: "إجمالي الإيراد (ر.س)", change: "▲ 24%" },
                  { icon: "🧾", num: "89.4", label: "متوسط الاشتراك (ر.س)", change: "▲ 3%" },
                  { icon: "🔄", num: "94%", label: "نسبة التجديد", change: "▲ 7%" },
                ].map((s, i) => (
                  <div key={i} style={S.statCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(34,197,94,0.13)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
                      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#22c55e" }}>{s.change}</span>
                    </div>
                    <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.7rem", fontWeight: 900, marginBottom: 4 }}>{s.num}</div>
                    <div style={{ fontSize: "0.75rem", color: "#4b5563", fontWeight: 700 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── ACTIVITY ── */}
          {page === "activity" && (
            <>
              <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.2rem", fontWeight: 900, marginBottom: 20 }}>⚡ سجل النشاط</div>
              <div style={S.card}>
                {[
                  { dot: "#22c55e", text: "مطعم الفنار قام بتسجيل الدخول وتعديل قائمته", time: "منذ 10 دق" },
                  { dot: "#f97316", text: "تم إضافة عميل جديد: برغر هاوس (اشتراك تجريبي)", time: "منذ 45 دق" },
                  { dot: "#3b82f6", text: "كافيه نوفا قام بتجديد اشتراكه السنوي", time: "منذ 2 ساعة" },
                  { dot: "#ef4444", text: "انتهى اشتراك سوشي تايم — في انتظار التجديد", time: "منذ 3 ساعات" },
                  { dot: "#f59e0b", text: "تنبيه: اشتراك مطعم الأصيل ينتهي خلال 5 أيام", time: "منذ 5 ساعات" },
                  { dot: "#22c55e", text: "فريش سلاد أضاف 3 أصناف جديدة لقائمته", time: "أمس 4:30م" },
                  { dot: "#f97316", text: "تم تسجيل 1,240 مسح QR اليوم عبر جميع المطاعم", time: "أمس 12:00م" },
                ].map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 16px", borderBottom: i < 6 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.dot, marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: "0.85rem", lineHeight: 1.5 }}>{a.text}</div>
                    <div style={{ fontSize: "0.72rem", color: "#4b5563", whiteSpace: "nowrap" }}>{a.time}</div>
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
                { title: "معلومات المنصة", rows: [{ label: "اسم المنصة", value: "QRMenu" }, { label: "الدومين الرئيسي", value: "qrmenu.com" }] },
                { title: "الاشتراكات والأسعار", rows: [{ label: "سعر الاشتراك الشهري (ر.س)", value: "39" }, { label: "مدة التجربة المجانية (أيام)", value: "30" }] },
              ].map((sec, i) => (
                <div key={i} style={{ ...S.card, marginBottom: 14 }}>
                  <div style={{ padding: "12px 16px", background: "#0e1017", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "0.78rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8 }}>{sec.title}</div>
                  {sec.rows.map((row, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: j < sec.rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>{row.label}</span>
                      <input defaultValue={row.value} style={{ ...S.formInput, width: 160, padding: "8px 12px" }} />
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

        </div>
      </div>

      {/* ADD CLIENT MODAL */}
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
              <div style={S.formGroup}><label style={S.formLabel}>رقم الهاتف</label><input style={S.formInput} placeholder="+966 5X XXX XXXX" value={newPhone} onChange={e => setNewPhone(e.target.value)} /></div>
              <div style={S.formGroup}><label style={S.formLabel}>اسم المستخدم (للدخول)</label><input style={{ ...S.formInput, direction: "ltr" }} placeholder="alfanar" value={newUsername} onChange={e => setNewUsername(e.target.value)} /></div>
              <div style={S.formGroup}><label style={S.formLabel}>كلمة المرور</label><input style={S.formInput} type="password" placeholder="كلمة مرور قوية" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>نوع الاشتراك</label>
                <select style={S.formInput} value={newPlan} onChange={e => setNewPlan(e.target.value)}>
                  <option value="trial">تجريبي مجاني</option>
                  <option value="monthly">شهري — 39 ر.س</option>
                  <option value="semi">نصف سنوي — 198 ر.س</option>
                  <option value="annual">سنوي — 348 ر.س</option>
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

      {/* CLIENT DETAIL MODAL */}
      {detailClient && (
        <div style={S.overlay} onClick={() => setDetailClient(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1rem", fontWeight: 900 }}>👁 تفاصيل العميل</div>
              <button style={{ ...S.btn("ghost"), width: 28, height: 28, padding: 0 }} onClick={() => setDetailClient(null)}>✕</button>
            </div>
            <div style={{ padding: 20, textAlign: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: detailClient.color, border: "2px solid rgba(249,115,22,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 12px" }}>{detailClient.emoji}</div>
              <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.15rem", fontWeight: 900 }}>{detailClient.name}</div>
              <div style={{ fontSize: "0.8rem", color: "#f97316", margin: "4px 0 10px", direction: "ltr" }}>{detailClient.subdomain}.qrmenu.com</div>
              <span style={S.pill(detailClient.status)}>{statusLabel[detailClient.status]}</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "16px 0" }}>
                <div style={{ background: "#1c1f2c", borderRadius: 10, padding: 12 }}><div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.3rem", fontWeight: 900, color: "#f97316" }}>24</div><div style={{ fontSize: "0.7rem", color: "#4b5563", fontWeight: 700 }}>صنف في القائمة</div></div>
                <div style={{ background: "#1c1f2c", borderRadius: 10, padding: 12 }}><div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.3rem", fontWeight: 900, color: "#3b82f6" }}>340</div><div style={{ fontSize: "0.7rem", color: "#4b5563", fontWeight: 700 }}>مسح QR هذا الشهر</div></div>
              </div>
              <div style={{ background: "#1c1f2c", borderRadius: 10, padding: 14, fontSize: "0.85rem", lineHeight: 2, textAlign: "right", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#4b5563" }}>الخطة:</span><span style={S.pill(planType[detailClient.plan] || "monthly")}>{detailClient.plan}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#4b5563" }}>تاريخ التسجيل:</span><span style={{ fontWeight: 700 }}>{detailClient.created}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#4b5563" }}>تاريخ الانتهاء:</span><span style={{ fontWeight: 700 }}>{detailClient.expires}</span></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...S.btn("accent"), flex: 1 }} onClick={() => { showToast("✅ تم تجديد الاشتراك!"); setDetailClient(null); }}>تجديد الاشتراك</button>
                <button style={{ ...S.btn("ghost"), flex: 1 }} onClick={() => showToast("📧 تم إرسال رسالة!")}>إرسال رسالة</button>
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
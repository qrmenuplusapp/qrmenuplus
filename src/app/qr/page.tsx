"use client";
import { useState, useEffect, useRef } from "react";

const COLORS_FG = ["#1a1a2e","#f97316","#3b82f6","#22c55e","#a855f7","#ef4444","#f59e0b","#0f172a"];
const COLORS_BG = ["#ffffff","#f8f4ef","#fef3c7","#f0fdf4","#eff6ff","#fdf4ff","#1a1a2e","#0f172a"];
const TEMPLATES = [
  { id: "classic", label: "كلاسيكي أسود", desc: "واضح ومناسب لكل المطاعم", fg: "#1a1a2e", bg: "#ffffff" },
  { id: "orange",  label: "برتقالي دافئ",  desc: "ألوان QRMenu الرسمية",        fg: "#f97316", bg: "#fff8f0" },
  { id: "dark",    label: "داكن فاخر",     desc: "مثالي للمطاعم الراقية",        fg: "#f1f5f9", bg: "#0f172a" },
  { id: "green",   label: "أخضر طبيعي",   desc: "للمطاعم الصحية والعضوية",      fg: "#16a34a", bg: "#f0fdf4" },
];

const S: Record<string, any> = {
  page: { minHeight: "100vh", background: "#09090f", color: "#f1f5f9", fontFamily: "'Cairo','Tajawal',sans-serif" },
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 5%", background: "rgba(9,9,15,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky" as const, top: 0, zIndex: 100 },
  logoBox: { width: 30, height: 30, borderRadius: 8, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  wrapper: { maxWidth: 1100, margin: "0 auto", padding: "44px 5% 80px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 400px", gap: 22, alignItems: "start" },
  panel: { background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, overflow: "hidden" },
  tabBar: { display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  tab: (active: boolean): React.CSSProperties => ({ flex: 1, padding: "13px 8px", textAlign: "center", fontSize: "0.82rem", fontWeight: 800, color: active ? "#f97316" : "#4b5563", cursor: "pointer", borderBottom: active ? "2px solid #f97316" : "2px solid transparent", transition: "all 0.2s" }),
  tabContent: { padding: 20 },
  formGroup: { marginBottom: 15 } as React.CSSProperties,
  formLabel: { display: "block" as const, fontSize: "0.7rem", fontWeight: 800, color: "#4b5563", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: 0.6 },
  input: { width: "100%", background: "#1c1f2c", border: "1.5px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "#f1f5f9", padding: "11px 13px", fontSize: "0.9rem", fontFamily: "'Cairo',sans-serif", outline: "none" } as React.CSSProperties,
  sectionTitle: { fontSize: "0.7rem", fontWeight: 800, color: "#4b5563", textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" },
  swatch: (active: boolean, color: string): React.CSSProperties => ({ width: 30, height: 30, borderRadius: 8, background: color, cursor: "pointer", border: active ? "2px solid #fff" : "2px solid transparent", transform: active ? "scale(1.2)" : "scale(1)", transition: "all 0.2s", boxShadow: active ? "0 0 10px rgba(255,255,255,0.2)" : "none", outline: ["#ffffff","#f8f4ef","#fef3c7","#f0fdf4","#eff6ff","#fdf4ff"].includes(color) ? "1px solid rgba(255,255,255,0.1)" : "none" }),
  styleOpt: (active: boolean): React.CSSProperties => ({ background: active ? "rgba(249,115,22,0.12)" : "#1c1f2c", border: `1.5px solid ${active ? "rgba(249,115,22,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "11px 8px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }),
  previewPanel: { position: "sticky" as const, top: 80 },
  previewBox: { background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: 26, textAlign: "center" },
  dlBtn: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, background: "#1c1f2c", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 8px", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Cairo',sans-serif" },
  btn: (variant: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      accent: { background: "#f97316", color: "#fff", boxShadow: "0 3px 12px rgba(249,115,22,0.3)" },
      ghost: { background: "#1c1f2c", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.06)" },
    };
    return { border: "none", borderRadius: 9, padding: "9px 16px", fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, ...map[variant] };
  },
  toast: (show: boolean): React.CSSProperties => ({ position: "fixed", bottom: 24, right: 24, background: "#2a2f44", border: "1px solid rgba(249,115,22,0.22)", borderRadius: 12, padding: "11px 16px", zIndex: 300, opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(10px)", transition: "all 0.3s", pointerEvents: "none", fontSize: "0.88rem", fontWeight: 700 }),
};

export default function QRGenerator() {
  const [activeTab, setActiveTab] = useState(0);
  const [url, setUrl] = useState("https://menu.qrmenu.com/alfanar");
  const [label, setLabel] = useState("مطعم الفنار");
  const [sublabel, setSublabel] = useState("امسح لعرض القائمة");
  const [fgColor, setFgColor] = useState("#1a1a2e");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(240);
  const [activeTpl, setActiveTpl] = useState("classic");
  const [toast, setToast] = useState({ show: false, msg: "" });
  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<any>(null);

  const showToast = (msg: string) => { setToast({ show: true, msg }); setTimeout(() => setToast({ show: false, msg: "" }), 2600); };

  useEffect(() => {
    generateQR();
  }, [url, fgColor, bgColor, size]);

  const generateQR = () => {
    if (!qrRef.current) return;
    if (typeof window === "undefined") return;
    try {
      const QRCode = require("qrcode");
      const canvas = qrRef.current.querySelector("canvas");
      if (canvas) {
        QRCode.toCanvas(canvas, url || "https://qrmenu.com", {
          width: size, margin: 2,
          color: { dark: fgColor, light: bgColor }
        });
      }
    } catch (e) {
      // QRCode library not available, show placeholder
    }
  };

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setFgColor(tpl.fg);
    setBgColor(tpl.bg);
    setActiveTpl(tpl.id);
    showToast("🎨 تم تطبيق القالب!");
  };

  const copyUrl = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => showToast("✅ تم نسخ الرابط!"));
    else showToast("🔗 " + url);
  };

  const downloadQR = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) { showToast("⚠️ الرمز غير جاهز بعد"); return; }
    const link = document.createElement("a");
    link.download = `qrmenu-${label || "qr"}.png`;
    link.href = (canvas as HTMLCanvasElement).toDataURL("image/png");
    link.click();
    showToast("✅ تم تحميل ملف PNG!");
  };

  const tabs = ["🔗 الرابط", "🎨 التصميم", "🖼️ القوالب", "🖨️ الطباعة"];

  return (
    <div style={S.page}>
      {/* NAV */}
      <nav style={S.nav}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={S.logoBox}>🍽</div>
          <span style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.1rem", fontWeight: 900 }}>QR<span style={{ color: "#f97316" }}>Menu</span></span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={S.btn("ghost")} onClick={() => window.history.back()}>← العودة</button>
          <button style={S.btn("accent")} onClick={downloadQR}>⬇️ تحميل</button>
        </div>
      </nav>

      <div style={S.wrapper}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 42 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.22)", color: "#fb923c", padding: "6px 14px", borderRadius: 50, fontSize: "0.78rem", fontWeight: 800, marginBottom: 14 }}>🔳 مولّد QR Code</div>
          <h1 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 900, marginBottom: 8 }}>اصنع رمز QR <span style={{ color: "#f97316" }}>مطعمك</span> الآن</h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>أدخل رابط قائمتك، خصّص الشكل، وحمّل الرمز جاهزاً للطباعة</p>
        </div>

        <div style={S.grid}>
          {/* FORM PANEL */}
          <div style={S.panel}>
            <div style={S.tabBar}>
              {tabs.map((t, i) => <div key={i} style={S.tab(activeTab === i)} onClick={() => setActiveTab(i)}>{t}</div>)}
            </div>

            {/* Tab 0: URL */}
            {activeTab === 0 && (
              <div style={S.tabContent}>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>رابط القائمة</label>
                  <input style={S.input} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://menu.qrmenu.com/مطعمك" />
                </div>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>اسم المطعم (يظهر أسفل الرمز)</label>
                  <input style={S.input} value={label} onChange={e => setLabel(e.target.value)} placeholder="مطعم الفنار" />
                </div>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>وصف قصير (اختياري)</label>
                  <input style={S.input} value={sublabel} onChange={e => setSublabel(e.target.value)} placeholder="امسح لعرض القائمة" />
                </div>
              </div>
            )}

            {/* Tab 1: STYLE */}
            {activeTab === 1 && (
              <div style={S.tabContent}>
                <div style={S.formGroup}>
                  <div style={S.sectionTitle}>لون الرمز</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {COLORS_FG.map(c => <div key={c} style={S.swatch(fgColor === c, c)} onClick={() => setFgColor(c)} />)}
                  </div>
                </div>
                <div style={S.formGroup}>
                  <div style={S.sectionTitle}>لون الخلفية</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {COLORS_BG.map(c => <div key={c} style={S.swatch(bgColor === c, c)} onClick={() => setBgColor(c)} />)}
                  </div>
                </div>
                <div style={S.formGroup}>
                  <div style={S.sectionTitle}>حجم الرمز</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: "0.75rem", color: "#4b5563" }}>صغير</span>
                    <input type="range" min={160} max={360} step={20} value={size} onChange={e => setSize(parseInt(e.target.value))} style={{ flex: 1, accentColor: "#f97316" }} />
                    <span style={{ fontSize: "0.75rem", color: "#4b5563" }}>كبير</span>
                    <span style={{ minWidth: 44, textAlign: "center", fontSize: "0.82rem", fontWeight: 800, color: "#f97316" }}>{size}px</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: TEMPLATES */}
            {activeTab === 2 && (
              <div style={S.tabContent}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {TEMPLATES.map(tpl => (
                    <div key={tpl.id} onClick={() => applyTemplate(tpl)} style={{ background: activeTpl === tpl.id ? "rgba(249,115,22,0.08)" : "#1c1f2c", border: `1.5px solid ${activeTpl === tpl.id ? "#f97316" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}>
                      <div style={{ height: 90, background: tpl.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="60" height="60" viewBox="0 0 100 100">
                          <rect x="5" y="5" width="30" height="30" rx="4" fill="none" stroke={tpl.fg} strokeWidth="3"/>
                          <rect x="10" y="10" width="20" height="20" rx="2" fill={tpl.fg}/>
                          <rect x="65" y="5" width="30" height="30" rx="4" fill="none" stroke={tpl.fg} strokeWidth="3"/>
                          <rect x="70" y="10" width="20" height="20" rx="2" fill={tpl.fg}/>
                          <rect x="5" y="65" width="30" height="30" rx="4" fill="none" stroke={tpl.fg} strokeWidth="3"/>
                          <rect x="10" y="70" width="20" height="20" rx="2" fill={tpl.fg}/>
                          <rect x="40" y="5" width="8" height="8" rx="1" fill={tpl.fg}/>
                          <rect x="52" y="15" width="8" height="8" rx="1" fill={tpl.fg}/>
                          <rect x="40" y="40" width="8" height="8" rx="1" fill={tpl.fg}/>
                          <rect x="55" y="55" width="8" height="8" rx="1" fill={tpl.fg}/>
                          <rect x="70" y="65" width="8" height="8" rx="1" fill={tpl.fg}/>
                        </svg>
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 800, marginBottom: 3, color: activeTpl === tpl.id ? "#f97316" : "#f1f5f9" }}>{tpl.label}</div>
                        <div style={{ fontSize: "0.72rem", color: "#4b5563" }}>{tpl.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: PRINT */}
            {activeTab === 3 && (
              <div style={S.tabContent}>
                <div style={S.sectionTitle}>الحجم المثالي للطباعة</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                  {[
                    { icon: "🍽", label: "طاولة (7×7 سم)", size: 240 },
                    { icon: "🪟", label: "واجهة (15×15 سم)", size: 320 },
                    { icon: "🪧", label: "استاند (A5)", size: 360 },
                    { icon: "🖼", label: "ملصق (A4)", size: 400 },
                  ].map((opt, i) => (
                    <div key={i} style={S.styleOpt(size === opt.size)} onClick={() => { setSize(opt.size); showToast("📐 تم تعيين الحجم المناسب!"); }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{opt.icon}</div>
                      <div style={{ fontSize: "0.78rem", fontWeight: 800, color: size === opt.size ? "#fb923c" : "#94a3b8" }}>{opt.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#1c1f2c", borderRadius: 12, padding: 16, fontSize: "0.83rem", lineHeight: 1.9, color: "#94a3b8" }}>
                  <strong style={{ color: "#f1f5f9", display: "block", marginBottom: 8 }}>💡 نصائح احترافية:</strong>
                  ✅ استخدم ملف PNG بدقة عالية<br />
                  ✅ تأكد من هامش أبيض حول الرمز<br />
                  ✅ اختبر الرمز بعدة هواتف قبل الطباعة<br />
                  ✅ الحجم الأدنى القابل للمسح: 2.5×2.5 سم
                </div>
              </div>
            )}
          </div>

          {/* PREVIEW PANEL */}
          <div style={S.previewPanel}>
            <div style={S.previewBox}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1, marginBottom: 18 }}>معاينة مباشرة</div>

              {/* QR Stage */}
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: bgColor, borderRadius: 16, padding: 18, marginBottom: 14, minWidth: 180, minHeight: 180, transition: "background 0.3s" }}>
                <div ref={qrRef}>
                  <canvas id="qr-canvas" />
                </div>
              </div>

              <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "0.95rem", fontWeight: 900, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: "0.72rem", color: "#f97316", fontWeight: 700, marginBottom: 16 }}>{sublabel}</div>

              {/* URL box */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, background: "#1c1f2c", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 10, padding: "10px 13px", marginBottom: 18 }}>
                <span style={{ fontSize: "0.78rem", color: "#f97316", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", direction: "ltr" }}>
                  {url.replace("https://", "")}
                </span>
                <button style={{ background: "rgba(249,115,22,0.13)", color: "#fb923c", border: "none", borderRadius: 7, padding: "5px 10px", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer", flexShrink: 0, fontFamily: "'Cairo',sans-serif" }} onClick={copyUrl}>نسخ</button>
              </div>

              {/* Download buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[
                  { icon: "🖼️", label: "PNG", sub: "جودة عالية", action: downloadQR },
                  { icon: "✏️", label: "SVG", sub: "قابل للتكبير", action: () => showToast("✅ جارٍ تحميل SVG...") },
                  { icon: "📄", label: "PDF", sub: "للطباعة", action: () => showToast("📄 جارٍ إنشاء PDF...") },
                  { icon: "🖨️", label: "طباعة", sub: "مباشرة", action: () => { window.print(); showToast("🖨️ فتح الطابعة..."); } },
                ].map((btn, i) => (
                  <div key={i} style={S.dlBtn} onClick={btn.action}>
                    <span style={{ fontSize: 18 }}>{btn.icon}</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#94a3b8" }}>{btn.label}</span>
                    <span style={{ fontSize: "0.65rem", color: "#4b5563" }}>{btn.sub}</span>
                  </div>
                ))}
              </div>

              {/* Share */}
              <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>مشاركة الرابط</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {["📱", "📘", "📸", "🐦", "🔗"].map((icon, i) => (
                  <div key={i} onClick={() => showToast(`${icon} جارٍ المشاركة...`)} style={{ width: 36, height: 36, borderRadius: 10, background: "#1c1f2c", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer" }}>{icon}</div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div style={{ background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, marginTop: 12 }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>إحصائيات الرمز</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.4rem", fontWeight: 900, color: "#f97316" }}>340</div>
                  <div style={{ fontSize: "0.7rem", color: "#4b5563", fontWeight: 700 }}>مسح هذا الشهر</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.4rem", fontWeight: 900, color: "#22c55e" }}>24</div>
                  <div style={{ fontSize: "0.7rem", color: "#4b5563", fontWeight: 700 }}>مسح اليوم</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HOW TO USE */}
        <div style={{ background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: 28, marginTop: 44 }}>
          <h2 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.3rem", fontWeight: 900, marginBottom: 6 }}>🖨️ كيف تستخدم الرمز بعد التحميل؟</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginTop: 20 }}>
            {[
              { num: "1", title: "حمّل الرمز", desc: "اختر صيغة PNG للطباعة أو SVG للتصميم" },
              { num: "2", title: "اطبعه باحترافية", desc: "استخدم ورق لامع بالحجم المناسب للطاولة" },
              { num: "3", title: "ضعه على الطاولات", desc: "في حامل بلاستيكي أو ملصق مباشر" },
              { num: "4", title: "زبائنك يمسحون فوراً", desc: "بدون تطبيق، يفتح المتصفح مباشرة" },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(249,115,22,0.13)", border: "1px solid rgba(249,115,22,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 900, color: "#f97316", margin: "0 auto 12px" }}>{step.num}</div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 800, marginBottom: 5 }}>{step.title}</h4>
                <p style={{ fontSize: "0.78rem", color: "#4b5563", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOAST */}
      <div style={S.toast(toast.show)}>{toast.msg}</div>
    </div>
  );
}
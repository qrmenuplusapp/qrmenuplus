"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Category = { id: string; name: string; emoji: string; is_visible: boolean; sort_order: number; image_url?: string };
type Item = { id: string; category_id: string; name: string; description: string; price: number; is_visible: boolean; image_url?: string };
type Restaurant = { id: string; name: string; description: string; address: string; phone: string; wifi_name: string; wifi_password: string; whatsapp?: string; google_maps_url?: string };

const THEMES = {
  dark: {
    name: "داكن",
    icon: "🌙",
    bg: "#09090f",
    surface: "#13161e",
    surface2: "#1c1f2c",
    border: "rgba(255,255,255,0.06)",
    text: "#f1f5f9",
    textMuted: "#4b5563",
    textSub: "#94a3b8",
    accent: "#f97316",
    accentBg: "rgba(249,115,22,0.12)",
    accentBorder: "rgba(249,115,22,0.22)",
    heroBg: "linear-gradient(160deg,#0f0f1c 0%,#1c1005 100%)",
    headerBg: "rgba(9,9,15,0.97)",
  },
  light: {
    name: "فاتح",
    icon: "☀️",
    bg: "#f8f7f4",
    surface: "#ffffff",
    surface2: "#f1ede8",
    border: "rgba(0,0,0,0.07)",
    text: "#1a1410",
    textMuted: "#9ca3af",
    textSub: "#6b7280",
    accent: "#e8610a",
    accentBg: "rgba(232,97,10,0.08)",
    accentBorder: "rgba(232,97,10,0.2)",
    heroBg: "linear-gradient(160deg,#fff8f3 0%,#fdecd9 100%)",
    headerBg: "rgba(248,247,244,0.97)",
  },
  emerald: {
    name: "زمردي",
    icon: "🌿",
    bg: "#060f0a",
    surface: "#0c1a10",
    surface2: "#122018",
    border: "rgba(52,211,153,0.08)",
    text: "#ecfdf5",
    textMuted: "#374151",
    textSub: "#6ee7b7",
    accent: "#10b981",
    accentBg: "rgba(16,185,129,0.12)",
    accentBorder: "rgba(16,185,129,0.25)",
    heroBg: "linear-gradient(160deg,#060f0a 0%,#052e16 100%)",
    headerBg: "rgba(6,15,10,0.97)",
  },
  royal: {
    name: "ملكي",
    icon: "👑",
    bg: "#07050f",
    surface: "#100d1e",
    surface2: "#17132b",
    border: "rgba(139,92,246,0.1)",
    text: "#f5f3ff",
    textMuted: "#4b5563",
    textSub: "#c4b5fd",
    accent: "#8b5cf6",
    accentBg: "rgba(139,92,246,0.12)",
    accentBorder: "rgba(139,92,246,0.25)",
    heroBg: "linear-gradient(160deg,#07050f 0%,#1e1040 100%)",
    headerBg: "rgba(7,5,15,0.97)",
  },
  rose: {
    name: "وردي",
    icon: "🌹",
    bg: "#0f0508",
    surface: "#1c0a10",
    surface2: "#261018",
    border: "rgba(251,113,133,0.08)",
    text: "#fff1f2",
    textMuted: "#4b5563",
    textSub: "#fda4af",
    accent: "#f43f5e",
    accentBg: "rgba(244,63,94,0.12)",
    accentBorder: "rgba(244,63,94,0.25)",
    heroBg: "linear-gradient(160deg,#0f0508 0%,#3b0a15 100%)",
    headerBg: "rgba(15,5,8,0.97)",
  },
  gold: {
    name: "ذهبي",
    icon: "✨",
    bg: "#0a0800",
    surface: "#1a1400",
    surface2: "#221c00",
    border: "rgba(234,179,8,0.1)",
    text: "#fefce8",
    textMuted: "#4b5563",
    textSub: "#fde047",
    accent: "#eab308",
    accentBg: "rgba(234,179,8,0.12)",
    accentBorder: "rgba(234,179,8,0.25)",
    heroBg: "linear-gradient(160deg,#0a0800 0%,#1c1500 100%)",
    headerBg: "rgba(10,8,0,0.97)",
  },
};

type ThemeKey = keyof typeof THEMES;



export default function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState("");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("all");
  const [theme, setTheme] = useState<ThemeKey>("dark");
  const [showThemePicker, setShowThemePicker] = useState(false);

  const T = THEMES[theme];

  useEffect(() => { params.then(p => setSlug(p.slug)); }, []);
  useEffect(() => { if (slug) loadMenu(); }, [slug]);

  // تحميل الثيم: أولاً من الداشبورد (قاعدة البيانات)، ثم المحلي
  useEffect(() => {
    const saved = localStorage.getItem("menu-theme") as ThemeKey;
    if (saved && THEMES[saved]) setTheme(saved);
  }, []);

  const changeTheme = (t: ThemeKey) => {
    setTheme(t);
    localStorage.setItem("menu-theme", t);
    setShowThemePicker(false);
  };

  const loadMenu = async () => {
    try {
      const { data: clientData, error: ce } = await supabase.from('clients').select('id').eq('subdomain', slug).single();
      if (ce || !clientData) { setNotFound(true); setLoading(false); return; }
      const { data: restData, error: re } = await supabase.from('restaurants').select('*').eq('client_id', clientData.id).single();
      if (re || !restData) { setNotFound(true); setLoading(false); return; }
      setRestaurant(restData);

      // تطبيق الثيم المحدد من الداشبورد إن وُجد
      if (restData.theme && THEMES[restData.theme as ThemeKey]) {
        setTheme(restData.theme as ThemeKey);
        localStorage.setItem("menu-theme", restData.theme);
      }

      const { data: cats } = await supabase.from('categories').select('*').eq('restaurant_id', restData.id).eq('is_visible', true).order('sort_order');
      setCategories(cats || []);
      const catIds = (cats || []).map((c: any) => c.id);
      if (catIds.length > 0) {
        const { data: itms } = await supabase.from('items').select('*').in('category_id', catIds).eq('is_visible', true).order('sort_order');
        setItems(itms || []);
      }
    } catch { setNotFound(true); }
    setLoading(false);
  };

  const toggleCollapse = (id: string) => {
    setCollapsedCats(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const formatPrice = (price: number) => `${price.toLocaleString('ar-SY')} ل.س`;
  const visibleItems = activeTab === "all" ? items : items.filter(i => i.category_id === activeTab);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#09090f", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "'Cairo',sans-serif" }}>
      <div style={{ width: 52, height: 52, border: "3px solid rgba(249,115,22,0.15)", borderTop: "3px solid #f97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "#09090f", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, fontFamily: "'Cairo',sans-serif", textAlign: "center", padding: 24 }}>
      <div style={{ fontSize: 72 }}>🍽</div>
      <h1 style={{ color: "#f1f5f9", fontSize: "1.4rem", fontWeight: 900, fontFamily: "'Tajawal',sans-serif" }}>لم يتم العثور على القائمة</h1>
      <p style={{ color: "#6b7280" }}>تأكد من صحة الرابط</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Cairo','Tajawal',sans-serif", paddingBottom: 60, transition: "background 0.3s, color 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;700;800;900&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{display:none;}
        .hscroll{overflow-x:auto;scrollbar-width:none;}
        .icard{transition:transform 0.18s,box-shadow 0.18s;cursor:pointer;}
        .icard:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,0.3);}
        .cat-header{cursor:pointer;transition:background 0.2s;}
        .tab-btn{border:none;cursor:pointer;font-family:'Cairo',sans-serif;font-weight:700;font-size:0.8rem;transition:all 0.2s;white-space:nowrap;flex-shrink:0;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(50px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .fade-up{animation:fadeUp 0.35s ease forwards;}
        .slide-up{animation:slideUp 0.3s ease forwards;}
        .fade-in{animation:fadeIn 0.2s ease forwards;}
      `}</style>

      {/* ===== HERO ===== */}
      <div style={{ position: "relative", overflow: "hidden", background: T.heroBg, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ position: "absolute", top: -100, right: -80, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle,${T.accentBg} 0%,transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle,${T.accentBg} 0%,transparent 70%)`, pointerEvents: "none" }} />

        {/* Theme Button في الأعلى */}
        <div style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}>
          <button onClick={() => setShowThemePicker(!showThemePicker)} style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
            🎨
          </button>
        </div>

        <div style={{ position: "relative", zIndex: 1, padding: "52px 24px 32px", textAlign: "center" }}>
          {/* ===== LOGO ===== */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <img
              src="/qr_menu_logo.svg"
              alt="QRMenu"
              style={{ height: 36, filter: theme === "light" ? "brightness(0)" : "brightness(1)" }}
            />
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 50, padding: "5px 16px", marginBottom: 20, fontSize: "0.72rem", fontWeight: 800, color: "#22c55e" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            مفتوح الآن
          </div>
          <h1 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "clamp(2rem,6vw,3rem)", fontWeight: 900, marginBottom: 10, letterSpacing: -1, lineHeight: 1.1, color: T.text }}>
            {restaurant?.name}
          </h1>
          {restaurant?.description && (
            <p style={{ color: T.textSub, fontSize: "0.9rem", maxWidth: 380, margin: "0 auto 20px", lineHeight: 1.75 }}>{restaurant.description}</p>
          )}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* زر الهاتف */}
            {restaurant?.phone && (
              <a href={`tel:${restaurant.phone}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 50, padding: "9px 20px", color: T.accent, fontSize: "0.9rem", fontWeight: 800, textDecoration: "none" }}>
                📞 {restaurant.phone}
              </a>
            )}
            {/* زر واتساب */}
            {restaurant?.whatsapp && (
              <a
                href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 50, padding: "9px 20px", color: "#25d366", fontSize: "0.9rem", fontWeight: 800, textDecoration: "none" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                واتساب
              </a>
            )}
            {/* زر الموقع على غوغل */}
            {restaurant?.google_maps_url && (
              <a
                href={restaurant.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(66,133,244,0.1)", border: "1px solid rgba(66,133,244,0.25)", borderRadius: 50, padding: "9px 20px", color: "#4285f4", fontSize: "0.9rem", fontWeight: 800, textDecoration: "none" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#4285f4"/></svg>
                الموقع
              </a>
            )}
            {restaurant?.address && !restaurant?.google_maps_url && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 50, padding: "9px 20px", color: T.textSub, fontSize: "0.88rem", fontWeight: 700 }}>
                📍 {restaurant.address}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== THEME PICKER ===== */}
      {showThemePicker && (
        <div className="fade-in" style={{ margin: "12px 14px 0", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 16 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>اختر الثيم</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {(Object.keys(THEMES) as ThemeKey[]).map(key => {
              const t = THEMES[key];
              const isActive = theme === key;
              return (
                <button key={key} onClick={() => changeTheme(key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 8px", borderRadius: 14, border: `2px solid ${isActive ? T.accent : T.border}`, background: isActive ? T.accentBg : T.surface2, cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: t.heroBg, border: `2px solid ${t.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{t.icon}</div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: isActive ? T.accent : T.textSub }}>{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== WIFI ===== */}
      {restaurant?.wifi_name && (
        <div style={{ margin: "12px 14px 0", background: "linear-gradient(135deg,rgba(59,130,246,0.08),rgba(59,130,246,0.03))", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📶</div>
          <div>
            <div style={{ fontSize: "0.68rem", color: "#60a5fa", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>WiFi المجاني</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 800, color: T.text }}>{restaurant.wifi_name}</div>
            {restaurant.wifi_password && <div style={{ fontSize: "0.78rem", color: T.textSub, marginTop: 2 }}>كلمة المرور: <span style={{ color: T.text, fontWeight: 800 }}>{restaurant.wifi_password}</span></div>}
          </div>
        </div>
      )}

      {/* ===== TABS + VIEW TOGGLE ===== */}
      {categories.length > 0 && (
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: T.headerBg, backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="hscroll" style={{ display: "flex", gap: 6, padding: "10px 12px", flex: 1 }}>
              <button className="tab-btn" onClick={() => setActiveTab("all")} style={{ padding: "7px 16px", borderRadius: 50, background: activeTab === "all" ? T.accent : T.surface2, color: activeTab === "all" ? "#fff" : T.textSub }}>
                الكل ({items.length})
              </button>
              {categories.map(cat => (
                <button key={cat.id} className="tab-btn" onClick={() => setActiveTab(cat.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 50, background: activeTab === cat.id ? T.accent : T.surface2, color: activeTab === cat.id ? "#fff" : T.textSub }}>
                  {cat.image_url ? <img src={cat.image_url} alt="" style={{ width: 16, height: 16, borderRadius: "50%", objectFit: "cover" }} /> : <span style={{ fontSize: 14 }}>{cat.emoji}</span>}
                  {cat.name}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 4, padding: "10px 12px 10px 0", flexShrink: 0 }}>
              <button onClick={() => setViewMode("list")} style={{ width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer", background: viewMode === "list" ? T.accentBg : T.surface2, color: viewMode === "list" ? T.accent : T.textMuted, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>☰</button>
              <button onClick={() => setViewMode("grid")} style={{ width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer", background: viewMode === "grid" ? T.accentBg : T.surface2, color: viewMode === "grid" ? T.accent : T.textMuted, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>⊞</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONTENT ===== */}
      <div style={{ padding: "14px 14px 0" }}>
        {activeTab === "all" ? (
          categories.map(cat => {
            const catItems = items.filter(i => i.category_id === cat.id);
            if (catItems.length === 0) return null;
            const isCollapsed = collapsedCats.has(cat.id);
            return (
              <div key={cat.id} className="fade-up" style={{ marginBottom: 10, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, overflow: "hidden", transition: "background 0.3s" }}>
                <div className="cat-header" onClick={() => toggleCollapse(cat.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: isCollapsed ? "none" : `1px solid ${T.border}` }}>
                  {cat.image_url
                    ? <img src={cat.image_url} alt={cat.name} style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
                    : <div style={{ width: 44, height: 44, borderRadius: 12, background: T.accentBg, border: `1px solid ${T.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{cat.emoji}</div>
                  }
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1rem", fontWeight: 900, color: T.text }}>{cat.name}</div>
                    <div style={{ fontSize: "0.72rem", color: T.textMuted, marginTop: 2 }}>{catItems.length} صنف</div>
                  </div>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: T.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: T.textMuted, transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.25s" }}>▼</div>
                </div>
                {!isCollapsed && (
                  <div style={{ padding: 12 }}>
                    {viewMode === "list"
                      ? <ListItems items={catItems} onSelect={setSelectedItem} formatPrice={formatPrice} T={T} />
                      : <GridItems items={catItems} onSelect={setSelectedItem} formatPrice={formatPrice} T={T} />
                    }
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="fade-up">
            {viewMode === "list"
              ? <ListItems items={visibleItems} onSelect={setSelectedItem} formatPrice={formatPrice} T={T} />
              : <GridItems items={visibleItems} onSelect={setSelectedItem} formatPrice={formatPrice} T={T} />
            }
            {visibleItems.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: T.textMuted }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🍽</div>
                <p>لا توجد أصناف في هذا القسم</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== ITEM MODAL ===== */}
      {selectedItem && (
        <div onClick={() => setSelectedItem(null)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div className="slide-up" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: T.surface, borderRadius: "24px 24px 0 0", border: `1px solid ${T.border}`, overflow: "hidden", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ width: 40, height: 4, borderRadius: 4, background: T.surface2, margin: "12px auto 0" }} />
            {selectedItem.image_url && <img src={selectedItem.image_url} alt={selectedItem.name} style={{ width: "100%", height: 240, objectFit: "cover", marginTop: 12 }} />}
            <div style={{ padding: "20px 22px 36px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                <h2 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.3rem", fontWeight: 900, flex: 1, color: T.text }}>{selectedItem.name}</h2>
                <div style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 12, padding: "6px 14px", fontSize: "1rem", fontWeight: 900, color: T.accent, whiteSpace: "nowrap" }}>
                  {formatPrice(selectedItem.price)}
                </div>
              </div>
              {selectedItem.description && <p style={{ color: T.textSub, fontSize: "0.9rem", lineHeight: 1.8, marginBottom: 24 }}>{selectedItem.description}</p>}
              <button onClick={() => setSelectedItem(null)} style={{ width: "100%", background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, color: T.textSub, fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: "0.92rem", cursor: "pointer" }}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <div style={{ textAlign: "center", padding: "40px 20px 0", color: T.textMuted, fontSize: "0.72rem", fontWeight: 700 }}>
        مدعوم بـ <span style={{ color: T.accent }}>QRMenu</span>
      </div>
    </div>
  );
}

type TType = typeof THEMES[ThemeKey];

function ListItems({ items, onSelect, formatPrice, T }: { items: Item[]; onSelect: (i: Item) => void; formatPrice: (p: number) => string; T: TType }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(item => (
        <div key={item.id} className="icard" onClick={() => onSelect(item)} style={{ display: "flex", background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
          {item.image_url
            ? <img src={item.image_url} alt={item.name} style={{ width: 88, height: 88, objectFit: "cover", flexShrink: 0 }} />
            : <div style={{ width: 88, height: 88, background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>🍽</div>
          }
          <div style={{ flex: 1, padding: "11px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.93rem", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: T.text }}>{item.name}</div>
              {item.description && <div style={{ fontSize: "0.74rem", color: T.textMuted, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>{item.description}</div>}
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: 900, color: T.accent, marginTop: 6 }}>{formatPrice(item.price)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function GridItems({ items, onSelect, formatPrice, T }: { items: Item[]; onSelect: (i: Item) => void; formatPrice: (p: number) => string; T: TType }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {items.map(item => (
        <div key={item.id} className="icard" onClick={() => onSelect(item)} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
          {item.image_url
            ? <img src={item.image_url} alt={item.name} style={{ width: "100%", height: 110, objectFit: "cover" }} />
            : <div style={{ width: "100%", height: 110, background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🍽</div>
          }
          <div style={{ padding: "10px 12px 12px" }}>
            <div style={{ fontWeight: 800, fontSize: "0.85rem", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: T.text }}>{item.name}</div>
            {item.description && <div style={{ fontSize: "0.7rem", color: T.textMuted, lineHeight: 1.4, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>{item.description}</div>}
            <div style={{ fontSize: "0.88rem", fontWeight: 900, color: T.accent }}>{formatPrice(item.price)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

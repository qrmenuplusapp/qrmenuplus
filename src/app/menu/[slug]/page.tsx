"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Category = { id: string; name: string; emoji: string; is_visible: boolean; sort_order: number; image_url?: string };
type Item = { id: string; category_id: string; name: string; description: string; price: number; is_visible: boolean; image_url?: string };
type Restaurant = { id: string; name: string; description: string; address: string; phone: string; wifi_name: string; wifi_password: string };

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

  useEffect(() => { params.then(p => setSlug(p.slug)); }, []);
  useEffect(() => { if (slug) loadMenu(); }, [slug]);

  const loadMenu = async () => {
    try {
      const { data: clientData, error: ce } = await supabase.from('clients').select('id').eq('subdomain', slug).single();
      if (ce || !clientData) { setNotFound(true); setLoading(false); return; }
      const { data: restData, error: re } = await supabase.from('restaurants').select('*').eq('client_id', clientData.id).single();
      if (re || !restData) { setNotFound(true); setLoading(false); return; }
      setRestaurant(restData);
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

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#09090f", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "'Cairo',sans-serif" }}>
      <div style={{ width: 52, height: 52, border: "3px solid rgba(249,115,22,0.15)", borderTop: "3px solid #f97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color: "#4b5563", fontSize: "0.88rem" }}>جارٍ تحميل القائمة...</p>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "#09090f", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, fontFamily: "'Cairo',sans-serif", textAlign: "center", padding: 24 }}>
      <div style={{ fontSize: 72 }}>🍽</div>
      <h1 style={{ color: "#f1f5f9", fontSize: "1.4rem", fontWeight: 900, fontFamily: "'Tajawal',sans-serif" }}>لم يتم العثور على القائمة</h1>
      <p style={{ color: "#4b5563" }}>تأكد من صحة الرابط</p>
    </div>
  );

  const visibleItems = activeTab === "all" ? items : items.filter(i => i.category_id === activeTab);

  return (
    <div style={{ minHeight: "100vh", background: "#09090f", color: "#f1f5f9", fontFamily: "'Cairo','Tajawal',sans-serif", paddingBottom: 60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;700;800;900&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{display:none;}
        .hscroll{overflow-x:auto;scrollbar-width:none;}
        .icard{transition:transform 0.18s,box-shadow 0.18s;cursor:pointer;}
        .icard:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,0.4);}
        .cat-header{cursor:pointer;transition:background 0.2s;}
        .cat-header:hover{background:rgba(255,255,255,0.03);}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(50px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.35s ease forwards;}
        .slide-up{animation:slideUp 0.3s ease forwards;}
        .tab-btn{border:none;cursor:pointer;font-family:'Cairo',sans-serif;font-weight:700;font-size:0.8rem;transition:all 0.2s;white-space:nowrap;flex-shrink:0;}
      `}</style>

      {/* ===== HERO ===== */}
      <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(160deg,#0f0f1c 0%,#1c1005 100%)", paddingBottom: 28 }}>
        {/* Glow blobs */}
        <div style={{ position: "absolute", top: -100, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.13) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, padding: "48px 24px 0", textAlign: "center" }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 50, padding: "5px 16px", marginBottom: 20, fontSize: "0.72rem", fontWeight: 800, color: "#22c55e", letterSpacing: 0.5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            مفتوح الآن
          </div>

          {/* Restaurant Name */}
          <h1 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "clamp(2rem,6vw,3rem)", fontWeight: 900, marginBottom: 10, letterSpacing: -1, lineHeight: 1.1 }}>
            {restaurant?.name}
          </h1>

          {/* Description */}
          {restaurant?.description && (
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", maxWidth: 380, margin: "0 auto 20px", lineHeight: 1.75 }}>
              {restaurant.description}
            </p>
          )}

          {/* Contact Info */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
            {restaurant?.phone && (
              <a href={`tel:${restaurant.phone}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.22)", borderRadius: 50, padding: "8px 18px", color: "#fb923c", fontSize: "0.88rem", fontWeight: 800, textDecoration: "none", transition: "all 0.2s" }}>
                <span style={{ fontSize: 16 }}>📞</span>
                {restaurant.phone}
              </a>
            )}
            {restaurant?.address && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 50, padding: "8px 18px", color: "#94a3b8", fontSize: "0.88rem", fontWeight: 700 }}>
                <span style={{ fontSize: 16 }}>📍</span>
                {restaurant.address}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== WIFI ===== */}
      {restaurant?.wifi_name && (
        <div style={{ margin: "14px 16px 0", background: "linear-gradient(135deg,rgba(59,130,246,0.08),rgba(59,130,246,0.04))", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(59,130,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📶</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.68rem", color: "#60a5fa", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>WiFi المجاني</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 800 }}>{restaurant.wifi_name}</div>
            {restaurant.wifi_password && (
              <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: 2 }}>
                كلمة المرور: <span style={{ color: "#e2e8f0", fontWeight: 800, letterSpacing: 1 }}>{restaurant.wifi_password}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== STICKY TABS + VIEW TOGGLE ===== */}
      {categories.length > 0 && (
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(9,9,15,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {/* Tabs */}
            <div className="hscroll" style={{ display: "flex", gap: 6, padding: "10px 12px", flex: 1 }}>
              <button className="tab-btn" onClick={() => setActiveTab("all")} style={{ padding: "7px 16px", borderRadius: 50, background: activeTab === "all" ? "#f97316" : "rgba(255,255,255,0.06)", color: activeTab === "all" ? "#fff" : "#94a3b8" }}>
                الكل ({items.length})
              </button>
              {categories.map(cat => (
                <button key={cat.id} className="tab-btn" onClick={() => setActiveTab(cat.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 50, background: activeTab === cat.id ? "#f97316" : "rgba(255,255,255,0.06)", color: activeTab === cat.id ? "#fff" : "#94a3b8" }}>
                  {cat.image_url ? <img src={cat.image_url} alt="" style={{ width: 16, height: 16, borderRadius: "50%", objectFit: "cover" }} /> : <span style={{ fontSize: 14 }}>{cat.emoji}</span>}
                  {cat.name}
                </button>
              ))}
            </div>
            {/* View Toggle */}
            <div style={{ display: "flex", gap: 4, padding: "10px 12px 10px 0", flexShrink: 0 }}>
              <button onClick={() => setViewMode("list")} style={{ width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer", background: viewMode === "list" ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.05)", color: viewMode === "list" ? "#f97316" : "#4b5563", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>☰</button>
              <button onClick={() => setViewMode("grid")} style={{ width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer", background: viewMode === "grid" ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.05)", color: viewMode === "grid" ? "#f97316" : "#4b5563", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>⊞</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONTENT ===== */}
      <div style={{ padding: "16px 14px 0" }}>
        {activeTab === "all" ? (
          // عرض مجمّع حسب الأقسام مع طي
          categories.map(cat => {
            const catItems = items.filter(i => i.category_id === cat.id);
            if (catItems.length === 0) return null;
            const isCollapsed = collapsedCats.has(cat.id);
            return (
              <div key={cat.id} className="fade-up" style={{ marginBottom: 12, background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, overflow: "hidden" }}>
                {/* Category Header — قابل للطي */}
                <div className="cat-header" onClick={() => toggleCollapse(cat.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: isCollapsed ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
                  {cat.image_url
                    ? <img src={cat.image_url} alt={cat.name} style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
                    : <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{cat.emoji}</div>
                  }
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.02rem", fontWeight: 900 }}>{cat.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "#4b5563", fontWeight: 700, marginTop: 2 }}>{catItems.length} صنف</div>
                  </div>
                  {/* Arrow */}
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#4b5563", transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.25s" }}>
                    ▼
                  </div>
                </div>

                {/* Items */}
                {!isCollapsed && (
                  <div style={{ padding: "12px" }}>
                    {viewMode === "list"
                      ? <ListItems items={catItems} onSelect={setSelectedItem} formatPrice={formatPrice} />
                      : <GridItems items={catItems} onSelect={setSelectedItem} formatPrice={formatPrice} />
                    }
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // عرض قسم واحد
          <div className="fade-up">
            {viewMode === "list"
              ? <ListItems items={visibleItems} onSelect={setSelectedItem} formatPrice={formatPrice} />
              : <GridItems items={visibleItems} onSelect={setSelectedItem} formatPrice={formatPrice} />
            }
            {visibleItems.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#4b5563" }}>
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
          <div className="slide-up" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: "#13161e", borderRadius: "24px 24px 0 0", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", maxHeight: "90vh", overflowY: "auto" }}>
            {/* Handle */}
            <div style={{ width: 40, height: 4, borderRadius: 4, background: "#2a2f44", margin: "12px auto 0" }} />
            {selectedItem.image_url && (
              <img src={selectedItem.image_url} alt={selectedItem.name} style={{ width: "100%", height: 240, objectFit: "cover", marginTop: 12 }} />
            )}
            <div style={{ padding: "20px 22px 36px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                <h2 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.35rem", fontWeight: 900, flex: 1, lineHeight: 1.3 }}>{selectedItem.name}</h2>
                <div style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)", borderRadius: 12, padding: "6px 14px", fontSize: "1.05rem", fontWeight: 900, color: "#f97316", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {formatPrice(selectedItem.price)}
                </div>
              </div>
              {selectedItem.description && (
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.8, marginBottom: 24 }}>{selectedItem.description}</p>
              )}
              <button onClick={() => setSelectedItem(null)} style={{ width: "100%", background: "#1c1f2c", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 14, color: "#94a3b8", fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: "0.92rem", cursor: "pointer" }}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <div style={{ textAlign: "center", padding: "40px 20px 0", color: "#1e2235", fontSize: "0.72rem", fontWeight: 700 }}>
        مدعوم بـ <span style={{ color: "#f97316" }}>QRMenu</span>
      </div>
    </div>
  );
}

// ===== LIST VIEW =====
function ListItems({ items, onSelect, formatPrice }: { items: Item[]; onSelect: (i: Item) => void; formatPrice: (p: number) => string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(item => (
        <div key={item.id} className="icard" onClick={() => onSelect(item)} style={{ display: "flex", background: "#1c1f2c", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, overflow: "hidden" }}>
          {item.image_url
            ? <img src={item.image_url} alt={item.name} style={{ width: 88, height: 88, objectFit: "cover", flexShrink: 0 }} />
            : <div style={{ width: 88, height: 88, background: "#0f1117", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>🍽</div>
          }
          <div style={{ flex: 1, padding: "11px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.93rem", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
              {item.description && (
                <div style={{ fontSize: "0.74rem", color: "#4b5563", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>
                  {item.description}
                </div>
              )}
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: 900, color: "#f97316", marginTop: 6 }}>{formatPrice(item.price)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== GRID VIEW =====
function GridItems({ items, onSelect, formatPrice }: { items: Item[]; onSelect: (i: Item) => void; formatPrice: (p: number) => string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {items.map(item => (
        <div key={item.id} className="icard" onClick={() => onSelect(item)} style={{ background: "#1c1f2c", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, overflow: "hidden" }}>
          {item.image_url
            ? <img src={item.image_url} alt={item.name} style={{ width: "100%", height: 110, objectFit: "cover" }} />
            : <div style={{ width: "100%", height: 110, background: "#0f1117", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🍽</div>
          }
          <div style={{ padding: "10px 12px 12px" }}>
            <div style={{ fontWeight: 800, fontSize: "0.85rem", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
            {item.description && (
              <div style={{ fontSize: "0.7rem", color: "#4b5563", lineHeight: 1.4, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>
                {item.description}
              </div>
            )}
            <div style={{ fontSize: "0.88rem", fontWeight: 900, color: "#f97316" }}>{formatPrice(item.price)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

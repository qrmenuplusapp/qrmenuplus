"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Category = { id: string; name: string; emoji: string; is_visible: boolean; sort_order: number; image_url?: string };
type Item = { id: string; category_id: string; name: string; description: string; price: number; is_visible: boolean; image_url?: string };
type Restaurant = { id: string; name: string; description: string; address: string; phone: string; wifi_name: string; wifi_password: string };

export default function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>("");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    params.then((p) => {
      console.log('SLUG RECEIVED:', p.slug);
      setSlug(p.slug);
    });
  }, []);

  useEffect(() => { if (slug) loadMenu(); }, [slug]);

  const loadMenu = async () => {
    try {
      const { data: clientData, error: clientError } = await supabase
        .from('clients').select('id').eq('subdomain', slug).single();
      if (clientError || !clientData) { setNotFound(true); setLoading(false); return; }

      const { data: restData, error: restError } = await supabase
        .from('restaurants').select('*').eq('client_id', clientData.id).single();
      if (restError || !restData) { setNotFound(true); setLoading(false); return; }
      setRestaurant(restData);

      const { data: cats } = await supabase
        .from('categories').select('*').eq('restaurant_id', restData.id).eq('is_visible', true).order('sort_order');
      setCategories(cats || []);

      const catIds = (cats || []).map((c: any) => c.id);
      if (catIds.length > 0) {
        const { data: itms } = await supabase
          .from('items').select('*').in('category_id', catIds).eq('is_visible', true).order('sort_order');
        setItems(itms || []);
      }
    } catch (e) { setNotFound(true); }
    setLoading(false);
  };

  const filteredItems = activeCategory === "all" ? items : items.filter(i => i.category_id === activeCategory);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "'Cairo',sans-serif" }}>
      <div style={{ width: 48, height: 48, border: "3px solid rgba(249,115,22,0.2)", borderTop: "3px solid #f97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: "#4b5563", fontSize: "0.9rem" }}>جارٍ تحميل القائمة...</p>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, fontFamily: "'Cairo',sans-serif", textAlign: "center", padding: 24 }}>
      <div style={{ fontSize: 64 }}>🍽</div>
      <h1 style={{ color: "#f1f5f9", fontSize: "1.4rem", fontWeight: 900, fontFamily: "'Tajawal',sans-serif" }}>لم يتم العثور على القائمة</h1>
      <p style={{ color: "#4b5563", fontSize: "0.9rem" }}>تأكد من صحة الرابط</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#f1f5f9", fontFamily: "'Cairo','Tajawal',sans-serif", paddingBottom: 40 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        .cat-scroll { overflow-x: auto; scrollbar-width: none; }
        .item-card { transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .item-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes slideUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        .slide-up { animation: slideUp 0.3s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #0f0f1a 0%, #1a0f05 100%)", borderBottom: "1px solid rgba(249,115,22,0.12)" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -50, left: -50, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, padding: "52px 20px 32px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 50, padding: "4px 14px", marginBottom: 18, fontSize: "0.72rem", fontWeight: 700, color: "#22c55e" }}>
            ● مفتوح الآن
          </div>
          <h1 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "clamp(1.9rem, 5vw, 2.8rem)", fontWeight: 900, marginBottom: 10, letterSpacing: -0.5 }}>{restaurant?.name}</h1>
          {restaurant?.description && (
            <p style={{ color: "#94a3b8", fontSize: "0.88rem", maxWidth: 420, margin: "0 auto 18px", lineHeight: 1.7 }}>{restaurant.description}</p>
          )}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
            {restaurant?.phone && (
              <a href={`tel:${restaurant.phone}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: "0.82rem", textDecoration: "none" }}>📞 {restaurant.phone}</a>
            )}
            {restaurant?.address && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: "0.82rem" }}>📍 {restaurant.address}</span>
            )}
          </div>
        </div>
      </div>

      {/* WiFi */}
      {restaurant?.wifi_name && (
        <div style={{ margin: "14px 16px 0", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.13)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>📶</span>
          <div>
            <div style={{ fontSize: "0.7rem", color: "#60a5fa", fontWeight: 700, marginBottom: 2 }}>WiFi المجاني</div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{restaurant.wifi_name}</div>
            {restaurant.wifi_password && <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>كلمة المرور: <span style={{ color: "#f1f5f9", fontWeight: 700 }}>{restaurant.wifi_password}</span></div>}
          </div>
        </div>
      )}

      {/* Categories Tabs */}
      {categories.length > 0 && (
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,15,0.96)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "10px 0" }}>
          <div className="cat-scroll" style={{ display: "flex", gap: 8, padding: "0 16px" }}>
            <button onClick={() => setActiveCategory("all")} style={{ flexShrink: 0, padding: "7px 16px", borderRadius: 50, border: "none", cursor: "pointer", fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: "0.8rem", background: activeCategory === "all" ? "#f97316" : "rgba(255,255,255,0.06)", color: activeCategory === "all" ? "#fff" : "#94a3b8", transition: "all 0.2s" }}>
              الكل ({items.length})
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 50, border: "none", cursor: "pointer", fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: "0.8rem", background: activeCategory === cat.id ? "#f97316" : "rgba(255,255,255,0.06)", color: activeCategory === cat.id ? "#fff" : "#94a3b8", transition: "all 0.2s" }}>
                {cat.image_url ? <img src={cat.image_url} alt={cat.name} style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover" }} /> : <span>{cat.emoji}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "20px 16px 0" }}>
        {activeCategory === "all" ? (
          categories.map(cat => {
            const catItems = items.filter(i => i.category_id === cat.id);
            if (catItems.length === 0) return null;
            return (
              <div key={cat.id} className="fade-in" style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  {cat.image_url
                    ? <img src={cat.image_url} alt={cat.name} style={{ width: 34, height: 34, borderRadius: 10, objectFit: "cover" }} />
                    : <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{cat.emoji}</div>
                  }
                  <div>
                    <h2 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1rem", fontWeight: 900 }}>{cat.name}</h2>
                    <p style={{ fontSize: "0.7rem", color: "#4b5563" }}>{catItems.length} صنف</p>
                  </div>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)", marginRight: 8 }} />
                </div>
                <ItemsList items={catItems} onSelect={setSelectedItem} />
              </div>
            );
          })
        ) : (
          <div className="fade-in"><ItemsList items={filteredItems} onSelect={setSelectedItem} /></div>
        )}

        {filteredItems.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#4b5563" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍽</div>
            <p>لا توجد أصناف في هذا القسم</p>
          </div>
        )}
      </div>

      {/* Item Modal */}
      {selectedItem && (
        <div onClick={() => setSelectedItem(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div className="slide-up" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "#13161e", borderRadius: "20px 20px 0 0", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", maxHeight: "88vh", overflowY: "auto" }}>
            {selectedItem.image_url && <img src={selectedItem.image_url} alt={selectedItem.name} style={{ width: "100%", height: 230, objectFit: "cover" }} />}
            <div style={{ padding: "20px 20px 32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 12 }}>
                <h2 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.25rem", fontWeight: 900, flex: 1 }}>{selectedItem.name}</h2>
                <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#f97316", whiteSpace: "nowrap" }}>{selectedItem.price} ر.س</div>
              </div>
              {selectedItem.description && <p style={{ color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.75, marginBottom: 24 }}>{selectedItem.description}</p>}
              <button onClick={() => setSelectedItem(null)} style={{ width: "100%", background: "#1c1f2c", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 13, color: "#94a3b8", fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "32px 20px 0", color: "#2a2f44", fontSize: "0.72rem" }}>
        مدعوم بـ <span style={{ color: "#f97316", fontWeight: 700 }}>QRMenu</span>
      </div>
    </div>
  );
}

function ItemsList({ items, onSelect }: { items: Item[]; onSelect: (item: Item) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, idx) => (
        <div key={item.id} className="item-card" onClick={() => onSelect(item)} style={{ display: "flex", background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
          {item.image_url
            ? <img src={item.image_url} alt={item.name} style={{ width: 92, height: 92, objectFit: "cover", flexShrink: 0 }} />
            : <div style={{ width: 92, height: 92, background: "#1c1f2c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>🍽</div>
          }
          <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.93rem", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
              {item.description && (
                <div style={{ fontSize: "0.76rem", color: "#4b5563", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>
                  {item.description}
                </div>
              )}
            </div>
            <div style={{ marginTop: 8, fontSize: "1rem", fontWeight: 900, color: "#f97316" }}>{item.price} ر.س</div>
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";

type Category = { id: string; name: string; emoji: string; is_visible: boolean; sort_order: number; image_url?: string };
type Item = { id: string; category_id: string; name: string; description: string; price: number; is_visible: boolean; emoji: string; image_url?: string };
type Restaurant = { id: string; name: string; description: string; address: string; phone: string; wifi_name: string; wifi_password: string; whatsapp?: string; google_maps_url?: string; theme?: string };

const THEMES = {
  dark:    { name: "داكن",   icon: "🌙", accent: "#f97316", bg: "#09090f",  heroBg: "linear-gradient(160deg,#0f0f1c 0%,#1c1005 100%)", accentBorder: "rgba(249,115,22,0.22)" },
  light:   { name: "فاتح",   icon: "☀️", accent: "#e8610a", bg: "#f8f7f4",  heroBg: "linear-gradient(160deg,#fff8f3 0%,#fdecd9 100%)", accentBorder: "rgba(232,97,10,0.2)" },
  emerald: { name: "زمردي",  icon: "🌿", accent: "#10b981", bg: "#060f0a",  heroBg: "linear-gradient(160deg,#060f0a 0%,#052e16 100%)", accentBorder: "rgba(16,185,129,0.25)" },
  royal:   { name: "ملكي",   icon: "👑", accent: "#8b5cf6", bg: "#07050f",  heroBg: "linear-gradient(160deg,#07050f 0%,#1e1040 100%)", accentBorder: "rgba(139,92,246,0.25)" },
  rose:    { name: "وردي",   icon: "🌹", accent: "#f43f5e", bg: "#0f0508",  heroBg: "linear-gradient(160deg,#0f0508 0%,#3b0a15 100%)", accentBorder: "rgba(244,63,94,0.25)" },
  gold:    { name: "ذهبي",   icon: "✨", accent: "#eab308", bg: "#0a0800",  heroBg: "linear-gradient(160deg,#0a0800 0%,#1c1500 100%)", accentBorder: "rgba(234,179,8,0.25)" },
};
type ThemeKey = keyof typeof THEMES;



const S = {
  screen: { minHeight: "100vh", background: "#09090f", color: "#f1f5f9", fontFamily: "'Cairo','Tajawal',sans-serif", paddingBottom: 90 } as React.CSSProperties,
  header: { position: "fixed" as const, top: 0, right: 0, left: 0, zIndex: 100, height: 60, background: "rgba(9,9,15,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" },
  avatar: { width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, cursor: "pointer" },
  main: { paddingTop: 60 },
  bottomNav: { position: "fixed" as const, bottom: 0, right: 0, left: 0, zIndex: 100, height: 68, background: "rgba(14,16,23,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "6px 4px" },
  navItem: (active: boolean): React.CSSProperties => ({ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", borderRadius: 12, padding: 4 }),
  navIcon: (active: boolean): React.CSSProperties => ({ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, background: active ? "rgba(249,115,22,0.15)" : "transparent" }),
  navLabel: (active: boolean): React.CSSProperties => ({ fontSize: "0.65rem", fontWeight: 700, color: active ? "#f97316" : "#4b5563" }),
  card: { background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14 } as React.CSSProperties,
  sectionTitle: { fontSize: "0.75rem", fontWeight: 800, color: "#4b5563", textTransform: "uppercase" as const, letterSpacing: 1, padding: "18px 16px 8px" },
  pill: (color: string): React.CSSProperties => ({ display: "inline-flex", padding: "3px 9px", borderRadius: 50, fontSize: "0.68rem", fontWeight: 800, background: color === "green" ? "rgba(34,197,94,0.13)" : "rgba(255,255,255,0.06)", color: color === "green" ? "#22c55e" : "#4b5563", cursor: "pointer" }),
  btnAccent: { background: "#f97316", color: "#fff", border: "none", borderRadius: 10, padding: "11px 18px", fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } as React.CSSProperties,
  btnGhost: { background: "#1c1f2c", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 9, padding: "8px 14px", fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" } as React.CSSProperties,
  btnSm: { background: "#1c1f2c", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer", flexShrink: 0 } as React.CSSProperties,
  btnDanger: { background: "rgba(239,68,68,0.12)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer", flexShrink: 0 } as React.CSSProperties,
  overlay: { position: "fixed" as const, inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" },
  sheet: { width: "100%", maxWidth: 480, background: "#13161e", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", padding: "0 0 24px", maxHeight: "92vh", overflowY: "auto" as const, margin: 20 },
  sheetHandle: { width: 40, height: 4, borderRadius: 4, background: "#2a2f44", margin: "12px auto 14px" },
  sheetTitle: { fontFamily: "'Tajawal',sans-serif", fontSize: "1rem", fontWeight: 900, padding: "0 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  formGroup: { marginBottom: 14 } as React.CSSProperties,
  formLabel: { display: "block" as const, fontSize: "0.72rem", fontWeight: 800, color: "#4b5563", marginBottom: 6, textTransform: "uppercase" as const },
  formInput: { width: "100%", background: "#1c1f2c", border: "1.5px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "#f1f5f9", padding: "11px 13px", fontSize: "0.9rem", fontFamily: "'Cairo',sans-serif", outline: "none" } as React.CSSProperties,
  toast: (show: boolean): React.CSSProperties => ({ position: "fixed", bottom: 82, right: 16, left: 16, maxWidth: 448, margin: "0 auto", background: "#2a2f44", border: "1px solid rgba(249,115,22,0.22)", borderRadius: 13, padding: "12px 16px", zIndex: 300, opacity: show ? 1 : 0, transition: "all 0.3s", pointerEvents: "none" as const, fontSize: "0.88rem", fontWeight: 700 }),
  fab: { position: "fixed" as const, bottom: 82, left: 16, width: 50, height: 50, borderRadius: 14, background: "#f97316", border: "none", cursor: "pointer", fontSize: 22, color: "#fff", boxShadow: "0 6px 20px rgba(249,115,22,0.4)", zIndex: 90 },
  imagePreview: { width: 80, height: 80, borderRadius: 10, objectFit: "cover" as const, border: "2px solid rgba(255,255,255,0.06)" },
  uploadBox: { width: "100%", minHeight: 100, border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 10, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", background: "#1c1f2c", padding: 16 },
};

async function dashboardApi(action: string, data: object = {}) {
  const res = await fetch('/api/dashboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...data }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json;
}

function DashboardContent() {
  const router = useRouter();
  const [tab, setTab] = useState<"home" | "categories" | "items" | "info">("home");
  const [user, setUser] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("all");
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [modal, setModal] = useState<null | "addCat" | "editCat" | "addItem" | "editItem" | "qr" | "share" | "logout">(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [catName, setCatName] = useState(""); const [catEmoji, setCatEmoji] = useState("🍽"); const [catImage, setCatImage] = useState<File | null>(null); const [catImagePreview, setCatImagePreview] = useState("");
  const [itemName, setItemName] = useState(""); const [itemDesc, setItemDesc] = useState(""); const [itemPrice, setItemPrice] = useState(""); const [itemCatId, setItemCatId] = useState(""); const [itemImage, setItemImage] = useState<File | null>(null); const [itemImagePreview, setItemImagePreview] = useState("");
  const [restName, setRestName] = useState(""); const [restDesc, setRestDesc] = useState(""); const [restPhone, setRestPhone] = useState(""); const [restAddress, setRestAddress] = useState(""); const [wifiName, setWifiName] = useState(""); const [wifiPass, setWifiPass] = useState("");
  const [restWhatsapp, setRestWhatsapp] = useState("");
  const [restGoogleMaps, setRestGoogleMaps] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("dark");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [menuUrl, setMenuUrl] = useState("");
  const catImageInput = useRef<HTMLInputElement>(null);
  const itemImageInput = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast({ show: true, msg }); setTimeout(() => setToast({ show: false, msg: "" }), 2600); };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      const clientId = parsed.clients?.id || parsed.client_id;
      if (clientId) loadData(clientId);
      else showToast("❌ خطأ في البيانات");
    }
  }, []);

  const loadData = async (clientId: string) => {
    setLoading(true);
    try {
      const { data: restData, error: restError } = await supabase.from('restaurants').select('*').eq('client_id', clientId).single();
      if (restError) throw restError;

      if (restData) {
        setRestaurant(restData);
        setRestName(restData.name || "");
        setRestDesc(restData.description || "");
        setRestPhone(restData.phone || "");
        setRestAddress(restData.address || "");
        setWifiName(restData.wifi_name || "");
        setWifiPass(restData.wifi_password || "");
        setRestWhatsapp(restData.whatsapp || "");
        setRestGoogleMaps(restData.google_maps_url || "");
        if (restData.theme && THEMES[restData.theme as ThemeKey]) {
          setSelectedTheme(restData.theme as ThemeKey);
        }

        const { data: clientData } = await supabase.from('clients').select('subdomain').eq('id', clientId).single();
        const url = `https://${clientData?.subdomain || 'menu'}.qrmenu.it.com`;
        setMenuUrl(url);

        const { data: cats } = await supabase.from('categories').select('*').eq('restaurant_id', restData.id).order('sort_order');
        setCategories(cats || []);

        const catIds = (cats || []).map((c: any) => c.id);
        if (catIds.length > 0) {
          const { data: itms } = await supabase.from('items').select('*').in('category_id', catIds).order('sort_order');
          setItems(itms || []);
        } else {
          setItems([]);
        }
      }
    } catch (e: any) {
      console.error("Load error:", e);
      showToast(`❌ خطأ: ${e.message}`);
    }
    setLoading(false);
  };

  const logout = () => { localStorage.removeItem("user"); router.push("/login"); };

  const shareMenu = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: restName, text: `قائمة ${restName}`, url: menuUrl }); }
      catch (e) { copyMenuUrl(); }
    } else { copyMenuUrl(); }
  };

  const copyMenuUrl = () => { navigator.clipboard.writeText(menuUrl); showToast("✅ تم نسخ الرابط!"); };

  const generateQR = async () => {
    try {
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(menuUrl, { width: 512, margin: 2, color: { dark: "#1a1a2e", light: "#ffffff" } });
      setQrDataUrl(dataUrl);
      setModal("qr");
    } catch (e) { showToast("❌ خطأ في QR"); }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `${restName}-qr.png`;
    link.href = qrDataUrl;
    link.click();
    showToast("✅ تم التحميل!");
  };

  const openAddCat = () => { setCatName(""); setCatEmoji("🍽"); setCatImage(null); setCatImagePreview(""); setEditingCat(null); setModal("addCat"); };
  const openEditCat = (c: Category) => { setEditingCat(c); setCatName(c.name); setCatEmoji(c.emoji); setCatImagePreview(c.image_url || ""); setModal("editCat"); };

  const handleCatImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCatImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setCatImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, bucket: string): Promise<string> => {
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const result = await dashboardApi('uploadImage', { base64, fileName, bucket });
    return result.publicUrl;
  };

  const saveCat = async () => {
    if (!catName.trim()) return showToast("⚠️ أدخل اسم القسم");
    if (!restaurant) return showToast("❌ خطأ: بيانات المطعم غير موجودة");
    try {
      let imageUrl = editingCat?.image_url || "";
      if (catImage) {
        imageUrl = await uploadImage(catImage, 'categories');
      } else if (catImagePreview && !catImagePreview.startsWith('http')) {
        imageUrl = editingCat?.image_url || "";
      } else if (catImagePreview.startsWith('http')) {
        imageUrl = catImagePreview;
      }

      if (editingCat) {
        await dashboardApi('updateCategory', { id: editingCat.id, payload: { name: catName, emoji: catEmoji, image_url: imageUrl } });
        showToast("✅ تم التعديل!");
      } else {
        await dashboardApi('insertCategory', { payload: { restaurant_id: restaurant.id, name: catName, emoji: catEmoji, image_url: imageUrl, sort_order: categories.length, is_visible: true } });
        showToast("✅ تم الإضافة!");
      }

      const clientId = user.clients?.id || user.client_id;
      await loadData(clientId);
      setModal(null);
    } catch (e: any) { console.error(e); showToast(`❌ ${e.message}`); }
  };

  const deleteCat = async (id: string) => {
    try {
      await dashboardApi('deleteCategory', { id });
      showToast("🗑 تم الحذف");
      const clientId = user.clients?.id || user.client_id;
      loadData(clientId);
    } catch { showToast("❌ خطأ"); }
  };

  const toggleCatVis = async (id: string, vis: boolean) => {
    try {
      await dashboardApi('updateCategory', { id, payload: { is_visible: !vis } });
      const clientId = user.clients?.id || user.client_id;
      loadData(clientId);
    } catch { showToast("❌ خطأ"); }
  };

  const openAddItem = () => { setItemName(""); setItemDesc(""); setItemPrice(""); setItemCatId(categories[0]?.id || ""); setItemImage(null); setItemImagePreview(""); setEditingItem(null); setModal("addItem"); };
  const openEditItem = (i: Item) => { setEditingItem(i); setItemName(i.name); setItemDesc(i.description); setItemPrice(i.price.toString()); setItemCatId(i.category_id); setItemImagePreview(i.image_url || ""); setModal("editItem"); };

  const handleItemImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setItemImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setItemImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveItem = async () => {
    if (!itemName.trim() || !itemPrice) return showToast("⚠️ أدخل البيانات");
    try {
      let imageUrl = editingItem?.image_url || "";
      if (itemImage) {
        imageUrl = await uploadImage(itemImage, 'items');
      } else if (itemImagePreview.startsWith('http')) {
        imageUrl = itemImagePreview;
      }

      if (editingItem) {
        await dashboardApi('updateItem', { id: editingItem.id, payload: { name: itemName, description: itemDesc, price: parseFloat(itemPrice), category_id: itemCatId, image_url: imageUrl } });
        showToast("✅ تم التعديل!");
      } else {
        await dashboardApi('insertItem', { payload: { category_id: itemCatId, name: itemName, description: itemDesc, price: parseFloat(itemPrice), image_url: imageUrl, is_visible: true, sort_order: items.length } });
        showToast("✅ تم الإضافة!");
      }

      const clientId = user.clients?.id || user.client_id;
      await loadData(clientId);
      setModal(null);
    } catch (e: any) { console.error(e); showToast(`❌ ${e.message}`); }
  };

  const deleteItem = async (id: string) => {
    try {
      await dashboardApi('deleteItem', { id });
      showToast("🗑 تم الحذف");
      const clientId = user.clients?.id || user.client_id;
      loadData(clientId);
    } catch { showToast("❌ خطأ"); }
  };

  const toggleItemVis = async (id: string, vis: boolean) => {
    try {
      await dashboardApi('updateItem', { id, payload: { is_visible: !vis } });
      showToast("👁 تم التغيير");
      const clientId = user.clients?.id || user.client_id;
      loadData(clientId);
    } catch { showToast("❌ خطأ"); }
  };

  const saveRestInfo = async () => {
    if (!restaurant) return;
    try {
      await dashboardApi('updateRestaurant', {
        id: restaurant.id,
        payload: {
          name: restName,
          description: restDesc,
          phone: restPhone,
          address: restAddress,
          wifi_name: wifiName,
          wifi_password: wifiPass,
          whatsapp: restWhatsapp,
          google_maps_url: restGoogleMaps,
          theme: selectedTheme,
        }
      });
      showToast("💾 تم الحفظ!");
      const clientId = user.clients?.id || user.client_id;
      loadData(clientId);
    } catch { showToast("❌ خطأ"); }
  };

  const filteredItems = filterCat === "all" ? items : items.filter(i => i.category_id === filterCat);

  if (loading) return <div style={{ minHeight: "100vh", background: "#09090f", display: "flex", alignItems: "center", justifyContent: "center", color: "#f1f5f9" }}><div style={{ textAlign: "center" }}><div style={{ fontSize: 48 }}>⏳</div><div style={{ fontSize: "1.2rem", fontWeight: 700 }}>جارٍ التحميل...</div></div></div>;

  return (
    <div style={S.screen}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&family=Tajawal:wght@400;700;900&display=swap');*{box-sizing:border-box;}`}</style>

      <header style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/qr_menu_logo.svg" alt="QRMenu" style={{ height: 28, width: 140, objectFit: "contain" }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={S.btnSm} onClick={generateQR}>📱</div>
          <div style={S.btnSm} onClick={() => setModal("share")}>🔗</div>
          <div style={S.avatar} onClick={() => setModal("logout")}>{user?.username?.[0]?.toUpperCase() || "م"}</div>
        </div>
      </header>

      <main style={S.main}>
        {tab === "home" && (
          <div>
            <div style={{ margin: 16, borderRadius: 18, background: "linear-gradient(135deg,rgba(249,115,22,0.16),rgba(249,115,22,0.05))", border: "1px solid rgba(249,115,22,0.2)", padding: 20 }}>
              <div style={{ fontSize: "0.72rem", color: "#fb923c", fontWeight: 700 }}>لوحة التحكم</div>
              <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.35rem", fontWeight: 900, marginBottom: 10 }}>{restName || "مطعمك"} 🍕</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}><span style={S.pill("green")}>● نشط</span></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...S.btnAccent, fontSize: "0.8rem", padding: "8px 14px", justifyContent: "center" }} onClick={() => setModal("share")}>🔗 مشاركة</button>
                <button style={{ ...S.btnGhost, fontSize: "0.8rem", padding: "8px 14px", justifyContent: "center" }} onClick={generateQR}>📱 QR Code</button>
              </div>
            </div>
            <div style={S.sectionTitle}>إحصائيات</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "0 16px" }}>
              {[{ icon: "📂", num: categories.length, label: "أقسام" }, { icon: "🍽", num: items.length, label: "أصناف" }].map((s, i) => (
                <div key={i} style={{ ...S.card, padding: 16 }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.6rem", fontWeight: 900, color: "#f97316" }}>{s.num}</div>
                  <div style={{ fontSize: "0.72rem", color: "#4b5563", fontWeight: 700 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* ===== THEME PICKER في الداشبورد ===== */}
            <div style={S.sectionTitle}>ثيم القائمة</div>
            <div style={{ margin: "0 16px", background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
                {(Object.keys(THEMES) as ThemeKey[]).map(key => {
                  const t = THEMES[key];
                  const isActive = selectedTheme === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedTheme(key)}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 8px", borderRadius: 14, border: `2px solid ${isActive ? t.accent : "rgba(255,255,255,0.06)"}`, background: isActive ? `${t.accent}18` : "#1c1f2c", cursor: "pointer", transition: "all 0.2s" }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: t.heroBg, border: `2px solid ${t.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{t.icon}</div>
                      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: isActive ? t.accent : "#94a3b8" }}>{t.name}</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#4b5563", textAlign: "center" }}>
                سيتم تطبيق الثيم على القائمة عند الحفظ من تبويب <strong style={{ color: "#94a3b8" }}>المطعم</strong>
              </div>
            </div>
          </div>
        )}

        {tab === "categories" && (
          <div>
            <div style={S.sectionTitle}>الأقسام</div>
            {categories.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "#4b5563" }}>اضغط + لإضافة قسم</div> : (
              <div style={{ ...S.card, margin: "0 16px" }}>
                {categories.map((c, i) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderBottom: i < categories.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    {c.image_url ? <img src={c.image_url} alt={c.name} style={{ width: 42, height: 42, borderRadius: 12, objectFit: "cover" }} /> : <div style={{ width: 42, height: 42, borderRadius: 12, background: "#1c1f2c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{c.emoji}</div>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#4b5563" }}>{items.filter(i => i.category_id === c.id).length} أصناف</div>
                    </div>
                    <span style={S.pill(c.is_visible ? "green" : "gray")} onClick={() => toggleCatVis(c.id, c.is_visible)}>{c.is_visible ? "نشط" : "مخفي"}</span>
                    <div style={S.btnSm} onClick={() => openEditCat(c)}>✏️</div>
                    <div style={S.btnDanger} onClick={() => deleteCat(c.id)}>🗑</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "items" && (
          <div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 16px", scrollbarWidth: "none" }}>
              {["all", ...categories.map(c => c.id)].map(cid => {
                const c = categories.find(x => x.id === cid);
                const lbl = cid === "all" ? "الكل" : c?.name || "";
                return <div key={cid} onClick={() => setFilterCat(cid)} style={{ padding: "7px 14px", borderRadius: 50, background: filterCat === cid ? "rgba(249,115,22,0.13)" : "#1c1f2c", border: `1px solid ${filterCat === cid ? "rgba(249,115,22,0.25)" : "rgba(255,255,255,0.06)"}`, fontSize: "0.78rem", fontWeight: 700, color: filterCat === cid ? "#fb923c" : "#94a3b8", whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0 }}>{lbl}</div>;
              })}
            </div>
            <div style={{ padding: "0 16px" }}>
              {filteredItems.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "#4b5563" }}>اضغط + لإضافة صنف</div> : filteredItems.map(it => (
                <div key={it.id} style={{ ...S.card, marginBottom: 10, opacity: it.is_visible ? 1 : 0.5 }}>
                  <div style={{ display: "flex" }}>
                    {it.image_url ? <img src={it.image_url} alt={it.name} style={{ width: 82, height: 82, objectFit: "cover", borderRadius: "14px 0 0 14px" }} /> : <div style={{ width: 82, background: "#1c1f2c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, borderRadius: "14px 0 0 14px" }}>🍽</div>}
                    <div style={{ flex: 1, padding: 12 }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 800, marginBottom: 4 }}>{it.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#4b5563", marginBottom: 8, lineHeight: 1.4 }}>{it.description}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: "1rem", fontWeight: 900, color: "#f97316" }}>{it.price} ر.س</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <div style={S.btnSm} onClick={() => toggleItemVis(it.id, it.is_visible)}>{it.is_visible ? "👁" : "🙈"}</div>
                          <div style={S.btnSm} onClick={() => openEditItem(it)}>✏️</div>
                          <div style={S.btnDanger} onClick={() => deleteItem(it.id)}>🗑</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "info" && (
          <div style={{ padding: "16px 16px 0" }}>
            {/* حقول المعلومات الأساسية */}
            {[
              { l: "اسم المطعم", v: restName, s: setRestName, placeholder: "اسم مطعمك" },
              { l: "وصف", v: restDesc, s: setRestDesc, placeholder: "وصف قصير عن مطعمك" },
              { l: "هاتف", v: restPhone, s: setRestPhone, placeholder: "+963xxxxxxxxx" },
              { l: "عنوان", v: restAddress, s: setRestAddress, placeholder: "عنوان المطعم" },
              { l: "Wi-Fi", v: wifiName, s: setWifiName, placeholder: "اسم شبكة الواي فاي" },
              { l: "كلمة Wi-Fi", v: wifiPass, s: setWifiPass, placeholder: "كلمة مرور الواي فاي" },
            ].map((f, i) => (
              <div key={i} style={S.formGroup}>
                <label style={S.formLabel}>{f.l}</label>
                <input style={S.formInput} value={f.v} onChange={e => f.s(e.target.value)} placeholder={f.placeholder} />
              </div>
            ))}

            {/* واتساب */}
            <div style={S.formGroup}>
              <label style={S.formLabel}>واتساب</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366" style={{ verticalAlign: "middle" }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </span>
                <input style={{ ...S.formInput, paddingRight: 40 }} value={restWhatsapp} onChange={e => setRestWhatsapp(e.target.value)} placeholder="9631234567890 (بدون +)" dir="ltr" />
              </div>
              <div style={{ fontSize: "0.68rem", color: "#4b5563", marginTop: 4 }}>أدخل رقم الهاتف مع رمز البلد بدون + (مثال: 963912345678)</div>
            </div>

            {/* رابط خرائط غوغل */}
            <div style={S.formGroup}>
              <label style={S.formLabel}>رابط الموقع على غوغل ماب</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle" }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#4285f4"/></svg>
                </span>
                <input style={{ ...S.formInput, paddingRight: 40 }} value={restGoogleMaps} onChange={e => setRestGoogleMaps(e.target.value)} placeholder="https://maps.google.com/..." dir="ltr" />
              </div>
              <div style={{ fontSize: "0.68rem", color: "#4b5563", marginTop: 4 }}>الصق رابط خرائط غوغل الخاص بموقع مطعمك</div>
            </div>

            {/* اختيار الثيم */}
            <div style={{ marginBottom: 14 }}>
              <label style={S.formLabel}>ثيم القائمة 🎨</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {(Object.keys(THEMES) as ThemeKey[]).map(key => {
                  const t = THEMES[key];
                  const isActive = selectedTheme === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedTheme(key)}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 8px", borderRadius: 14, border: `2px solid ${isActive ? t.accent : "rgba(255,255,255,0.06)"}`, background: isActive ? `${t.accent}18` : "#1c1f2c", cursor: "pointer", transition: "all 0.2s" }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: t.heroBg, border: `2px solid ${t.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{t.icon}</div>
                      <span style={{ fontSize: "0.7rem", fontWeight: 800, color: isActive ? t.accent : "#94a3b8" }}>{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button style={{ ...S.btnAccent, width: "100%", borderRadius: 12, padding: 13, marginBottom: 20, justifyContent: "center" }} onClick={saveRestInfo}>💾 حفظ</button>
          </div>
        )}
      </main>

      <nav style={S.bottomNav}>
        {[{ id: "home" as const, icon: "🏠", label: "الرئيسية" }, { id: "categories" as const, icon: "📂", label: "الأقسام" }, { id: "items" as const, icon: "🍽", label: "الأصناف" }, { id: "info" as const, icon: "🏪", label: "المطعم" }].map(n => (
          <div key={n.id} style={S.navItem(tab === n.id)} onClick={() => setTab(n.id)}>
            <div style={S.navIcon(tab === n.id)}>{n.icon}</div>
            <div style={S.navLabel(tab === n.id)}>{n.label}</div>
          </div>
        ))}
      </nav>

      {(tab === "categories" || tab === "items") && <button style={S.fab} onClick={tab === "categories" ? openAddCat : openAddItem}>＋</button>}

      {(modal === "addCat" || modal === "editCat") && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={S.sheet} onClick={e => e.stopPropagation()}>
            <div style={S.sheetHandle} />
            <div style={S.sheetTitle}>{modal === "addCat" ? "➕ إضافة قسم" : "✏️ تعديل"}</div>
            <div style={{ padding: 16 }}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>صورة (اختياري)</label>
                <input ref={catImageInput} type="file" accept="image/*" onChange={handleCatImageChange} style={{ display: "none" }} />
                <div style={S.uploadBox} onClick={() => catImageInput.current?.click()}>
                  {catImagePreview ? <img src={catImagePreview} alt="preview" style={S.imagePreview} /> : <><span style={{ fontSize: 32 }}>📸</span><span style={{ fontSize: "0.8rem", color: "#4b5563" }}>اضغط لرفع صورة</span></>}
                </div>
              </div>
              <div style={S.formGroup}><label style={S.formLabel}>الاسم</label><input style={S.formInput} value={catName} onChange={e => setCatName(e.target.value)} /></div>
              <div style={S.formGroup}><label style={S.formLabel}>الأيقونة</label><input style={{ ...S.formInput, fontSize: "1.4rem", textAlign: "center" }} maxLength={4} value={catEmoji} onChange={e => setCatEmoji(e.target.value)} /></div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>{["🥗","🍖","🍕","🥤","🍰","☕","🍣","🥩"].map(e => <span key={e} style={{ fontSize: 22, cursor: "pointer" }} onClick={() => setCatEmoji(e)}>{e}</span>)}</div>
              <button style={{ ...S.btnAccent, width: "100%", borderRadius: 12, padding: 13, justifyContent: "center" }} onClick={saveCat}>حفظ</button>
              <button style={{ ...S.btnGhost, width: "100%", borderRadius: 12, padding: 12, marginTop: 8, justifyContent: "center" }} onClick={() => setModal(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {(modal === "addItem" || modal === "editItem") && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={S.sheet} onClick={e => e.stopPropagation()}>
            <div style={S.sheetHandle} />
            <div style={S.sheetTitle}>{modal === "addItem" ? "➕ إضافة صنف" : "✏️ تعديل"}</div>
            <div style={{ padding: 16 }}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>صورة (اختياري)</label>
                <input ref={itemImageInput} type="file" accept="image/*" onChange={handleItemImageChange} style={{ display: "none" }} />
                <div style={S.uploadBox} onClick={() => itemImageInput.current?.click()}>
                  {itemImagePreview ? <img src={itemImagePreview} alt="preview" style={S.imagePreview} /> : <><span style={{ fontSize: 32 }}>📸</span><span style={{ fontSize: "0.8rem", color: "#4b5563" }}>اضغط لرفع صورة</span></>}
                </div>
              </div>
              <div style={S.formGroup}><label style={S.formLabel}>الاسم</label><input style={S.formInput} value={itemName} onChange={e => setItemName(e.target.value)} /></div>
              <div style={S.formGroup}><label style={S.formLabel}>الوصف</label><input style={S.formInput} value={itemDesc} onChange={e => setItemDesc(e.target.value)} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={S.formGroup}><label style={S.formLabel}>السعر</label><input style={S.formInput} type="number" value={itemPrice} onChange={e => setItemPrice(e.target.value)} /></div>
                <div style={S.formGroup}><label style={S.formLabel}>القسم</label><select style={S.formInput} value={itemCatId} onChange={e => setItemCatId(e.target.value)}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              </div>
              <button style={{ ...S.btnAccent, width: "100%", borderRadius: 12, padding: 13, justifyContent: "center" }} onClick={saveItem}>حفظ</button>
              <button style={{ ...S.btnGhost, width: "100%", borderRadius: 12, padding: 12, marginTop: 8, justifyContent: "center" }} onClick={() => setModal(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {modal === "qr" && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={S.sheet} onClick={e => e.stopPropagation()}>
            <div style={S.sheetHandle} />
            <div style={S.sheetTitle}>📱 QR Code</div>
            <div style={{ padding: 20, textAlign: "center" }}>
              <img src={qrDataUrl} alt="QR Code" style={{ width: "100%", maxWidth: 300, borderRadius: 16, margin: "0 auto 16px" }} />
              <div style={{ fontSize: "0.85rem", color: "#4b5563", marginBottom: 16, direction: "ltr" }}>{menuUrl}</div>
              <button style={{ ...S.btnAccent, width: "100%", borderRadius: 12, padding: 13, justifyContent: "center" }} onClick={downloadQR}>⬇️ تحميل</button>
              <button style={{ ...S.btnGhost, width: "100%", borderRadius: 12, padding: 12, marginTop: 8, justifyContent: "center" }} onClick={() => setModal(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {modal === "share" && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={S.sheet} onClick={e => e.stopPropagation()}>
            <div style={S.sheetHandle} />
            <div style={S.sheetTitle}>🔗 مشاركة القائمة</div>
            <div style={{ padding: 20 }}>
              <div style={{ background: "#1c1f2c", borderRadius: 12, padding: 16, marginBottom: 16, direction: "ltr", wordBreak: "break-all", fontSize: "0.9rem", color: "#f97316" }}>{menuUrl}</div>
              <button style={{ ...S.btnAccent, width: "100%", borderRadius: 12, padding: 13, justifyContent: "center", marginBottom: 8 }} onClick={copyMenuUrl}>📋 نسخ الرابط</button>
              <button style={{ ...S.btnGhost, width: "100%", borderRadius: 12, padding: 13, justifyContent: "center" }} onClick={shareMenu}>📤 مشاركة</button>
            </div>
          </div>
        </div>
      )}

      {modal === "logout" && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={S.sheet} onClick={e => e.stopPropagation()}>
            <div style={S.sheetHandle} />
            <div style={S.sheetTitle}>👋 تسجيل الخروج</div>
            <div style={{ padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: 20 }}>هل أنت متأكد؟</div>
              <button style={{ ...S.btnDanger, width: "100%", borderRadius: 12, padding: 13, justifyContent: "center", marginBottom: 8, color: "#fff", fontSize: "0.88rem", fontWeight: 700 }} onClick={logout}>🚪 خروج</button>
              <button style={{ ...S.btnGhost, width: "100%", borderRadius: 12, padding: 12, justifyContent: "center" }} onClick={() => setModal(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div style={S.toast(toast.show)}>{toast.msg}</div>
    </div>
  );
}

export default function Dashboard() {
  return <ProtectedRoute><DashboardContent /></ProtectedRoute>;
}

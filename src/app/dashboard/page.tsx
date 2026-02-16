"use client";
import { useState } from "react";

// ── TYPES ──
type Category = { id: string; name: string; emoji: string; is_visible: boolean; count: number };
type Item = { id: string; category: string; name: string; desc: string; price: number; is_visible: boolean; emoji: string };

// ── INITIAL DATA ──
const initCategories: Category[] = [
  { id: "1", name: "المقبلات", emoji: "🥗", is_visible: true, count: 3 },
  { id: "2", name: "الأطباق الرئيسية", emoji: "🍖", is_visible: true, count: 4 },
  { id: "3", name: "البيتزا", emoji: "🍕", is_visible: true, count: 3 },
  { id: "4", name: "المشروبات", emoji: "🥤", is_visible: false, count: 2 },
  { id: "5", name: "الحلويات", emoji: "🍰", is_visible: true, count: 2 },
];
const initItems: Item[] = [
  { id: "1", category: "المقبلات", name: "سلطة فتوش طازجة", desc: "خضار طازجة وخبز محمص وصلصة الليمون", price: 18, is_visible: true, emoji: "🥗" },
  { id: "2", category: "المقبلات", name: "فلافل مقلي", desc: "حبوب الفول مع البهارات والطحينة", price: 15, is_visible: true, emoji: "🧆" },
  { id: "3", category: "البيتزا", name: "بيتزا مارغريتا", desc: "صلصة الطماطم وموزاريلا وريحان طازج", price: 32, is_visible: false, emoji: "🍕" },
  { id: "4", category: "الأطباق الرئيسية", name: "مشاوي مشكلة", desc: "دجاج وكباب ولحم مع الخبز والسلطة", price: 75, is_visible: true, emoji: "🍖" },
  { id: "5", category: "المشروبات", name: "عصير برتقال طازج", desc: "برتقال معصور طازج بدون إضافات", price: 12, is_visible: true, emoji: "🥤" },
  { id: "6", category: "الحلويات", name: "تشيز كيك بالتوت", desc: "كيك جبن كريمي مع صلصة التوت البري", price: 28, is_visible: true, emoji: "🍰" },
];

// ── STYLES ──
const S = {
  screen: { minHeight: "100vh", background: "#09090f", color: "#f1f5f9", fontFamily: "'Cairo','Tajawal',sans-serif", paddingBottom: 90 } as React.CSSProperties,
  header: { position: "fixed" as const, top: 0, right: 0, left: 0, zIndex: 100, height: 60, background: "rgba(9,9,15,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" },
  logoBox: { width: 30, height: 30, borderRadius: 8, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  logoText: { fontFamily: "'Tajawal',sans-serif", fontSize: "1.05rem", fontWeight: 900 },
  headerBtn: { width: 36, height: 36, borderRadius: 10, background: "#1c1f2c", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer" },
  avatar: { width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, cursor: "pointer" },
  main: { paddingTop: 60 },
  bottomNav: { position: "fixed" as const, bottom: 0, right: 0, left: 0, zIndex: 100, height: 68, background: "rgba(14,16,23,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "6px 4px" },
  navItem: (active: boolean): React.CSSProperties => ({ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", borderRadius: 12, padding: 4 }),
  navIcon: (active: boolean): React.CSSProperties => ({ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, background: active ? "rgba(249,115,22,0.15)" : "transparent" }),
  navLabel: (active: boolean): React.CSSProperties => ({ fontSize: "0.65rem", fontWeight: 700, color: active ? "#f97316" : "#4b5563" }),
  card: { background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14 } as React.CSSProperties,
  sectionTitle: { fontSize: "0.75rem", fontWeight: 800, color: "#4b5563", textTransform: "uppercase" as const, letterSpacing: 1, padding: "18px 16px 8px" },
  pill: (color: string): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 50, fontSize: "0.68rem", fontWeight: 800, background: color === "green" ? "rgba(34,197,94,0.13)" : color === "gray" ? "rgba(255,255,255,0.06)" : "rgba(249,115,22,0.13)", color: color === "green" ? "#22c55e" : color === "gray" ? "#4b5563" : "#fb923c" }),
  btnAccent: { background: "#f97316", color: "#fff", border: "none", borderRadius: 10, padding: "11px 18px", fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } as React.CSSProperties,
  btnGhost: { background: "#1c1f2c", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 9, padding: "8px 14px", fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" } as React.CSSProperties,
  btnSm: { background: "#1c1f2c", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer" } as React.CSSProperties,
  btnDanger: { background: "rgba(239,68,68,0.12)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer" } as React.CSSProperties,
  overlay: { position: "fixed" as const, inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center" },
  sheet: { width: "100%", maxWidth: 480, background: "#13161e", borderRadius: "22px 22px 0 0", border: "1px solid rgba(255,255,255,0.06)", padding: "0 0 24px", maxHeight: "92vh", overflowY: "auto" as const },
  sheetHandle: { width: 40, height: 4, borderRadius: 4, background: "#2a2f44", margin: "12px auto 14px" },
  sheetTitle: { fontFamily: "'Tajawal',sans-serif", fontSize: "1rem", fontWeight: 900, padding: "0 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  formGroup: { marginBottom: 14 } as React.CSSProperties,
  formLabel: { display: "block" as const, fontSize: "0.72rem", fontWeight: 800, color: "#4b5563", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  formInput: { width: "100%", background: "#1c1f2c", border: "1.5px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "#f1f5f9", padding: "11px 13px", fontSize: "0.9rem", fontFamily: "'Cairo',sans-serif", outline: "none" } as React.CSSProperties,
  toast: (show: boolean): React.CSSProperties => ({ position: "fixed", bottom: show ? 82 : 66, right: 16, left: 16, maxWidth: 448, margin: "0 auto", background: "#2a2f44", border: "1px solid rgba(249,115,22,0.22)", borderRadius: 13, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, zIndex: 300, opacity: show ? 1 : 0, transition: "all 0.3s", pointerEvents: "none" as const }),
  fab: { position: "fixed" as const, bottom: 82, left: 16, width: 50, height: 50, borderRadius: 14, background: "#f97316", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", boxShadow: "0 6px 20px rgba(249,115,22,0.4)", zIndex: 90 },
};

export default function Dashboard() {
  const [tab, setTab] = useState<"home" | "categories" | "items" | "info">("home");
  const [categories, setCategories] = useState<Category[]>(initCategories);
  const [items, setItems] = useState<Item[]>(initItems);
  const [filterCat, setFilterCat] = useState("الكل");
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [modal, setModal] = useState<null | "addCat" | "editCat" | "addItem" | "editItem">(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [catName, setCatName] = useState(""); const [catEmoji, setCatEmoji] = useState("🍽");
  const [itemName, setItemName] = useState(""); const [itemDesc, setItemDesc] = useState(""); const [itemPrice, setItemPrice] = useState(""); const [itemCat, setItemCat] = useState("المقبلات"); const [itemEmoji, setItemEmoji] = useState("🍽");
  const [restName, setRestName] = useState("مطعم الفنار"); const [restDesc, setRestDesc] = useState("مأكولات شرقية وغربية"); const [restPhone, setRestPhone] = useState("+966 55 123 4567"); const [restAddress, setRestAddress] = useState("الرياض، حي العليا"); const [wifiName, setWifiName] = useState("AlFanar_Free"); const [wifiPass, setWifiPass] = useState("welcome2024");

  const showToast = (msg: string) => { setToast({ show: true, msg }); setTimeout(() => setToast({ show: false, msg: "" }), 2600); };
  const openAddCat = () => { setCatName(""); setCatEmoji("🍽"); setEditingCat(null); setModal("addCat"); };
  const openEditCat = (c: Category) => { setEditingCat(c); setCatName(c.name); setCatEmoji(c.emoji); setModal("editCat"); };
  const saveCat = () => {
    if (!catName.trim()) { showToast("⚠️ أدخل اسم القسم"); return; }
    if (editingCat) { setCategories(cats => cats.map(c => c.id === editingCat.id ? { ...c, name: catName, emoji: catEmoji } : c)); showToast("✅ تم تعديل القسم!"); }
    else { setCategories(cats => [...cats, { id: Date.now().toString(), name: catName, emoji: catEmoji, is_visible: true, count: 0 }]); showToast("✅ تم إضافة القسم!"); }
    setModal(null);
  };
  const deleteCat = (id: string) => { setCategories(cats => cats.filter(c => c.id !== id)); showToast("🗑 تم حذف القسم"); };
  const toggleCatVisibility = (id: string) => { setCategories(cats => cats.map(c => c.id === id ? { ...c, is_visible: !c.is_visible } : c)); };

  const openAddItem = () => { setItemName(""); setItemDesc(""); setItemPrice(""); setItemCat("المقبلات"); setItemEmoji("🍽"); setEditingItem(null); setModal("addItem"); };
  const openEditItem = (item: Item) => { setEditingItem(item); setItemName(item.name); setItemDesc(item.desc); setItemPrice(item.price.toString()); setItemCat(item.category); setItemEmoji(item.emoji); setModal("editItem"); };
  const saveItem = () => {
    if (!itemName.trim()) { showToast("⚠️ أدخل اسم الصنف"); return; }
    if (!itemPrice) { showToast("⚠️ أدخل السعر"); return; }
    if (editingItem) { setItems(its => its.map(i => i.id === editingItem.id ? { ...i, name: itemName, desc: itemDesc, price: parseFloat(itemPrice), category: itemCat, emoji: itemEmoji } : i)); showToast("✅ تم تعديل الصنف!"); }
    else { setItems(its => [{ id: Date.now().toString(), name: itemName, desc: itemDesc, price: parseFloat(itemPrice), category: itemCat, is_visible: true, emoji: itemEmoji }, ...its]); showToast("✅ تم إضافة الصنف!"); }
    setModal(null);
  };
  const deleteItem = (id: string) => { setItems(its => its.filter(i => i.id !== id)); showToast("🗑 تم حذف الصنف"); };
  const toggleItemVisibility = (id: string) => { setItems(its => its.map(i => i.id === id ? { ...i, is_visible: !i.is_visible } : i)); showToast("👁 تم تغيير حالة الصنف"); };

  const filteredItems = filterCat === "الكل" ? items : items.filter(i => i.category === filterCat);

  return (
    <div style={S.screen}>
      {/* HEADER */}
      <header style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={S.logoBox}>🍽</div>
          <span style={S.logoText}>QR<span style={{ color: "#f97316" }}>Menu</span></span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={S.headerBtn} onClick={() => showToast("🔗 تم نسخ رابط القائمة!")}>🔗</div>
          <div style={S.avatar}>م</div>
        </div>
      </header>

      {/* MAIN */}
      <main style={S.main}>

        {/* ── HOME ── */}
        {tab === "home" && (
          <div>
            {/* Hero card */}
            <div style={{ margin: 16, borderRadius: 18, background: "linear-gradient(135deg,rgba(249,115,22,0.16),rgba(249,115,22,0.05))", border: "1px solid rgba(249,115,22,0.2)", padding: 20 }}>
              <div style={{ fontSize: "0.72rem", color: "#fb923c", fontWeight: 700, marginBottom: 4 }}>لوحة التحكم</div>
              <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.35rem", fontWeight: 900, marginBottom: 10 }}>{restName} 🍕</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={S.pill("green")}>● نشط</span>
                <span style={S.pill("orange")}>⭐ اشتراك شهري</span>
              </div>
            </div>

            {/* Stats */}
            <div style={S.sectionTitle}>إحصائيات سريعة</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "0 16px" }}>
              {[
                { icon: "📂", num: categories.length, label: "أقسام القائمة" },
                { icon: "🍽", num: items.length, label: "صنف مضاف" },
                { icon: "👁", num: "1.2k", label: "مشاهدة هذا الشهر" },
                { icon: "📱", num: 340, label: "مسح QR اليوم" },
              ].map((s, i) => (
                <div key={i} style={{ ...S.card, padding: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(249,115,22,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.6rem", fontWeight: 900, color: "#f97316" }}>{s.num}</div>
                  <div style={{ fontSize: "0.72rem", color: "#4b5563", fontWeight: 700, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* QR link */}
            <div style={S.sectionTitle}>رابط قائمتك</div>
            <div style={{ margin: "0 16px", ...S.card, padding: 16, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={() => setTab("home")}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: "#1c1f2c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🔳</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 800, marginBottom: 4 }}>رمز QR الخاص بك</div>
                <div style={{ fontSize: "0.72rem", color: "#f97316", fontWeight: 700, direction: "ltr", textAlign: "right" }}>menu.qrmenu.com/alfanar</div>
              </div>
            </div>

            {/* Quick actions */}
            <div style={S.sectionTitle}>إجراءات سريعة</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "0 16px" }}>
              {[
                { icon: "📂", title: "إضافة قسم", sub: "فئة جديدة للقائمة", action: () => { setTab("categories"); openAddCat(); } },
                { icon: "🍽", title: "إضافة صنف", sub: "طبق أو مشروب", action: () => { setTab("items"); openAddItem(); } },
                { icon: "🏪", title: "معلومات المطعم", sub: "عنوان، هاتف، WiFi", action: () => setTab("info") },
                { icon: "📤", title: "مشاركة القائمة", sub: "واتساب، سوشيال", action: () => showToast("🔗 تم نسخ الرابط!") },
              ].map((btn, i) => (
                <div key={i} style={{ ...S.card, padding: 16, cursor: "pointer" }} onClick={btn.action}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{btn.icon}</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{btn.title}</div>
                  <div style={{ fontSize: "0.7rem", color: "#4b5563", marginTop: 2 }}>{btn.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CATEGORIES ── */}
        {tab === "categories" && (
          <div>
            <div style={S.sectionTitle}>جميع الأقسام</div>
            <div style={{ ...S.card, margin: "0 16px" }}>
              {categories.map((cat, i) => (
                <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderBottom: i < categories.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div style={{ fontSize: 14, color: "#4b5563", cursor: "grab" }}>⠿</div>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "#1c1f2c", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{cat.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>{cat.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "#4b5563", marginTop: 2 }}>{cat.count} أصناف</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <span style={S.pill(cat.is_visible ? "green" : "gray")} onClick={() => { toggleCatVisibility(cat.id); showToast(cat.is_visible ? "🙈 تم الإخفاء" : "👁 تم الإظهار"); }}>{cat.is_visible ? "نشط" : "مخفي"}</span>
                    <div style={S.btnSm} onClick={() => openEditCat(cat)}>✏️</div>
                    <div style={S.btnDanger} onClick={() => deleteCat(cat.id)}>🗑</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: 16 }}>
              <button style={{ ...S.btnAccent, width: "100%", justifyContent: "center", borderRadius: 12, padding: 13 }} onClick={openAddCat}>＋ إضافة قسم جديد</button>
            </div>
          </div>
        )}

        {/* ── ITEMS ── */}
        {tab === "items" && (
          <div>
            {/* Filter chips */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 16px", scrollbarWidth: "none" }}>
              {["الكل", ...categories.map(c => c.name)].map(cat => (
                <div key={cat} onClick={() => setFilterCat(cat)} style={{ display: "inline-flex", alignItems: "center", padding: "7px 14px", borderRadius: 50, background: filterCat === cat ? "rgba(249,115,22,0.13)" : "#1c1f2c", border: `1px solid ${filterCat === cat ? "rgba(249,115,22,0.25)" : "rgba(255,255,255,0.06)"}`, fontSize: "0.78rem", fontWeight: 700, color: filterCat === cat ? "#fb923c" : "#94a3b8", whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0 }}>{cat}</div>
              ))}
            </div>
            {/* Items */}
            <div style={{ padding: "0 16px" }}>
              {filteredItems.map(item => (
                <div key={item.id} style={{ ...S.card, marginBottom: 10, opacity: item.is_visible ? 1 : 0.5 }}>
                  <div style={{ display: "flex", alignItems: "stretch" }}>
                    <div style={{ width: 82, flexShrink: 0, background: "#1c1f2c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, borderRadius: "14px 0 0 14px", position: "relative" }}>
                      {item.emoji}
                      {!item.is_visible && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, borderRadius: "14px 0 0 14px" }}>🚫</div>}
                    </div>
                    <div style={{ flex: 1, padding: 12 }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 800, marginBottom: 4 }}>{item.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#4b5563", marginBottom: 8, lineHeight: 1.5 }}>{item.desc}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontSize: "1rem", fontWeight: 900, color: "#f97316" }}>{item.price} ر.س</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <div style={{ ...S.btnSm, background: item.is_visible ? "#1c1f2c" : "rgba(249,115,22,0.13)" }} onClick={() => toggleItemVisibility(item.id)}>{item.is_visible ? "👁" : "🙈"}</div>
                          <div style={S.btnSm} onClick={() => openEditItem(item)}>✏️</div>
                          <div style={S.btnDanger} onClick={() => deleteItem(item.id)}>🗑</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {!item.is_visible && (
                    <div style={{ padding: "6px 12px 8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={S.pill("gray")}>⛔ مخفي عن الزبائن</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INFO ── */}
        {tab === "info" && (
          <div style={{ padding: "16px 16px 0" }}>
            <div style={{ border: "2px dashed rgba(249,115,22,0.25)", borderRadius: 14, padding: 24, textAlign: "center", cursor: "pointer", background: "rgba(249,115,22,0.07)", marginBottom: 16 }} onClick={() => showToast("📸 اختر صورة الشعار")}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>🖼️</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fb923c" }}>رفع شعار المطعم</div>
              <div style={{ fontSize: "0.72rem", color: "#4b5563", marginTop: 4 }}>JPG, PNG — الحد الأقصى 5MB</div>
            </div>
            {[
              { label: "اسم المطعم", value: restName, setter: setRestName },
              { label: "وصف مختصر", value: restDesc, setter: setRestDesc },
              { label: "رقم الهاتف", value: restPhone, setter: setRestPhone },
              { label: "العنوان", value: restAddress, setter: setRestAddress },
              { label: "اسم Wi-Fi", value: wifiName, setter: setWifiName },
              { label: "كلمة مرور Wi-Fi", value: wifiPass, setter: setWifiPass },
            ].map((field, i) => (
              <div key={i} style={S.formGroup}>
                <label style={S.formLabel}>{field.label}</label>
                <input style={S.formInput} value={field.value} onChange={e => field.setter(e.target.value)} />
              </div>
            ))}
            <button style={{ ...S.btnAccent, width: "100%", justifyContent: "center", borderRadius: 12, padding: 13, marginTop: 8, marginBottom: 20 }} onClick={() => showToast("💾 تم حفظ المعلومات بنجاح!")}>
              💾 حفظ التغييرات
            </button>
          </div>
        )}

      </main>

      {/* BOTTOM NAV */}
      <nav style={S.bottomNav}>
        {[
          { id: "home" as const, icon: "🏠", label: "الرئيسية" },
          { id: "categories" as const, icon: "📂", label: "الأقسام" },
          { id: "items" as const, icon: "🍽", label: "الأصناف" },
          { id: "info" as const, icon: "🏪", label: "المطعم" },
        ].map(nav => (
          <div key={nav.id} style={S.navItem(tab === nav.id)} onClick={() => setTab(nav.id)}>
            <div style={S.navIcon(tab === nav.id)}>{nav.icon}</div>
            <div style={S.navLabel(tab === nav.id)}>{nav.label}</div>
          </div>
        ))}
      </nav>

      {/* FAB */}
      {(tab === "categories" || tab === "items") && (
        <button style={S.fab} onClick={tab === "categories" ? openAddCat : openAddItem}>＋</button>
      )}

      {/* MODALS */}
      {(modal === "addCat" || modal === "editCat") && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={S.sheet} onClick={e => e.stopPropagation()}>
            <div style={S.sheetHandle} />
            <div style={S.sheetTitle}>{modal === "addCat" ? "➕ إضافة قسم جديد" : "✏️ تعديل القسم"}</div>
            <div style={{ padding: 16 }}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>اسم القسم</label>
                <input style={S.formInput} placeholder="مثال: المشروبات الساخنة" value={catName} onChange={e => setCatName(e.target.value)} />
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>الأيقونة</label>
                <input style={{ ...S.formInput, fontSize: "1.4rem", textAlign: "center" }} maxLength={4} value={catEmoji} onChange={e => setCatEmoji(e.target.value)} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {["🥗","🍖","🍕","🥤","🍰","☕","🍣","🥩","🍜","🥪"].map(e => (
                  <span key={e} style={{ fontSize: 22, cursor: "pointer", padding: 4 }} onClick={() => setCatEmoji(e)}>{e}</span>
                ))}
              </div>
              <button style={{ ...S.btnAccent, width: "100%", justifyContent: "center", borderRadius: 12, padding: 13 }} onClick={saveCat}>حفظ القسم</button>
              <button style={{ ...S.btnGhost, width: "100%", justifyContent: "center", borderRadius: 12, padding: 12, marginTop: 8 }} onClick={() => setModal(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {(modal === "addItem" || modal === "editItem") && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={S.sheet} onClick={e => e.stopPropagation()}>
            <div style={S.sheetHandle} />
            <div style={S.sheetTitle}>{modal === "addItem" ? "➕ إضافة صنف جديد" : "✏️ تعديل الصنف"}</div>
            <div style={{ padding: 16 }}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>اسم الصنف</label>
                <input style={S.formInput} placeholder="مثال: بيتزا مارغريتا" value={itemName} onChange={e => setItemName(e.target.value)} />
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>الوصف</label>
                <input style={S.formInput} placeholder="وصف مختصر للمكونات..." value={itemDesc} onChange={e => setItemDesc(e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>السعر (ر.س)</label>
                  <input style={S.formInput} type="number" placeholder="0.00" value={itemPrice} onChange={e => setItemPrice(e.target.value)} />
                </div>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>القسم</label>
                  <select style={S.formInput} value={itemCat} onChange={e => setItemCat(e.target.value)}>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>الأيقونة</label>
                <input style={{ ...S.formInput, fontSize: "1.4rem", textAlign: "center" }} maxLength={4} value={itemEmoji} onChange={e => setItemEmoji(e.target.value)} />
              </div>
              <button style={{ ...S.btnAccent, width: "100%", justifyContent: "center", borderRadius: 12, padding: 13 }} onClick={saveItem}>حفظ الصنف</button>
              <button style={{ ...S.btnGhost, width: "100%", justifyContent: "center", borderRadius: 12, padding: 12, marginTop: 8 }} onClick={() => setModal(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div style={S.toast(toast.show)}>
        <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>{toast.msg}</span>
      </div>

    </div>
  );
}
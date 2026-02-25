"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type OrderItem = { id: string; name: string; price: number; qty: number };
type Order = {
  id: string;
  table_number: string;
  items: OrderItem[];
  total: number;
  status: "new" | "preparing" | "ready" | "delivered";
  notes: string;
  created_at: string;
  restaurant_id: string;
};

const STATUS_CONFIG = {
  new:       { label: "جديد",          emoji: "🔔", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)",  next: "preparing", nextLabel: "بدء التحضير" },
  preparing: { label: "قيد التحضير",   emoji: "👨‍🍳", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)",  next: "ready",     nextLabel: "جاهز للتسليم" },
  ready:     { label: "جاهز",           emoji: "✅", color: "#22c55e", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.25)",   next: "delivered", nextLabel: "تم التسليم" },
  delivered: { label: "مُسلَّم",        emoji: "🎉", color: "#6b7280", bg: "rgba(107,114,128,0.1)",  border: "rgba(107,114,128,0.2)", next: null,        nextLabel: "" },
};

const FILTERS = [
  { key: "active",    label: "النشطة",    emoji: "⚡" },
  { key: "new",       label: "جديدة",     emoji: "🔔" },
  { key: "preparing", label: "تحضير",     emoji: "👨‍🍳" },
  { key: "ready",     label: "جاهزة",     emoji: "✅" },
  { key: "delivered", label: "مسلَّمة",   emoji: "🎉" },
  { key: "all",       label: "الكل",      emoji: "📋" },
];

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `منذ ${diff} ث`;
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} د`;
  return `منذ ${Math.floor(diff / 3600)} س`;
}

function formatPrice(n: number) { return `${n.toLocaleString("ar-SY")} ل.س`; }

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [newCount, setNewCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevNewCount = useRef(0);

  // ── تحقق من تسجيل الدخول ──
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { router.push("/login"); return; }
    try {
      const parsed = JSON.parse(userData);
      const clientId = parsed.clients?.id || parsed.client_id;
      if (!clientId) { router.push("/login"); return; }
      loadRestaurant(clientId);
    } catch { router.push("/login"); }
  }, []);

  const loadRestaurant = async (clientId: string) => {
    const { data } = await supabase.from("restaurants").select("id, name").eq("client_id", clientId).single();
    if (data) {
      setRestaurantId(data.id);
      setRestaurantName(data.name);
      loadOrders(data.id);
      subscribeToOrders(data.id);
    }
    setLoading(false);
  };

  const loadOrders = async (restId: string) => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("restaurant_id", restId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) {
      setOrders(data as Order[]);
      const nc = (data as Order[]).filter(o => o.status === "new").length;
      setNewCount(nc);
    }
  };

  // ── Realtime subscription ──
  const subscribeToOrders = (restId: string) => {
    supabase
      .channel("orders-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders(prev => [payload.new as Order, ...prev]);
            setNewCount(prev => prev + 1);
            // صوت تنبيه
            try { new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAA...").play(); } catch {}
          } else if (payload.eventType === "UPDATE") {
            setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new as Order : o));
            if (selectedOrder?.id === payload.new.id) setSelectedOrder(payload.new as Order);
          } else if (payload.eventType === "DELETE") {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();
  };

  // ── تحديث حالة الطلب ──
  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setUpdating(null);
    if (restaurantId) loadOrders(restaurantId);
  };

  // ── حذف الطلب ──
  const deleteOrder = async (orderId: string) => {
    await supabase.from("orders").delete().eq("id", orderId);
    setOrders(prev => prev.filter(o => o.id !== orderId));
    setSelectedOrder(null);
  };

  // ── فلترة الطلبات ──
  const filteredOrders = orders.filter(o => {
    if (filter === "active") return o.status !== "delivered";
    if (filter === "all") return true;
    return o.status === filter;
  });

  const stats = {
    new: orders.filter(o => o.status === "new").length,
    preparing: orders.filter(o => o.status === "preparing").length,
    ready: orders.filter(o => o.status === "ready").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    total: orders.reduce((s, o) => s + (o.total || 0), 0),
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#09090f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cairo',sans-serif", color: "#f1f5f9" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 52, height: 52, border: "3px solid rgba(249,115,22,0.15)", borderTop: "3px solid #f97316", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div>جارٍ التحميل...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#09090f", color: "#f1f5f9", fontFamily: "'Cairo','Tajawal',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;700;800;900&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#2a2f44;border-radius:4px;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes newOrder{0%{transform:scale(1)}50%{transform:scale(1.02)}100%{transform:scale(1)}}
        .order-card{animation:fadeUp 0.3s ease forwards;transition:transform 0.2s,box-shadow 0.2s;}
        .order-card:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,0.4);}
        .new-pulse{animation:newOrder 1.5s ease infinite;}
        .btn-transition{transition:all 0.2s;}
        .btn-transition:hover{opacity:0.85;}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(9,9,15,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 16px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🍽</div>
          <div>
            <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "0.95rem", fontWeight: 900, lineHeight: 1.1 }}>{restaurantName}</div>
            <div style={{ fontSize: "0.62rem", color: "#4b5563", fontWeight: 700 }}>لوحة الطلبات</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {stats.new > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 50, padding: "5px 12px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#f59e0b" }}>{stats.new} جديد</span>
            </div>
          )}
          <button onClick={() => router.push("/dashboard")} style={{ background: "#1c1f2c", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "7px 14px", color: "#94a3b8", fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>
            ← الداشبورد
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, padding: "12px 14px 0" }}>
        {[
          { label: "جديدة",    value: stats.new,       color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
          { label: "تحضير",    value: stats.preparing,  color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
          { label: "جاهزة",    value: stats.ready,      color: "#22c55e", bg: "rgba(34,197,94,0.1)"  },
          { label: "مُسلَّمة", value: stats.delivered,  color: "#6b7280", bg: "rgba(107,114,128,0.1)"},
        ].map(s => (
          <div key={s.label} style={{ background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.65rem", color: "#4b5563", fontWeight: 700, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <div style={{ display: "flex", gap: 6, padding: "12px 14px 0", overflowX: "auto" }}>
        {FILTERS.map(f => {
          const count = f.key === "active"
            ? orders.filter(o => o.status !== "delivered").length
            : f.key === "all" ? orders.length
            : orders.filter(o => o.status === f.key).length;
          const isActive = filter === f.key;
          return (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 50, border: isActive ? "1px solid rgba(249,115,22,0.3)" : "1px solid rgba(255,255,255,0.06)", background: isActive ? "rgba(249,115,22,0.12)" : "#13161e", color: isActive ? "#f97316" : "#94a3b8", fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s" }}>
              <span>{f.emoji}</span>
              <span>{f.label}</span>
              {count > 0 && <span style={{ background: isActive ? "#f97316" : "#2a2f44", color: isActive ? "#fff" : "#94a3b8", borderRadius: 50, padding: "1px 7px", fontSize: "0.65rem", fontWeight: 800 }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* ── ORDERS LIST ── */}
      <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
        {filteredOrders.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "#4b5563" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>📭</div>
            <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.1rem", fontWeight: 700 }}>لا توجد طلبات</div>
          </div>
        ) : (
          filteredOrders.map(order => {
            const st = STATUS_CONFIG[order.status];
            const isNew = order.status === "new";
            const isUpdating = updating === order.id;
            return (
              <div key={order.id} className={`order-card ${isNew ? "new-pulse" : ""}`} style={{ background: "#13161e", border: `1px solid ${isNew ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: 16, overflow: "hidden" }}>
                {/* رأس الكارد */}
                <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: st.bg, border: `1px solid ${st.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{st.emoji}</div>
                    <div>
                      <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1rem", fontWeight: 900 }}>طاولة {order.table_number}</div>
                      <div style={{ fontSize: "0.68rem", color: "#4b5563", marginTop: 1 }}>{timeAgo(order.created_at)}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 50, fontSize: "0.68rem", fontWeight: 800, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
                    <button onClick={() => setSelectedOrder(order)} style={{ width: 30, height: 30, borderRadius: 8, background: "#1c1f2c", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", color: "#94a3b8", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>👁</button>
                  </div>
                </div>

                {/* الأصناف */}
                <div style={{ padding: "10px 14px" }}>
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: i < Math.min(order.items.length, 3) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <span style={{ fontSize: "0.82rem", color: "#f1f5f9", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <span style={{ color: "#f97316", fontWeight: 800 }}>×{item.qty}</span> {item.name}
                      </span>
                      <span style={{ fontSize: "0.78rem", color: "#4b5563", flexShrink: 0, marginRight: 8 }}>{formatPrice(item.price * item.qty)}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div style={{ fontSize: "0.72rem", color: "#4b5563", marginTop: 5 }}>+{order.items.length - 3} أصناف أخرى</div>
                  )}
                  {order.notes && (
                    <div style={{ marginTop: 8, padding: "7px 10px", background: "rgba(245,158,11,0.06)", borderRadius: 8, fontSize: "0.75rem", color: "#f59e0b" }}>
                      📝 {order.notes}
                    </div>
                  )}
                </div>

                {/* المجموع + الأزرار */}
                <div style={{ padding: "10px 14px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: "1rem", fontWeight: 900, color: "#f97316" }}>{formatPrice(order.total)}</span>
                  {st.next && (
                    <button
                      className="btn-transition"
                      onClick={() => updateStatus(order.id, st.next!)}
                      disabled={isUpdating}
                      style={{ flex: 1, maxWidth: 180, background: isUpdating ? "#2a2f44" : st.color, color: "#fff", border: "none", borderRadius: 10, padding: "9px 14px", fontFamily: "'Cairo',sans-serif", fontWeight: 800, fontSize: "0.8rem", cursor: isUpdating ? "not-allowed" : "pointer", opacity: isUpdating ? 0.6 : 1 }}
                    >
                      {isUpdating ? "⏳..." : st.nextLabel}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── ORDER DETAIL MODAL ── */}
      {selectedOrder && (
        <div onClick={() => setSelectedOrder(null)} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div className="slide-up" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: "#13161e", borderRadius: "24px 24px 0 0", border: "1px solid rgba(255,255,255,0.06)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ width: 40, height: 4, borderRadius: 4, background: "#2a2f44", margin: "12px auto 0" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.05rem", fontWeight: 900 }}>
                {STATUS_CONFIG[selectedOrder.status].emoji} طاولة {selectedOrder.table_number}
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ width: 32, height: 32, borderRadius: 9, background: "#1c1f2c", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", color: "#94a3b8", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            <div style={{ padding: "16px 18px" }}>
              {/* معلومات الطلب */}
              <div style={{ background: "#1c1f2c", borderRadius: 14, padding: "12px 16px", marginBottom: 16 }}>
                {[
                  { label: "الحالة", val: <span style={{ color: STATUS_CONFIG[selectedOrder.status].color, fontWeight: 800 }}>{STATUS_CONFIG[selectedOrder.status].label}</span> },
                  { label: "الوقت", val: new Date(selectedOrder.created_at).toLocaleTimeString("ar-SY") },
                  { label: "عدد الأصناف", val: selectedOrder.items.reduce((s, i) => s + i.qty, 0) },
                  { label: "المجموع", val: <span style={{ color: "#f97316", fontWeight: 900 }}>{formatPrice(selectedOrder.total)}</span> },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <span style={{ fontSize: "0.8rem", color: "#4b5563" }}>{row.label}</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{row.val}</span>
                  </div>
                ))}
              </div>

              {/* قائمة الأصناف */}
              <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#4b5563", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>الأصناف</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1c1f2c", borderRadius: 12, padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(249,115,22,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 900, color: "#f97316" }}>×{item.qty}</div>
                      <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f97316" }}>{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              {/* ملاحظات */}
              {selectedOrder.notes && (
                <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#f59e0b", marginBottom: 5 }}>📝 ملاحظات</div>
                  <div style={{ fontSize: "0.88rem", color: "#f1f5f9" }}>{selectedOrder.notes}</div>
                </div>
              )}

              {/* أزرار التحكم */}
              {STATUS_CONFIG[selectedOrder.status].next && (
                <button
                  className="btn-transition"
                  onClick={() => { updateStatus(selectedOrder.id, STATUS_CONFIG[selectedOrder.status].next!); setSelectedOrder(null); }}
                  style={{ width: "100%", background: STATUS_CONFIG[selectedOrder.status].color, color: "#fff", border: "none", borderRadius: 14, padding: "13px", fontFamily: "'Cairo',sans-serif", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", marginBottom: 10 }}
                >
                  {STATUS_CONFIG[selectedOrder.status].nextLabel} →
                </button>
              )}
              <button
                onClick={() => { if (confirm("هل تريد حذف هذا الطلب؟")) deleteOrder(selectedOrder.id); }}
                style={{ width: "100%", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: "11px", fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}
              >
                🗑 حذف الطلب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

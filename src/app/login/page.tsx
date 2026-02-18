"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // التحقق من قاعدة البيانات
    const result = await login(username, password);

    if (!result.success) {
      setError(result.error || "حدث خطأ ما");
      setLoading(false);
      return;
    }

    // حفظ الجلسة
    localStorage.setItem("user", JSON.stringify(result.user));
    router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090f", color: "#f1f5f9", fontFamily: "'Cairo','Tajawal',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 5%", background: "rgba(9,9,15,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", zIndex: 100 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🍽</div>
          <span style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.1rem", fontWeight: 900, color: "#f1f5f9" }}>QR<span style={{ color: "#f97316" }}>Menu</span></span>
        </Link>
      </nav>

      {/* Login Form */}
      <div style={{ width: "100%", maxWidth: 420, background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 40 }}>
        
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "rgba(249,115,22,0.13)", border: "1px solid rgba(249,115,22,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>🔐</div>
          <h1 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.5rem", fontWeight: 900, marginBottom: 8 }}>تسجيل الدخول</h1>
          <p style={{ color: "#94a3b8", fontSize: "0.88rem" }}>أدخل بيانات حسابك للوصول إلى لوحة التحكم</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", marginBottom: 8 }}>اسم المستخدم</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alfanar"
              required
              style={{ width: "100%", background: "#1c1f2c", border: "1.5px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "#f1f5f9", padding: "12px 14px", fontSize: "0.9rem", fontFamily: "'Cairo',sans-serif", outline: "none" }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", marginBottom: 8 }}>كلمة المرور</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: "100%", background: "#1c1f2c", border: "1.5px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "#f1f5f9", padding: "12px 14px", fontSize: "0.9rem", fontFamily: "'Cairo',sans-serif", outline: "none" }}
            />
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: "0.85rem", color: "#ef4444", textAlign: "center" }}>
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            style={{ width: "100%", background: loading ? "#4b5563" : "#f97316", color: "#fff", border: "none", borderRadius: 12, padding: 14, fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", marginBottom: 16, boxShadow: "0 4px 20px rgba(249,115,22,0.35)" }}
          >
            {loading ? "جارٍ التحقق..." : "🔓 الدخول إلى لوحة التحكم"}
          </button>

          <div style={{ textAlign: "center", fontSize: "0.82rem", color: "#4b5563" }}>
            لا تملك حساباً؟ <Link href="/" style={{ color: "#f97316", textDecoration: "none", fontWeight: 700 }}>تواصل مع المسؤول</Link>
          </div>
        </form>

        <div style={{ marginTop: 24, padding: "16px", background: "#1c1f2c", borderRadius: 10, fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.7 }}>
          <strong style={{ color: "#f1f5f9", display: "block", marginBottom: 6 }}>💡 بيانات تجريبية:</strong>
          اسم المستخدم: <code style={{ background: "#0e1017", padding: "2px 6px", borderRadius: 4, color: "#f97316" }}>alfanar</code><br />
          كلمة المرور: <code style={{ background: "#0e1017", padding: "2px 6px", borderRadius: 4, color: "#f97316" }}>123456</code>
        </div>
      </div>

    </div>
  );
}
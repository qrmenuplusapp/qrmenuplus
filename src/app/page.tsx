"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const faqs = [
    { q: "هل يحتاج الزبون لتنزيل تطبيق لرؤية القائمة؟", a: "لا على الإطلاق. القائمة تفتح مباشرة في متصفح الهاتف عند مسح كود QR. لا يوجد تطبيق، لا تسجيل دخول، لا انتظار." },
    { q: "كيف يبدو الرابط المخصص لمطعمي؟", a: "ستحصل على رابط خاص بمطعمك بالشكل: menu.qrmenu.com/اسم-مطعمك — ويمكنك مشاركته على السوشيال ميديا وخرائط جوجل والواتساب." },
    { q: "هل يمكنني تغيير الأسعار والأصناف بنفسي؟", a: "نعم بالكامل. لوحة التحكم مصممة لتكون سهلة جداً خصوصاً من الجوال. يمكنك إضافة وتعديل وحذف أي صنف أو قسم في ثوانٍ، والتغييرات تظهر فوراً للزبائن." },
    { q: "ماذا يحدث لو غيّرت اسم مطعمي؟", a: "رمز QR الذي طبعته سيظل يعمل بشكل طبيعي. الكودات مرتبطة بحسابك وليس بالاسم، لذا لا حاجة لإعادة الطباعة." },
    { q: "هل الشهر التجريبي مجاني تماماً؟", a: "نعم 100%. لا نطلب بيانات بطاقة بنكية للتسجيل. تستمتع بكامل مميزات المنصة لمدة 30 يوماً دون أي التزام." },
  ];

  const features = [
    { icon: "📱", title: "تجربة موبايل استثنائية", desc: "لوحة التحكم مصممة أولاً للهاتف. إدارة قائمتك بلمسات بسيطة حيثما كنت." },
    { icon: "🔗", title: "Subdomain مخصص", desc: "كل مطعم يحصل على رابطه الخاص: مطعمك.qrmenu.com واضح وسهل التذكر." },
    { icon: "✏️", title: "تعديل فوري", desc: "غيّر سعراً، أخفِ صنفاً، أضف قسماً جديداً. التعديلات تظهر للزبائن لحظياً." },
    { icon: "🖼️", title: "صور جذابة للأصناف", desc: "أضف صوراً احترافية لكل صنف. الصور تزيد من شهية الزبائن وتحسّن المبيعات." },
    { icon: "🌐", title: "دعم اللغات المتعددة", desc: "اعرض قائمتك بالعربية والإنجليزية وأكثر، لخدمة الزوار الأجانب بشكل أفضل." },
    { icon: "📊", title: "لوحة تحكم المشرف", desc: "إدارة كاملة للعملاء والاشتراكات والحسابات من لوحة تحكم مركزية احترافية." },
  ];

  const testimonials = [
    { name: "محمد العمري", role: "مطعم الواحة - الرياض", text: "سهولة الاستخدام لا تصدق. أضفت قائمة كاملة في أقل من 20 دقيقة والزبائن يحبونها جداً.", avatar: "👨‍🍳" },
    { name: "نورة السالم", role: "كافيه لافيستا - جدة", text: "وفّرت تكاليف الطباعة وأصبحت أغيّر الأسعار والعروض بدقيقة واحدة. أفضل قرار اتخذته لمطعمي.", avatar: "👩‍💼" },
    { name: "خالد المنصور", role: "مطعم الأصيل - دبي", text: "القائمة الرقمية رفعت متوسط الطلب عندي. الصور تلعب دور كبير في إقناع الزبون يطلب أكثر.", avatar: "🧑‍🍽" },
  ];

  return (
    <main style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif", background: "#09090f", color: "#f1f5f9", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 5%",
        background: scrolled ? "rgba(9,9,15,0.97)" : "rgba(9,9,15,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        transition: "all 0.3s",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🍽</div>
          <span style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.2rem", fontWeight: 900 }}>QR<span style={{ color: "#f97316" }}>Menu</span></span>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <a href="#how" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600 }}>كيف يعمل</a>
          <a href="#features" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600 }}>المميزات</a>
          <a href="#pricing" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600 }}>الأسعار</a>
          <Link href="/login" style={{ background: "#f97316", color: "#fff", padding: "9px 22px", borderRadius: 50, textDecoration: "none", fontSize: "0.88rem", fontWeight: 700, boxShadow: "0 3px 14px rgba(249,115,22,0.35)" }}>الدخول إلى لوحة التحكم</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "130px 5% 80px",
        background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(249,115,22,0.13), transparent)",
        position: "relative", overflow: "hidden"
      }}>
        {/* grid bg */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(249,115,22,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.04) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%,black 30%,transparent 80%)"
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)",
            color: "#fb923c", padding: "7px 16px", borderRadius: 50,
            fontSize: "0.8rem", fontWeight: 800, marginBottom: 24
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f97316", display: "inline-block", animation: "pulse 2s infinite" }} />
            الحل الرقمي لمطعمك
          </div>
          <h1 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "clamp(2.4rem,5vw,4rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: 20 }}>
            قائمة طعام رقمية<br />
            <span style={{ color: "#f97316" }}>تبيع بدلاً عنك</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", marginBottom: 36, maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.7 }}>
            امنح زبائنك تجربة طلب عصرية وسريعة عبر كود QR مخصص لمطعمك. بدون تطبيق، بدون ورق، بدون انتظار.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" style={{ background: "#f97316", color: "#fff", padding: "14px 32px", borderRadius: 50, textDecoration: "none", fontSize: "0.95rem", fontWeight: 700, boxShadow: "0 4px 20px rgba(249,115,22,0.35)" }}>🚀 ابدأ تجربتك المجانية</Link>
            <Link href="/menu/demo" style={{ background: "#1c1f2c", color: "#f1f5f9", padding: "14px 32px", borderRadius: 50, textDecoration: "none", fontSize: "0.95rem", fontWeight: 600, border: "1px solid rgba(255,255,255,0.08)" }}>👀 شاهد مثالاً</Link>
          </div>
          {/* Stats */}
          <div style={{ display: "flex", gap: 40, justifyContent: "center", marginTop: 50, flexWrap: "wrap" }}>
            {[{ num: "+500", label: "مطعم نشط" }, { num: "30 ثانية", label: "للبدء والإعداد" }, { num: "شهر", label: "مجاني بدون بطاقة" }].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.6rem", fontWeight: 900, color: "#f97316" }}>{s.num}</div>
                <div style={{ fontSize: "0.78rem", color: "#4b5563", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: "90px 5%", background: "#0e1017", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", color: "#fb923c", padding: "6px 14px", borderRadius: 50, fontSize: "0.78rem", fontWeight: 800, marginBottom: 16 }}>⚡ كيف يعمل</div>
          <h2 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 900, marginBottom: 12 }}>ابدأ في 3 خطوات بسيطة</h2>
          <p style={{ color: "#94a3b8", marginBottom: 50 }}>لا تحتاج لخبرة تقنية. كل ما تحتاجه هو هاتفك الذكي.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 }}>
            {[
              { num: "1", title: "أنشئ حسابك", desc: "سجّل مجاناً في دقيقة واحدة، أدخل اسم مطعمك، وستحصل على رابطك ورمز QR الخاص." },
              { num: "2", title: "أضف أصنافك", desc: "أضف أقسامك وأصنافك مع الصور والأسعار بسهولة تامة من هاتفك أو جهازك." },
              { num: "3", title: "ضع الكود على الطاولة", desc: "اطبع كود QR وضعه على طاولاتك. زبائنك يمسحونه ويطلعون على قائمتك فوراً." },
            ].map((step, i) => (
              <div key={i} style={{ background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "30px 24px", textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 900, color: "#fff", margin: "0 auto 18px", boxShadow: "0 8px 25px rgba(249,115,22,0.3)" }}>{step.num}</div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 10 }}>{step.title}</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "90px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", color: "#fb923c", padding: "6px 14px", borderRadius: 50, fontSize: "0.78rem", fontWeight: 800, marginBottom: 16 }}>✨ المميزات</div>
          <h2 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 900, marginBottom: 12 }}>كل ما تحتاجه في منصة واحدة</h2>
          <p style={{ color: "#94a3b8", marginBottom: 50 }}>مميزات مصممة خصيصاً لأصحاب المطاعم في العالم العربي.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} style={{ background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 28, textAlign: "right" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.87rem", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "90px 5%", background: "#0e1017", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", color: "#fb923c", padding: "6px 14px", borderRadius: 50, fontSize: "0.78rem", fontWeight: 800, marginBottom: 16 }}>💬 آراء العملاء</div>
          <h2 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 900, marginBottom: 50 }}>ماذا يقول أصحاب المطاعم</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: "#13161e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 28, textAlign: "right" }}>
                <div style={{ color: "#f59e0b", fontSize: "0.85rem", letterSpacing: 2, marginBottom: 14 }}>★★★★★</div>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "0.88rem" }}>{t.name}</div>
                    <div style={{ color: "#4b5563", fontSize: "0.78rem" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "90px 5%" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", color: "#fb923c", padding: "6px 14px", borderRadius: 50, fontSize: "0.78rem", fontWeight: 800, marginBottom: 16 }}>💰 الأسعار</div>
          <h2 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 900, marginBottom: 12 }}>أسعار شفافة بدون مفاجآت</h2>
          <p style={{ color: "#94a3b8", marginBottom: 50 }}>اختر الخطة التي تناسب مطعمك. شهر أول مجاني تماماً.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, alignItems: "start" }}>
            {[
              { plan: "شهري", price: "50,000", save: "", color: "#f97316", popular: false, features: ["Subdomain مخصص", "أقسام وأصناف غير محدودة", "صور للأصناف", "كود QR للقائمة"] },
              { plan: "نصف سنوي", price: "270,000", save: "توفير 15%", color: "#f97316", popular: true, features: ["كل مميزات الشهري", "دعم متعدد اللغات", "أولوية في الدعم", "تقارير مفصّلة"] },
              { plan: "سنوي", price: "480,000", save: "توفير 26%", color: "#22c55e", popular: false, features: ["كل المميزات", "دعم متعدد اللغات", "إضافة موظفين", "دعم VIP"] },
            ].map((p, i) => (
              <div key={i} style={{
                background: p.popular ? "linear-gradient(135deg,#1a1e28,rgba(249,115,22,0.08))" : "#13161e",
                border: p.popular ? "1px solid #f97316" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 20, padding: "32px 24px",
                transform: p.popular ? "scale(1.03)" : "scale(1)",
                position: "relative"
              }}>
                {p.popular && <div style={{ position: "absolute", top: 16, right: 16, background: "#f97316", color: "#fff", padding: "3px 12px", borderRadius: 50, fontSize: "0.72rem", fontWeight: 800 }}>الأكثر طلباً ⭐</div>}
                <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#4b5563", marginBottom: 14, marginTop: p.popular ? 20 : 0 }}>{p.plan}</div>
                <div style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "3rem", fontWeight: 900, color: p.color, lineHeight: 1 }}>
                  {p.price}<span style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: 400 }}> ل.س/شهر</span>
                </div>
                {p.save && <div style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 700, marginTop: 4 }}>{p.save}</div>}
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "20px 0" }} />
                <ul style={{ listStyle: "none", textAlign: "right", marginBottom: 24 }}>
                  {p.features.map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: "0.88rem", color: "#94a3b8" }}>
                      <span style={{ color: "#f97316", fontWeight: 900 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" style={{ display: "block", background: p.popular ? "#f97316" : "#1c1f2c", color: "#fff", padding: 13, borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: "0.9rem", border: p.popular ? "none" : "1px solid rgba(255,255,255,0.08)" }}>ابدأ مجاناً</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "90px 5%", background: "#0e1017", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", color: "#fb923c", padding: "6px 14px", borderRadius: 50, fontSize: "0.78rem", fontWeight: 800, marginBottom: 16 }}>❓ الأسئلة الشائعة</div>
          <h2 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 900, marginBottom: 40 }}>كل أسئلتك مجابة هنا</h2>
          <div style={{ textAlign: "right" }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", fontWeight: 700, fontSize: "0.97rem", gap: 16, color: faqOpen === i ? "#f97316" : "#f1f5f9" }}>
                  {faq.q}
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: faqOpen === i ? "#f97316" : "#1c1f2c", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16, transition: "all 0.3s", transform: faqOpen === i ? "rotate(45deg)" : "none" }}>+</div>
                </div>
                {faqOpen === i && <div style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.7, paddingBottom: 20 }}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "90px 5%" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ background: "linear-gradient(135deg,#1c1f2c,rgba(249,115,22,0.08))", border: "1px solid rgba(249,115,22,0.22)", borderRadius: 28, padding: "60px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)", width: 300, height: 300, background: "radial-gradient(circle,rgba(249,115,22,0.12),transparent)", borderRadius: "50%", pointerEvents: "none" }} />
            <h2 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 900, marginBottom: 14, position: "relative" }}>
              مطعمك يستحق قائمة<br /><span style={{ color: "#f97316" }}>تعكس جودته</span>
            </h2>
            <p style={{ color: "#94a3b8", marginBottom: 32, position: "relative" }}>انضم لأكثر من 500 مطعم ومقهى يستخدم QRMenu. شهر أول مجاني بدون بطاقة بنكية.</p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
              <Link href="/login" style={{ background: "#f97316", color: "#fff", padding: "14px 32px", borderRadius: 50, textDecoration: "none", fontWeight: 700, fontSize: "0.95rem", boxShadow: "0 4px 20px rgba(249,115,22,0.35)" }}>🎉 أنشئ قائمتك الآن مجاناً</Link>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#4b5563", marginTop: 16, position: "relative" }}>✓ مجاني لمدة شهر · ✓ لا بطاقة مطلوبة · ✓ إلغاء في أي وقت</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0e1017", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "40px 5% 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 32, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🍽</div>
                <span style={{ fontFamily: "'Tajawal',sans-serif", fontSize: "1.1rem", fontWeight: 900 }}>QR<span style={{ color: "#f97316" }}>Menu</span></span>
              </div>
              <p style={{ color: "#4b5563", fontSize: "0.87rem", lineHeight: 1.7 }}>منصة قوائم الطعام الرقمية الأولى في المنطقة العربية.</p>
            </div>
            {[
              { title: "المنتج", links: ["المميزات", "الأسعار", "مولّد QR"] },
              { title: "الشركة", links: ["من نحن", "المدونة", "تواصل معنا"] },
              { title: "الدعم", links: ["مركز المساعدة", "الأسئلة الشائعة", "سياسة الخصوصية"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 style={{ fontSize: "0.83rem", fontWeight: 800, color: "#f1f5f9", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>{col.title}</h4>
                <ul style={{ listStyle: "none" }}>
                  {col.links.map((link, j) => (
                    <li key={j} style={{ marginBottom: 10 }}>
                      <a href="#" style={{ color: "#4b5563", textDecoration: "none", fontSize: "0.87rem" }}>{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <span style={{ color: "#4b5563", fontSize: "0.82rem" }}>© 2025 <span style={{ color: "#f97316" }}>QRMenu</span>. جميع الحقوق محفوظة.</span>
            <span style={{ color: "#4b5563", fontSize: "0.82rem" }}>صُنع بـ ❤️ للمطاعم العربية</span>
          </div>
        </div>
      </footer>

    </main>
  );
}

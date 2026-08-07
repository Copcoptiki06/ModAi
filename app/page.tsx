"use client";

import { useEffect, useMemo, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const stages = [
  { id: "cell", label: "Hücre", icon: "◉", note: "Canlıların en küçük yapı birimi" },
  { id: "tissue", label: "Doku", icon: "▦", note: "Benzer hücrelerin oluşturduğu yapı" },
  { id: "organ", label: "Organ", icon: "♥", note: "Farklı dokuların birlikte çalışması" },
  { id: "system", label: "Sistem", icon: "⌁", note: "Organların uyumlu birlikteliği" },
  { id: "organism", label: "Organizma", icon: "●", note: "Sistemlerin oluşturduğu canlı" },
];

const scenarios = [
  { label: "Kas hücresi", type: "Hücre", detail: "Kasılıp gevşeyerek hareketi sağlayan özelleşmiş canlı birimidir." },
  { label: "Kas dokusu", type: "Doku", detail: "Benzer görevdeki çok sayıda kas hücresi birlikte çalışır." },
  { label: "Kalp", type: "Organ", detail: "Kas dokusu başta olmak üzere farklı dokulardan oluşur." },
  { label: "Dolaşım sistemi", type: "Sistem", detail: "Kalp ve damarlar aynı görev için birlikte çalışır." },
];

const learningContext = {
  outcome: "FB.5.3.1.2",
  skill: "KB2.13 • Yapılandırma",
  bridge: "Bir binanın tuğlalardan oluşması gibi canlılar da hücrelerden oluşur.",
};

const studentOverview = [
  { name: "Ece Yılmaz", className: "5-A", progress: 75, correct: 18, wrong: 4, time: "42 dk", need: "Doku–organ ayrımı" },
  { name: "Arda Demir", className: "5-A", progress: 62, correct: 14, wrong: 7, time: "35 dk", need: "Hücrenin bölümleri" },
  { name: "Elif Kaya", className: "5-B", progress: 90, correct: 22, wrong: 2, time: "51 dk", need: "Pekiştirme önerilir" },
  { name: "Mert Can", className: "5-B", progress: 48, correct: 10, wrong: 9, time: "28 dk", need: "Sistem–organizma ilişkisi" },
];

export default function Home() {
  const [view, setView] = useState<"login" | "teacher" | "student">("login");
  const [loginRole, setLoginRole] = useState<"teacher" | "student">("teacher");
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [stageIndex, setStageIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState("Merhaba Ece! Önce bildiklerinle yeni model arasında bağ kuralım: Bir bina tuğlalardan oluşuyorsa canlılar hangi küçük birimlerden oluşur?");
  const [done, setDone] = useState<string[]>([]);
  const [mascotOpen, setMascotOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);

    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    fetch("/api/auth/me").then(async (response) => {
      if (!response.ok) return;
      const data = await response.json() as { role?: "teacher" | "student" };
      if (data.role) setView(data.role);
    }).finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (view !== "login" || loginRole !== "teacher") return;
    const clientId = "930827221578-0ealr6tjbtrc624tivunu6r24s9p3q3e.apps.googleusercontent.com";
    const renderGoogle = () => {
      const google = (window as unknown as { google?: { accounts: { id: { initialize: (config: unknown) => void; renderButton: (element: HTMLElement, config: unknown) => void } } } }).google;
      const target = document.getElementById("google-teacher-login");
      if (!google || !target) return;
      google.accounts.id.initialize({ client_id: clientId, callback: async ({ credential }: { credential: string }) => {
        const response = await fetch("/api/auth/google", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ credential }) });
        const data = await response.json() as { error?: string };
        if (!response.ok) return setLoginError(data.error || "Google girişi başarısız.");
        setView("teacher");
      } });
      target.replaceChildren();
      google.accounts.id.renderButton(target, { theme: "outline", size: "large", width: 320, text: "continue_with" });
    };
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) renderGoogle();
    else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = renderGoogle;
      document.head.appendChild(script);
    }
  }, [view, loginRole]);

  async function submitLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoginError("");
    const endpoint = loginRole === "teacher" ? "/api/auth/teacher" : "/api/auth/student";
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    const data = await response.json() as { error?: string };
    if (!response.ok) return setLoginError(data.error || "Giriş yapılamadı.");
    setView(loginRole);
    setUsername("");
    setPassword("");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setView("login");
  }

  async function installApp() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setInstallPrompt(null);
      return;
    }
    setMessage("Uygulamayı yüklemek için tarayıcı menüsünden ‘Uygulamayı yükle’ veya ‘Ana ekrana ekle’ seçeneğine dokunabilirsin.");
    setMascotOpen(true);
  }

  const question = scenarios[questionIndex];
  const progress = useMemo(() => Math.round((done.length / scenarios.length) * 100), [done]);

  function choose(label: string) {
    if (isCorrect || completed) return;
    setSelected(label);
    if (label === question.type) {
      setIsCorrect(true);
      setMessage(`Harika gözlem! ${question.detail} Şimdi modelde bir sonraki halkayı inceleyelim.`);
      setMascotOpen(true);
      setDone((items) => items.includes(question.label) ? items : [...items, question.label]);
    } else {
      setAttempts((value) => value + 1);
      const hint = attempts === 0
        ? `İpucu: Önce yapılar arasındaki hiyerarşiyi ortaya çıkaralım. “${question.label}” tek bir canlı birimi mi, yoksa benzer yapıların bir araya gelmesiyle mi oluşuyor?`
        : `Köprü kurma örneği: Bir duvar tek tuğla değildir. Benzer çok sayıda tuğla yan yana gelince duvar oluşur. ${question.label} bu örnekte hangisine benziyor?`;
      setMessage(hint);
      setMascotOpen(true);
    }
  }

  function next() {
    if (!isCorrect || completed) return;
    if (questionIndex === scenarios.length - 1) {
      setCompleted(true);
      setMessage("Etkinliği tamamladın! Dört örneği de doğru yapı basamağıyla eşleştirdin. Öğretmenin ilerlemeni görebilir.");
      setMascotOpen(true);
      return;
    }
    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
    setStageIndex(nextIndex);
    setSelected(null);
    setAttempts(0);
    setIsCorrect(false);
    setMascotOpen(false);
    setMessage("Yeni bir canlılık örneği geliyor. Önce modeldeki yerini tahmin et!");
  }

  if (authLoading) return <main className="auth-screen"><div className="auth-card"><div className="brand-mark">M</div><h1>ModAi hazırlanıyor…</h1></div></main>;

  if (view === "login") return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-brand"><span className="brand-mark">M</span><div><b>MODAI</b><small>FEN ÖĞRENME PLATFORMU</small></div></div>
        <p className="auth-kicker">HOŞ GELDİNİZ</p><h1>Hesabınıza giriş yapın</h1><p className="auth-intro">Öğretmen paneline veya size özel öğrenci alanına güvenle devam edin.</p>
        <div className="role-tabs"><button className={loginRole === "teacher" ? "active" : ""} onClick={() => { setLoginRole("teacher"); setLoginError(""); }}>Öğretmen</button><button className={loginRole === "student" ? "active" : ""} onClick={() => { setLoginRole("student"); setLoginError(""); }}>Öğrenci</button></div>
        {loginRole === "teacher" && <><div id="google-teacher-login" className="google-login" /><div className="auth-divider"><span>veya kullanıcı adıyla</span></div></>}
        <form className="auth-form" onSubmit={submitLogin}><label>Kullanıcı adı<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" placeholder={loginRole === "teacher" ? "Örn. Sedahoca" : "Öğretmeninizin verdiği kullanıcı adı"} required /></label><label>Şifre<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" placeholder="Şifreniz" required /></label>{loginError && <p className="auth-error">{loginError}</p>}<button className="auth-submit" type="submit">{loginRole === "teacher" ? "Öğretmen paneline gir" : "Derse başla"}</button></form>
        <small className="auth-help">Öğrenci hesapları öğretmen tarafından oluşturulur.</small>
      </section>
      <aside className="auth-visual"><span>5. SINIF • FEN BİLİMLERİ</span><h2>Her öğrencinin öğrenme yolculuğu görünür olsun.</h2><p>ModAi; ilerlemeyi, doğru ve yanlışları izler; öğretmene sınıf düzeyinde anlaşılır içgörüler sunar.</p><div className="auth-stats"><b>%78<small>ortalama ilerleme</small></b><b>4 sınıf<small>tek panelde</small></b></div></aside>
    </main>
  );

  if (view === "teacher") return (
    <main className="teacher-shell">
      <header className="teacher-header"><div className="auth-brand"><span className="brand-mark">M</span><div><b>MODAI</b><small>ÖĞRETMEN PANELİ</small></div></div><div><span>Seda Hoca</span><button onClick={logout}>Çıkış yap</button></div></header>
      <div className="teacher-layout"><aside className="teacher-nav"><button className="active">Genel bakış</button><button>Sınıflarım</button><button>Öğrenciler</button><button>İçerik yönetimi</button><button>Bildirim gönder</button></aside><section className="teacher-main"><div className="teacher-title"><div><p>7 AĞUSTOS 2026</p><h1>Öğrenci ilerleme merkezi</h1><span>Tüm sınıflarını ve öğrencilerinin ihtiyaçlarını tek ekrandan izle.</span></div><button>+ Yeni sınıf oluştur</button></div><div className="metric-grid"><article><span>Toplam öğrenci</span><b>48</b><small>4 sınıfta</small></article><article><span>Ortalama ilerleme</span><b>%69</b><small>Bu hafta +%8</small></article><article><span>Tamamlanan etkinlik</span><b>126</b><small>Son 7 gün</small></article><article><span>Desteğe ihtiyaç duyan</span><b>7</b><small>İncelenmeli</small></article></div><div className="teacher-section"><div className="section-head"><div><h2>Öğrenci durumu</h2><p>Doğru, yanlış, süre ve ihtiyaç duyulan konular</p></div><select aria-label="Sınıf seç"><option>Tüm sınıflar</option><option>5-A</option><option>5-B</option></select></div><div className="student-table"><div className="table-row table-head"><span>Öğrenci</span><span>İlerleme</span><span>Doğru / Yanlış</span><span>Çalışma</span><span>ModAi gözlemi</span></div>{studentOverview.map((student) => <div className="table-row" key={student.name}><span><b>{student.name}</b><small>{student.className}</small></span><span><i><em style={{ width: `${student.progress}%` }} /></i><b>%{student.progress}</b></span><span><b className="ok">{student.correct}</b> / <b className="bad">{student.wrong}</b></span><span>{student.time}</span><span>{student.need}<button>Ayrıntı</button></span></div>)}</div></div></section></div>
    </main>
  );

  return (
    <main className={`app-shell ${mascotOpen ? "assistant-open" : ""}`}>
      <header className="topbar">
        <a className="brand" href="#" aria-label="ModAi Fen ana sayfa">
          <span className="brand-mark">M</span>
          <span><b>MODAI</b><small>FEN</small></span>
        </a>
        <div className="lesson-title"><span>5. SINIF • 3. ÜNİTE</span><strong>Canlıların Yapısına Yolculuk</strong></div>
        <div className="student"><button className="install-button" onClick={installApp} disabled={isInstalled}>{isInstalled ? "Yüklendi" : "Uygulamayı yükle"}</button><span className="student-avatar">E</span><span><b>Ece Yılmaz</b><small>5-A Sınıfı</small></span><button aria-label="Öğrenci menüsünü aç">⌄</button></div>
      </header>

      <section className="lesson-bar">
        <div><span className="live-dot" /> <b>Öğretmen yönlendirmesi</b><p>2. Etkinlik: Yapı basamaklarını keşfet</p></div>
        <div className="progress-wrap"><span>{progress}% tamamlandı</span><div className="progress"><i style={{ width: `${progress}%` }} /></div></div>
      </section>

      <div className="workspace">
        <aside className="sidebar">
          <p className="eyebrow">DERS AKIŞI</p>
          {[
            ["✓", "Canlıları Tanıyalım", "Tamamlandı"],
            ["02", "Yapı Basamakları", "Şimdi buradasın"],
            ["03", "Hücrenin Bölümleri", "Sıradaki"],
            ["04", "Bitki ve Hayvan Hücresi", "Kilitli"],
            ["05", "Kendini Değerlendir", "Kilitli"],
          ].map((item, index) => <button key={item[1]} className={`nav-item ${index === 1 ? "active" : ""} ${index > 2 ? "locked" : ""}`}><span>{item[0]}</span><div><b>{item[1]}</b><small>{item[2]}</small></div></button>)}
          <div className="teacher-note"><span>ÖĞRETMEN NOTU</span><p>“Önce modeli inceleyin. Kartları cevaplamadan birbirinizle tartışın.”</p><b>— Ayşe Öğretmen</b></div>
        </aside>

        <section className="content">
          <div className="intro"><div><p className="eyebrow">ETKİLEŞİMLİ MODEL</p><h1>Küçükten büyüğe,<br /><em>canlılığın basamakları</em></h1><p>Bir canlının oluşumunda yapılar nasıl bir araya geliyor? Basamaklara dokun, bağlantıyı keşfet.</p></div><div className="goal"><span>🎯</span><div><small>ÖĞRENME HEDEFİ • {learningContext.outcome}</small><b>Hücre–doku–organ–sistem–organizma kavramlarını yapılandırır.</b><em>{learningContext.skill}</em></div></div></div>

          <div className="model-card">
            <div className="model-top"><span>Model üzerinde incele</span><small>Bir basamağa dokun</small></div>
            <div className="stage-row">
              {stages.map((stage, index) => <div className="stage-wrap" key={stage.id}>
                <button className={`stage ${stageIndex === index ? "selected" : ""}`} onClick={() => setStageIndex(index)} aria-label={`${stage.label} basamağını incele`}><span className={`stage-icon s${index}`}>{stage.icon}</span><b>{stage.label}</b><small>{stage.note}</small></button>
                {index < stages.length - 1 && <span className="arrow">→</span>}
              </div>)}
            </div>
            <div className="explain"><span className="explain-icon">{stages[stageIndex].icon}</span><div><small>{stages[stageIndex].label.toUpperCase()} BASAMAĞI</small><p><b>{stages[stageIndex].label}</b>, {stages[stageIndex].note.toLocaleLowerCase("tr-TR")}. Her basamak bir öncekinden oluşur ve canlılığın devamı için birlikte çalışır.</p></div></div>
          </div>

          <div className="challenge">
            <div className="challenge-copy"><span className="question-no">SORU {questionIndex + 1}/{scenarios.length}</span><h2>“{question.label}” hangi yapı basamağıdır?</h2><p>{isCorrect ? "Doğru cevap! Şimdi sonraki örneğe ilerleyebilirsin." : "Modeli incele ve en uygun seçeneği işaretle."}</p><div className="answers">{["Hücre", "Doku", "Organ", "Sistem"].map((answer) => <button key={answer} disabled={isCorrect || completed} onClick={() => choose(answer)} className={`${selected === answer ? "picked" : ""} ${selected === answer && answer === question.type ? "correct" : ""} ${selected === answer && answer !== question.type ? "wrong" : ""}`}>{answer}<span>{selected === answer ? (answer === question.type ? "✓" : "×") : ""}</span></button>)}</div></div>
            <div className="example-card"><div className="mini-cells"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><b>{question.label}</b><small>Yakından görünüm • Temsili model</small></div>
          </div>
          <button className="next-button" onClick={next} disabled={!isCorrect || completed}>{completed ? "Etkinlik tamamlandı" : isCorrect && questionIndex === scenarios.length - 1 ? "Etkinliği tamamla" : isCorrect ? "Sonraki örnek" : "İlerlemek için doğru cevabı bul"} {!completed && <span>→</span>}</button>
        </section>
      </div>

      <section className={`mascot-bar ${mascotOpen ? "open" : "compact"}`} aria-live="polite">
        <button className="mascot-toggle" onClick={() => setMascotOpen((value) => !value)} aria-label={mascotOpen ? "Asistanı küçült" : "Asistanı aç"} aria-expanded={mascotOpen}>
          <span className="mascot"><span className="antenna" /><span className="face"><i /><i /><span>⌣</span></span></span>
          {!mascotOpen && <span className="mascot-dot">1</span>}
        </button>
        {mascotOpen && <>
          <div className="mascot-copy"><span className="ai-badge">MODAI</span><p>{message}</p></div>
          <div className="mascot-actions"><button onClick={() => setMessage(`Köprü kurma örneği: ${learningContext.bridge} Tek hücre bir tuğlaya, benzer hücrelerin oluşturduğu doku ise duvara benzetilebilir. Şimdi organın binadaki karşılığını sen düşün.`)}>Örnek ver</button><button className="sound" aria-label="Maskot mesajını seslendir">♫</button><button className="close-mascot" onClick={() => setMascotOpen(false)} aria-label="Asistanı küçült">×</button></div>
        </>}
      </section>
    </main>
  );
}

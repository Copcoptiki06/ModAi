"use client";

import { useMemo, useState } from "react";

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

export default function Home() {
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("Merhaba Ece! Hazırsan en küçük yapı biriminden başlayalım.");
  const [done, setDone] = useState<string[]>([]);

  const question = scenarios[active % scenarios.length];
  const progress = useMemo(() => Math.min(100, 24 + done.length * 14), [done]);

  function choose(label: string) {
    setSelected(label);
    if (label === question.type) {
      setMessage(`Harika gözlem! ${question.detail} Şimdi modelde bir sonraki halkayı inceleyelim.`);
      setDone((items) => items.includes(question.label) ? items : [...items, question.label]);
    } else {
      setAttempts((value) => value + 1);
      const hint = attempts === 0
        ? `Küçük bir ipucu: “${question.label}” tek bir canlı birimi mi, yoksa benzer yapıların bir araya gelmesiyle mi oluşuyor?`
        : `Somut düşünelim: Bir duvar tek tuğla değildir. Benzer çok sayıda tuğla yan yana gelince duvar oluşur. ${question.label} bu örnekte hangisine benziyor?`;
      setMessage(hint);
    }
  }

  function next() {
    setActive((value) => (value + 1) % scenarios.length);
    setSelected(null);
    setAttempts(0);
    setMessage("Yeni bir canlılık örneği geliyor. Önce modeldeki yerini tahmin et!");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Marif Model Fen ana sayfa">
          <span className="brand-mark">M</span>
          <span><b>MARİF</b><small>MODEL FEN</small></span>
        </a>
        <div className="lesson-title"><span>5. SINIF • 3. ÜNİTE</span><strong>Canlıların Yapısına Yolculuk</strong></div>
        <div className="student"><span className="student-avatar">E</span><span><b>Ece Yılmaz</b><small>5-A Sınıfı</small></span><button aria-label="Öğrenci menüsünü aç">⌄</button></div>
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
          <div className="intro"><div><p className="eyebrow">ETKİLEŞİMLİ MODEL</p><h1>Küçükten büyüğe,<br /><em>canlılığın basamakları</em></h1><p>Bir canlının oluşumunda yapılar nasıl bir araya geliyor? Basamaklara dokun, bağlantıyı keşfet.</p></div><div className="goal"><span>🎯</span><div><small>ÖĞRENME HEDEFİ</small><b>Hücre–doku–organ–sistem–organizma ilişkisini açıklar.</b></div></div></div>

          <div className="model-card">
            <div className="model-top"><span>Model üzerinde incele</span><small>Bir basamağa dokun</small></div>
            <div className="stage-row">
              {stages.map((stage, index) => <div className="stage-wrap" key={stage.id}>
                <button className={`stage ${active === index ? "selected" : ""}`} onClick={() => setActive(index)} aria-label={`${stage.label} basamağını incele`}><span className={`stage-icon s${index}`}>{stage.icon}</span><b>{stage.label}</b><small>{stage.note}</small></button>
                {index < stages.length - 1 && <span className="arrow">→</span>}
              </div>)}
            </div>
            <div className="explain"><span className="explain-icon">{stages[active].icon}</span><div><small>{stages[active].label.toUpperCase()} BASAMAĞI</small><p><b>{stages[active].label}</b>, {stages[active].note.toLocaleLowerCase("tr-TR")}. Her basamak bir öncekinden oluşur ve canlılığın devamı için birlikte çalışır.</p></div></div>
          </div>

          <div className="challenge">
            <div className="challenge-copy"><span className="question-no">SORU {active + 1}/4</span><h2>“{question.label}” hangi yapı basamağıdır?</h2><p>Modeli incele ve en uygun seçeneği işaretle.</p><div className="answers">{["Hücre", "Doku", "Organ", "Sistem"].map((answer) => <button key={answer} onClick={() => choose(answer)} className={`${selected === answer ? "picked" : ""} ${selected === answer && answer === question.type ? "correct" : ""}`}>{answer}<span>{selected === answer ? (answer === question.type ? "✓" : "×") : ""}</span></button>)}</div></div>
            <div className="example-card"><div className="mini-cells"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><b>{question.label}</b><small>Yakından görünüm • Temsili model</small></div>
          </div>
          <button className="next-button" onClick={next}>Sonraki örnek <span>→</span></button>
        </section>
      </div>

      <section className="mascot-bar" aria-live="polite">
        <div className="mascot"><div className="antenna" /><div className="face"><i /><i /><span>⌣</span></div></div>
        <div className="mascot-copy"><span className="ai-badge">MİRA • ÖĞRENME ASİSTANI</span><p>{message}</p></div>
        <div className="mascot-actions"><button onClick={() => setMessage(`Örnek: Tek bir kas hücresi bir oyuncuya; kas dokusu ise aynı görevi yapan oyunculardan oluşan bir takıma benzer.`)}>Bir örnek ver</button><button className="sound" aria-label="Maskot mesajını seslendir">♫</button></div>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { curriculumVisualInventory } from "../data/curriculum-visual-inventory";
import "./model-labs.css";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const stages = [
  { id: "medium-one", label: "Ortam 1", icon: "☀", note: "Işığın geldiği saydam ortam" },
  { id: "normal", label: "Normal", icon: "⊥", note: "Yüzeye dik çizilen referans çizgisi" },
  { id: "incident", label: "Gelme açısı", icon: "∠", note: "Gelen ışın ile normal arasındaki açı" },
  { id: "refraction", label: "Kırılma açısı", icon: "↘", note: "Kırılan ışın ile normal arasındaki açı" },
  { id: "medium-two", label: "Ortam 2", icon: "◇", note: "Işığın geçtiği yeni saydam ortam" },
];

const scenarios = [
  { label: "Havadan cama eğik gelen ışık", type: "Normale yaklaşır", detail: "Işık az yoğun ortamdan çok yoğun ortama geçerken normale yaklaşarak kırılır." },
  { label: "Camdan havaya eğik çıkan ışık", type: "Normalden uzaklaşır", detail: "Işık çok yoğun ortamdan az yoğun ortama geçerken normalden uzaklaşarak kırılır." },
  { label: "Yüzeye dik gelen ışık", type: "Doğrultusu değişmez", detail: "Işık normale paralel geldiğinde hızı değişse de doğrultusu değişmeden ilerler." },
  { label: "Camdan havaya sınır açısından büyük açıyla gelen ışık", type: "Yansıyarak geri döner", detail: "Gelme açısı sınır açısından büyükse tam yansıma gerçekleşir ve ışık ikinci ortama geçmez." },
];

const learningContext = {
  outcome: "7. SINIF • IŞIĞIN KIRILMASI",
  skill: "Gözlem • Modelleme • Çıkarım",
  bridge: "Bir bisikletin bir tekeri kuma girince yön değiştirmesi gibi ışık da farklı bir ortama eğik girerken yön değiştirir.",
};

const studentOverview = [
  { name: "Ece Yılmaz", className: "7-A", progress: 75, correct: 18, wrong: 4, time: "42 dk", need: "Normal ve gelme açısı" },
  { name: "Arda Demir", className: "7-A", progress: 62, correct: 14, wrong: 7, time: "35 dk", need: "Yoğun ortam geçişi" },
  { name: "Elif Kaya", className: "7-B", progress: 90, correct: 22, wrong: 2, time: "51 dk", need: "Tam yansıma pekiştirmesi" },
  { name: "Mert Can", className: "7-B", progress: 48, correct: 10, wrong: 9, time: "28 dk", need: "Kırılma yönü" },
];

const topicInsights = [
  { topic: "Normal ile yüzeyi karıştırma", students: 14, rate: 29 },
  { topic: "Yoğun ortama geçişte kırılma yönü", students: 11, rate: 23 },
  { topic: "Gelme açısını yüzeye göre ölçme", students: 9, rate: 19 },
  { topic: "Tam yansıma ve sınır açısı", students: 7, rate: 15 },
];

const aiUsage = [
  { name: "Ece Yılmaz", uses: 8, benefit: 75, afterHelp: "6/8 doğru", focus: "Normal çizgisi" },
  { name: "Arda Demir", uses: 14, benefit: 64, afterHelp: "9/14 doğru", focus: "Ortam yoğunluğu" },
  { name: "Elif Kaya", uses: 4, benefit: 100, afterHelp: "4/4 doğru", focus: "Tam yansıma" },
  { name: "Mert Can", uses: 17, benefit: 47, afterHelp: "8/17 doğru", focus: "Kırılma yönü" },
];

const activityLogs = [
  { time: "10:42", student: "Ece Yılmaz", event: "ModAi ipucu istedi", detail: "Normal çizgisini bulma", result: "Sonraki deneme doğru" },
  { time: "10:38", student: "Mert Can", event: "Yanlış cevap", detail: "Camdan havaya geçiş", result: "2. ipucu gösterildi" },
  { time: "10:31", student: "Arda Demir", event: "Etkinlik tamamladı", detail: "Işığın kırılması • 4 soru", result: "%75 başarı" },
  { time: "10:24", student: "Elif Kaya", event: "ModAi örneği açtı", detail: "Bisiklet–kum benzetmesi", result: "18 sn inceledi" },
  { time: "10:17", student: "Mert Can", event: "Aynı hatayı tekrarladı", detail: "Normale yaklaşma", result: "Öğretmen uyarısı önerildi" },
];

const adminQuestions = [
  { type: "Çoktan seçmeli", title: "Işık havadan cama geçerken nasıl kırılır?", grade: "7. sınıf", unit: "Işığın Kırılması", status: "Yayında", visual: true },
  { type: "Doğru / Yanlış", title: "Normal çizgisi yüzeye diktir.", grade: "7. sınıf", unit: "Işığın Kırılması", status: "Yayında", visual: false },
  { type: "Açık uçlu", title: "Sudaki kalemin kırılmış görünmesini açıkla.", grade: "7. sınıf", unit: "Işığın Kırılması", status: "Taslak", visual: true },
];

const builtInScienceImages = [
  { key:"plant-cell", name:"Bitki hücresi", grade:"5. sınıf", unit:"Canlıların Yapısına Yolculuk", url:"/question-images/plant-cell.png" },
  { key:"refraction", name:"Işığın kırılması", grade:"7. sınıf", unit:"Işığın Kırılması", url:"/question-images/refraction-air-glass.png" },
  { key:"cell-hierarchy", name:"Hücre–doku–organ–sistem–organizma", grade:"5. sınıf", unit:"Canlıların Yapısına Yolculuk", url:"/question-images/cell-hierarchy.png" },
  { key:"solar-system", name:"Güneş sistemi genel görünümü", grade:"6. sınıf", unit:"Güneş Sistemi ve Tutulmalar", url:"/question-images/solar-system.png" },
  { key:"mercury", name:"Merkür", grade:"6. sınıf", unit:"Güneş Sistemi ve Tutulmalar", url:"/question-images/mercury.png" },
  { key:"venus", name:"Venüs", grade:"6. sınıf", unit:"Güneş Sistemi ve Tutulmalar", url:"/question-images/venus.png" },
  { key:"earth", name:"Dünya", grade:"6. sınıf", unit:"Güneş Sistemi ve Tutulmalar", url:"/question-images/earth.png" },
  { key:"mars", name:"Mars", grade:"6. sınıf", unit:"Güneş Sistemi ve Tutulmalar", url:"/question-images/mars.png" },
  { key:"jupiter", name:"Jüpiter", grade:"6. sınıf", unit:"Güneş Sistemi ve Tutulmalar", url:"/question-images/jupiter.png" },
  { key:"saturn", name:"Satürn", grade:"6. sınıf", unit:"Güneş Sistemi ve Tutulmalar", url:"/question-images/saturn.png" },
  { key:"uranus", name:"Uranüs", grade:"6. sınıf", unit:"Güneş Sistemi ve Tutulmalar", url:"/question-images/uranus.png" },
  { key:"neptune", name:"Neptün", grade:"6. sınıf", unit:"Güneş Sistemi ve Tutulmalar", url:"/question-images/neptune.png" },
  { key:"electric-circuit", name:"Kurulu basit elektrik devresi", grade:"5. sınıf", unit:"Yaşamımızdaki Elektrik", url:"/question-images/electric-circuit.png" },
  { key:"bulb", name:"Lamba (ampul)", grade:"5. sınıf", unit:"Yaşamımızdaki Elektrik", url:"/question-images/bulb.png" },
  { key:"lamp-holder", name:"Duy", grade:"5. sınıf", unit:"Yaşamımızdaki Elektrik", url:"/question-images/lamp-holder.png" },
  { key:"battery", name:"Pil", grade:"5. sınıf", unit:"Yaşamımızdaki Elektrik", url:"/question-images/battery.png" },
  { key:"open-switch", name:"Açık anahtar", grade:"5. sınıf", unit:"Yaşamımızdaki Elektrik", url:"/question-images/open-switch.png" },
  { key:"open-circuit", name:"Açık devre", grade:"5. sınıf", unit:"Yaşamımızdaki Elektrik", url:"/question-images/open-circuit.png" },
  { key:"closed-circuit", name:"Kapalı devre", grade:"5. sınıf", unit:"Yaşamımızdaki Elektrik", url:"/question-images/closed-circuit.png" },
];

const opticsScienceImages = [
  ["Normal","normal"], ["Gelme açısı","incidence-angle"], ["Kırılma açısı","refraction-angle"],
  ["Az yoğundan çok yoğuna geçiş","air-to-glass"], ["Çok yoğundan az yoğuna geçiş","glass-to-air"],
  ["İnce kenarlı mercek","convex-lens"], ["Kalın kenarlı mercek","concave-lens"], ["Odak noktası","focal-point"],
  ["Büyüteç","magnifier"], ["Gözlük","eyeglasses"], ["Kamera","camera"], ["Teleskop","telescope"],
].map(([name,file])=>({key:`verified-${file}`,name,grade:"7. sınıf",unit:"Işığın Kırılması ve Mercekler",url:`/question-images/variants/verified/${file}-card.webp`}));

const skyScienceImages = [
  ["Güneş yapısı","sun-structure"], ["Güneş'in dönmesi","sun-rotation"], ["Ay yüzeyi","moon-surface"],
  ["Ay'ın dönmesi","moon-rotation"], ["Ay'ın dolanması","moon-orbit"], ["Ay'ın ana evreleri","moon-main-phases"],
  ["Ay'ın ara evreleri","moon-intermediate-phases"], ["Güneş-Dünya-Ay hareket modeli","sun-earth-moon-motion"],
  ["Güneş-Dünya-Ay büyüklük karşılaştırması","sun-earth-moon-scale"],
].map(([name,file])=>({key:`verified-${file}`,name,grade:"5. sınıf",unit:"Gökyüzündeki Komşularımız ve Biz",url:`/question-images/variants/verified/grade5-sky/${file}-card.webp`}));

const forceScienceImages = [
  ["Kuvvet yönü","force-direction"], ["Kuvvet büyüklüğü","force-magnitude"], ["Dinamometre","dynamometer"],
  ["Dinamometre ölçeği","dynamometer-scale"], ["Kütle","mass"], ["Ağırlık","weight"], ["Yer çekimi","gravity"],
  ["Sürtünme kuvveti","friction"], ["Hava direnci","air-resistance"], ["Su direnci","water-resistance"],
  ["Sürtünmeyi artırma","increase-friction"], ["Sürtünmeyi azaltma","reduce-friction"],
].map(([name,file])=>({key:`verified-${file}`,name,grade:"5. sınıf",unit:"Kuvveti Tanıyalım",url:`/question-images/variants/verified/grade5-force/${file}-card.webp`}));

const cellScienceImages = [
  ["Hayvan hücresi","animal-cell"], ["Hücre zarı","cell-membrane"], ["Sitoplazma","cytoplasm"],
  ["Çekirdek","cell-nucleus"], ["Kemik","bone"], ["Eklem","joint"], ["Kas","muscle"],
  ["İskelet modeli","skeleton"], ["Destek ve hareket sistemi sağlığı","movement-health"],
].map(([name,file])=>({key:`verified-${file}`,name,grade:"5. sınıf",unit:"Canlıların Yapısına Yolculuk",url:`/question-images/variants/verified/grade5-cell/${file}-card.webp`}));

const lightScienceImages = [
  ["Noktasal ışık kaynağı","point-light-source"], ["Işığın doğrusal yayılması","straight-line-light"],
  ["Saydam madde","transparent-material"], ["Yarı saydam madde","translucent-material"], ["Opak madde","opaque-material"],
  ["Tam gölge","umbra"], ["Gölge boyu","shadow-length"], ["Işık kaynağı-cisim-perde modeli","source-object-screen"],
].map(([name,file])=>({key:`verified-${file}`,name,grade:"5. sınıf",unit:"Işığın Dünyası",url:`/question-images/variants/verified/grade5-light/${file}-card.webp`}));

const matterScienceImages = [
  ["Katı tanecik modeli","solid-particles"], ["Sıvı tanecik modeli","liquid-particles"], ["Gaz tanecik modeli","gas-particles"],
  ["Isı","heat-energy"], ["Sıcaklık","temperature"], ["Termometre","thermometer"], ["Isı alışverişi","heat-exchange"],
  ["Erime","melting"], ["Donma","freezing"], ["Buharlaşma","evaporation"], ["Yoğuşma","condensation"],
  ["Isı iletkeni","heat-conductor"], ["Isı yalıtkanı","heat-insulator"], ["Isı yalıtım modeli","insulation-model"],
].map(([name,file])=>({key:`verified-${file}`,name,grade:"5. sınıf",unit:"Maddenin Doğası",url:`/question-images/variants/verified/grade5-matter/${file}-card.webp`}));

const electricityScienceImages = [
  ["Bağlantı kablosu","connection-wire"], ["Devre sembolleri","circuit-symbols"],
  ["Kapalı devre şeması","circuit-diagram-closed"], ["Pil sayısı ve lamba parlaklığı","battery-brightness"],
  ["Lamba sayısı ve parlaklık","lamp-brightness"],
].map(([name,file])=>({key:`verified-${file}`,name,grade:"5. sınıf",unit:"Yaşamımızdaki Elektrik",url:`/question-images/variants/verified/grade5-electricity/${file}-card.webp`}));

const recyclingScienceImages = [
  ["Kağıt atık","paper-waste"], ["Cam atık","glass-waste"], ["Metal atık","metal-waste"],
  ["Plastik atık","plastic-waste"], ["Organik atık","organic-waste"], ["Elektronik atık","electronic-waste"],
  ["Geri dönüşüm kutuları","recycling-bins"], ["Yeniden kullanım","reuse"], ["İleri dönüşüm","upcycling"],
  ["Atık yönetimi akış şeması","waste-flow"],
].map(([name,file])=>({key:`verified-${file}`,name,grade:"5. sınıf",unit:"Sürdürülebilir Yaşam ve Geri Dönüşüm",url:`/question-images/variants/verified/grade5-recycling/${file}-card.webp`}));

const grade6SolarScienceImages = [
  ["İç gezegenler","inner-planets"], ["Dış gezegenler","outer-planets"], ["Asteroit kuşağı","asteroid-belt"],
  ["Güneş tutulması","solar-eclipse"], ["Ay tutulması","lunar-eclipse"],
].map(([name,file])=>({key:`verified-grade6-${file}`,name,grade:"6. sınıf",unit:"Güneş Sistemi ve Tutulmalar",url:`/question-images/variants/verified/grade6-solar/${file}-card.webp`}));

const grade6MotionScienceImages = [
  ["Aynı yönlü kuvvetler","same-direction-forces"], ["Zıt yönlü kuvvetler","opposite-forces"],
  ["Bileşke kuvvet","resultant-force"], ["Dengelenmiş kuvvet","balanced-force"],
  ["Dengelenmemiş kuvvet","unbalanced-force"], ["Sürat","speed"], ["Hız","velocity"],
  ["Yol-zaman grafiği","distance-time-graph"],
].map(([name,file])=>({key:`verified-grade6-${file}`,name,grade:"6. sınıf",unit:"Kuvvetin Etkisinde Hareket",url:`/question-images/variants/verified/grade6-motion/${file}-card.webp`}));

const grade6LivingSystemsScienceImages = [
  ["Eşeyli üreme","sexual-reproduction"], ["Eşeysiz üreme","asexual-reproduction"],
  ["Çiçeğin kısımları","flower-parts"], ["Tozlaşma","pollination"], ["Döllenme","fertilization"],
  ["Tohum","seed"], ["Çimlenme","germination"], ["Başkalaşım","metamorphosis"],
  ["İnsan üreme sistemi","human-reproductive-system"], ["Beyin","brain"], ["Omurilik","spinal-cord"],
  ["Sinirler","peripheral-nerves"], ["İç salgı bezleri","endocrine-glands"], ["Ergenlik değişimleri","puberty-changes"],
].map(([name,file])=>({key:`verified-grade6-${file}`,name,grade:"6. sınıf",unit:"Canlılarda Sistemler",url:`/question-images/variants/verified/grade6-living-systems/${file}-card.webp`}));

const grade6ReflectionColorsScienceImages = [
  ["Düzgün yansıma","regular-reflection"], ["Dağınık yansıma","diffuse-reflection"],
  ["Gelen ışın","incident-ray"], ["Yansıyan ışın","reflected-ray"], ["Normal","normal-line"],
  ["Düz ayna","plane-mirror"], ["Çukur ayna","concave-mirror"], ["Tümsek ayna","convex-mirror"],
  ["Işığın soğurulması","light-absorption"], ["Beyaz ışık tayfı","white-light-spectrum"],
  ["Renkli cisimlerin görünmesi","colored-object-appearance"], ["Güneş enerjisi uygulamaları","solar-energy-applications"],
].map(([name,file])=>({key:`verified-grade6-${file}`,name,grade:"6. sınıf",unit:"Işığın Yansıması ve Renkler",url:`/question-images/variants/verified/grade6-reflection-colors/${file}-card.webp`}));

const grade6DistinguishingMatterScienceImages = [
  ["Genleşme","expansion"], ["Büzülme","contraction"], ["Erime noktası","melting-point"], ["Donma noktası","freezing-point"],
  ["Kaynama noktası","boiling-point"], ["Kütle-hacim","mass-volume"], ["Yoğunluk","density"], ["Yoğunluk kabı","density-container"],
  ["Buzun suda yüzmesi","ice-floating"], ["Yoğunluk modeli","density-model"],
].map(([name,file])=>({key:`verified-grade6-${file}`,name,grade:"6. sınıf",unit:"Maddenin Ayırt Edici Özellikleri",url:`/question-images/variants/verified/grade6-distinguishing-matter/${file}-card.webp`}));

const grade6ElectricConductionScienceImages = [
  ["İletken madde","conductor"], ["Yalıtkan madde","insulator"], ["İletkenlik deney düzeneği","conductivity-test"],
  ["Direnç","resistance"], ["Tel uzunluğu","wire-length"], ["Tel kalınlığı","wire-thickness"], ["Tel cinsi","wire-material"],
  ["Ayarlanabilir direnç","variable-resistor"], ["Parlaklık değişimi","brightness-change"],
].map(([name,file])=>({key:`verified-grade6-${file}`,name,grade:"6. sınıf",unit:"Elektriğin İletimi ve Direnç",url:`/question-images/variants/verified/grade6-electric-conduction/${file}-card.webp`}));

const grade6SustainableInteractionScienceImages = [
  ["Biyoçeşitlilik","biodiversity"], ["Habitat","habitat"], ["Nesli tehlikedeki canlı","endangered-species"],
  ["İstilacı tür","invasive-species"], ["Hava kirliliği","air-pollution"], ["Yakıt türleri","fuel-types"],
  ["Çevre problemi","environmental-problem"], ["Çözüm modeli","solution-model"],
].map(([name,file])=>({key:`verified-grade6-${file}`,name,grade:"6. sınıf",unit:"Sürdürülebilir Yaşam ve Etkileşim",url:`/question-images/variants/verified/grade6-sustainable-interaction/${file}-card.webp`}));

const grade7SpaceAgeScienceImages = [
  ["Roket","rocket"], ["Yapay uydu","artificial-satellite"], ["Uzay sondası","space-probe"],
  ["Uzay istasyonu","space-station"], ["Uzay teleskobu","space-telescope"],
  ["Optik teleskop","optical-telescope"], ["Radyo teleskop","radio-telescope"],
  ["Uzay kirliliği","space-debris"], ["Yıldız oluşumu","star-formation"],
  ["Yıldız yaşam döngüsü","star-life-cycle"], ["Galaksi","galaxy"], ["Evren","universe"],
].map(([name,file])=>({key:`verified-grade7-${file}`,name,grade:"7. sınıf",unit:"Uzay Çağı",url:`/question-images/variants/verified/grade7-space-age/${file}-card.webp`}));

const grade7ForceEnergyScienceImages = [
  ["Fiziksel iş","physical-work"], ["Kuvvet-yol ilişkisi","force-distance"],
  ["Kinetik enerji","kinetic-energy"], ["Çekim potansiyel enerjisi","gravitational-potential"],
  ["Esneklik potansiyel enerjisi","elastic-potential"], ["Enerji dönüşümü","energy-transformation"],
  ["Enerjinin korunumu","energy-conservation"], ["Sürtünme ve enerji","friction-energy"],
].map(([name,file])=>({key:`verified-grade7-${file}`,name,grade:"7. sınıf",unit:"Kuvvet ve Enerjiyi Keşfedelim",url:`/question-images/variants/verified/grade7-force-energy/${file}-card.webp`}));

const grade7BodySystemsScienceImages = [
  ["Ağız","mouth"], ["Yutak","pharynx"], ["Yemek borusu","esophagus"], ["Mide","stomach"],
  ["İnce bağırsak","small-intestine"], ["Kalın bağırsak","large-intestine"], ["Karaciğer","liver"], ["Pankreas","pancreas"],
  ["Kalp","heart"], ["Damarlar","blood-vessels"], ["Kan hücreleri","blood-cells"], ["Akciğer","lungs"],
  ["Soluk borusu","trachea"], ["Böbrek","kidney"], ["Üreter","ureter"], ["Mesane","bladder"],
  ["Sindirim sistemi","digestive-system"], ["Dolaşım sistemi","circulatory-system"],
  ["Solunum sistemi","respiratory-system"], ["Boşaltım sistemi","urinary-system"],
].map(([name,file])=>({key:`verified-grade7-${file}`,name,grade:"7. sınıf",unit:"Vücudumuzdaki Sistemler",url:`/question-images/variants/verified/grade7-body-systems/${file}-card.webp`}));

const grade7MatterJourneyScienceImages = [
  ["Atom","atom"], ["Proton","proton"], ["Nötron","neutron"], ["Elektron","electron"],
  ["Atom modelleri","atomic-models"], ["Molekül","molecule"], ["Elektron dizilimi","electron-configuration"],
  ["Element","element"], ["Bileşik","compound"], ["İlk 18 element","first-18-elements"],
  ["Grup","group"], ["Periyot","period"], ["Homojen karışım","homogeneous-mixture"],
  ["Heterojen karışım","heterogeneous-mixture"], ["Çözünme","dissolving"], ["Eleme","sieving"],
  ["Süzme","filtration"], ["Buharlaştırma","evaporation"], ["Mıknatısla ayırma","magnetic-separation"],
  ["Damıtma","distillation"],
].map(([name,file])=>({key:`verified-grade7-${file}`,name,grade:"7. sınıf",unit:"Maddenin Doğasına Yolculuk",url:`/question-images/variants/verified/grade7-matter-journey/${file}-card.webp`}));

const grade7ElectrificationScienceImages = [
  ["Sürtünme ile elektriklenme","friction-electrification"], ["Dokunma ile elektriklenme","contact-electrification"],
  ["Etki ile elektriklenme","induction-electrification"], ["Pozitif yük","positive-charge"],
  ["Negatif yük","negative-charge"], ["Nötr cisim","neutral-object"],
  ["Aynı yüklerin itmesi","like-charges-repel"], ["Zıt yüklerin çekmesi","opposite-charges-attract"],
  ["Elektroskop","electroscope"],
].map(([name,file])=>({key:`verified-grade7-${file}`,name,grade:"7. sınıf",unit:"Elektriklenme",url:`/question-images/variants/verified/grade7-electrification/${file}-card.webp`}));

const grade7SustainableLivingScienceImages = [
  ["Üretici","producer"], ["Tüketici","consumer"], ["Ayrıştırıcı","decomposer"],
  ["Besin zinciri","food-chain"], ["Besin ağı","food-web"], ["Enerji piramidi","energy-pyramid"],
  ["Su tasarrufu","water-conservation"], ["Enerji tasarrufu","energy-conservation"],
  ["Kaynak tasarrufu","resource-conservation"],
].map(([name,file])=>({key:`verified-grade7-${file}`,name,grade:"7. sınıf",unit:"Sürdürülebilir Yaşama Doğru",url:`/question-images/variants/verified/grade7-sustainable-living/${file}-card.webp`}));

const grade8SeasonsClimateScienceImages = [
  ["Dünya'nın eksen eğikliği","earth-axis-tilt"], ["Dünya'nın dolanması","earth-revolution"], ["Mevsim oluşumu","season-formation"],
  ["Güneş ışınlarının geliş açısı","sunlight-angle"], ["Gece-gündüz süreleri","day-night-duration"], ["Hava olayı","weather-event"],
  ["İklim","climate"], ["Meteoroloji","meteorology"], ["Klimatoloji","climatology"],
].map(([name,file])=>({key:`verified-grade8-${file}`,name,grade:"8. sınıf",unit:"Mevsimler ve İklim",url:`/question-images/variants/verified/grade8-seasons-climate/${file}-card.webp`}));

const grade8SimpleMachinesScienceImages = [
  ["Sabit makara","fixed-pulley"], ["Hareketli makara","movable-pulley"], ["Palanga","block-and-tackle"], ["Kaldıraç","lever"],
  ["Eğik düzlem","inclined-plane"], ["Çıkrık","wheel-and-axle"], ["Vida","screw"], ["Dişli çark","gears"],
  ["Kasnak","belt-pulley"], ["Basit makine birleşimi","compound-machine"],
].map(([name,file])=>({key:`verified-grade8-${file}`,name,grade:"8. sınıf",unit:"Kuvvetten Makineye",url:`/question-images/variants/verified/grade8-simple-machines/${file}-card.webp`}));

const grade8SecretLifeScienceImages = [
  ["Nükleotid","nucleotide"], ["Gen","gene"], ["DNA","dna"], ["Kromozom","chromosome"], ["DNA eşlenmesi","dna-replication"],
  ["Mitoz evreleri","mitosis-stages"], ["Mayoz evreleri","meiosis-stages"], ["Kalıtım","heredity"], ["Baskın gen","dominant-allele"],
  ["Çekinik gen","recessive-allele"], ["Çaprazlama","punnett-cross"], ["Akraba evliliği","consanguineous-marriage"],
  ["Mutasyon","mutation"], ["Modifikasyon","modification"], ["Adaptasyon","adaptation"],
].map(([name,file])=>({key:`verified-grade8-${file}`,name,grade:"8. sınıf",unit:"Yaşamın Gizemi",url:`/question-images/variants/verified/grade8-secret-of-life/${file}-card.webp`}));

const grade8SoundWorldScienceImages = [
  ["Titreşen ses kaynağı","vibrating-source"], ["Ses dalgası","sound-wave"], ["Katıda ses","sound-in-solid"], ["Sıvıda ses","sound-in-liquid"],
  ["Gazda ses","sound-in-gas"], ["Frekans","frequency"], ["İnce ses","high-pitch"], ["Kalın ses","low-pitch"], ["Genlik","amplitude"],
  ["Ses şiddeti","sound-intensity"], ["Sesin yansıması","sound-reflection"], ["Sesin soğurulması","sound-absorption"],
  ["Ses yalıtımı","sound-insulation"], ["Ses kirliliği","noise-pollution"],
].map(([name,file])=>({key:`verified-grade8-${file}`,name,grade:"8. sınıf",unit:"Sesin Dünyası",url:`/question-images/variants/verified/grade8-sound-world/${file}-card.webp`}));

const grade8PeriodicMatterScienceImages = [
  ["Metal","metal"], ["Ametal","nonmetal"], ["Yarımetal","metalloid"], ["Soy gaz","noble-gas"], ["Fiziksel değişim","physical-change"],
  ["Kimyasal değişim","chemical-change"], ["Kimyasal tepkime","chemical-reaction"], ["Asit","acid"], ["Baz","base"],
  ["Ayıraç","indicator"], ["pH ölçeği","ph-scale"], ["Asit-metal etkileşimi","acid-metal"], ["Asit-mermer etkileşimi","acid-marble"],
].map(([name,file])=>({key:`verified-grade8-${file}`,name,grade:"8. sınıf",unit:"Periyodik Tablo ve Maddenin Etkileşimi",url:`/question-images/variants/verified/grade8-periodic-matter/${file}-card.webp`}));

const grade8ElectricJourneyScienceImages = [
  ["Seri bağlı devre","series-circuit"], ["Paralel bağlı devre","parallel-circuit"], ["Ampermetre","ammeter"], ["Voltmetre","voltmeter"],
  ["Akım","electric-current"], ["Gerilim","voltage"], ["Direnç","electrical-resistance"], ["Ohm ilişkisi","ohms-law"],
  ["Aydınlatma aracı","lighting-device"], ["Elektrikten ısı","electric-to-heat"], ["Elektrikten ışık","electric-to-light"],
  ["Elektrikten ses","electric-to-sound"], ["Elektrikten hareket","electric-to-motion"], ["Termik santral","thermal-power-plant"],
  ["Hidroelektrik santral","hydroelectric-plant"], ["Rüzgâr santrali","wind-power-plant"], ["Güneş santrali","solar-power-plant"],
  ["Nükleer santral","nuclear-power-plant"],
].map(([name,file])=>({key:`verified-grade8-${file}`,name,grade:"8. sınıf",unit:"Elektriğin Yolculuğu",url:`/question-images/variants/verified/grade8-electric-journey/${file}-card.webp`}));

const grade8SustainableCyclesScienceImages = [
  ["Fotosentez","photosynthesis"], ["Fotosentez deney düzeneği","photosynthesis-experiment"], ["Solunum","respiration"],
  ["Karbon döngüsü","carbon-cycle"], ["Su döngüsü","water-cycle"], ["Azot döngüsü","nitrogen-cycle"], ["Oksijen döngüsü","oxygen-cycle"],
  ["Küresel iklim değişikliği","global-climate-change"], ["Sera etkisi","greenhouse-effect"], ["Kuraklık","drought"],
  ["Sel","flood"], ["Buzul erimesi","glacier-melting"],
].map(([name,file])=>({key:`verified-grade8-${file}`,name,grade:"8. sınıf",unit:"Sürdürülebilir Yaşam ve Madde Döngüleri",url:`/question-images/variants/verified/grade8-sustainable-cycles/${file}-card.webp`}));

const curriculumScienceImages = [...opticsScienceImages,...grade7SpaceAgeScienceImages,...grade7ForceEnergyScienceImages,...grade7BodySystemsScienceImages,...grade7MatterJourneyScienceImages,...grade7ElectrificationScienceImages,...grade7SustainableLivingScienceImages,...skyScienceImages,...forceScienceImages,...cellScienceImages,...lightScienceImages,...matterScienceImages,...electricityScienceImages,...recyclingScienceImages,...grade6SolarScienceImages,...grade6MotionScienceImages,...grade6LivingSystemsScienceImages,...grade6ReflectionColorsScienceImages,...grade6DistinguishingMatterScienceImages,...grade6ElectricConductionScienceImages,...grade6SustainableInteractionScienceImages,...grade8SeasonsClimateScienceImages,...grade8SimpleMachinesScienceImages,...grade8SecretLifeScienceImages,...grade8SoundWorldScienceImages,...grade8PeriodicMatterScienceImages,...grade8ElectricJourneyScienceImages,...grade8SustainableCyclesScienceImages];

const plannedVisualCount = Object.values(curriculumVisualInventory).reduce((gradeTotal, units) => gradeTotal + Object.values(units).reduce((unitTotal, concepts) => unitTotal + concepts.length, 0), 0);
function scienceImageSrcSet(url:string){if(!url.startsWith("/question-images/"))return undefined;if(url.includes("/variants/")){const base=url.replace(/-(thumb|card|full|option)\.webp$/i,"");return `${base}-thumb.webp 320w, ${base}-card.webp 640w, ${base}-full.webp 1280w`;}const relative=url.replace("/question-images/","").replace(/\.png$/i,"");return `/question-images/variants/${relative}-thumb.webp 320w, /question-images/variants/${relative}-card.webp 640w, /question-images/variants/${relative}-full.webp 1280w`;}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [section,setSection]=useState("overview");
  const [showEditor,setShowEditor]=useState(false);
  const [data,setData]=useState<{users:Array<Record<string,unknown>>;classes:Array<Record<string,unknown>>;questions:Array<Record<string,unknown>>;attempts:Array<Record<string,unknown>>;notifications:Array<Record<string,unknown>>;aiInteractions:Array<Record<string,unknown>>}>({users:[],classes:[],questions:[],attempts:[],notifications:[],aiInteractions:[]});
  const [prompt,setPrompt]=useState("Işık ışını havadan cam ortama geçerken hangi yönde kırılır?");
  const [type,setType]=useState("multiple_choice"); const [status,setStatus]=useState("published"); const [notice,setNotice]=useState("");
  const [questionImage,setQuestionImage]=useState("/question-images/refraction-air-glass.png");
  const [answerOptions,setAnswerOptions]=useState([{text:"Normale yaklaşır",image:""},{text:"Normalden uzaklaşır",image:""},{text:"Yön değiştirmez",image:""},{text:"Geri yansır",image:""}]);
  const [correctAnswer,setCorrectAnswer]=useState("Normale yaklaşır");
  const [uploadedImages,setUploadedImages]=useState<Array<{key:string;url:string}>>([]);
  const [visualGrade,setVisualGrade]=useState("Tümü"); const [visualUnit,setVisualUnit]=useState("Tümü");
  const [imagePickerTarget,setImagePickerTarget]=useState<"question"|number|null>(null);
  const [pickerGrade,setPickerGrade]=useState("Tümü"); const [pickerUnit,setPickerUnit]=useState("Tümü");
  const allImages=[...curriculumScienceImages,...builtInScienceImages,...uploadedImages.map(item=>({key:item.key,name:"Yüklenen görsel",grade:"Özel",unit:"Özel görseller",url:item.url}))];
  const visibleImages=allImages.filter(image=>(visualGrade==="Tümü"||image.grade===visualGrade)&&(visualUnit==="Tümü"||image.unit===visualUnit));
  const pickerUnits=Array.from(new Set(allImages.filter(image=>pickerGrade==="Tümü"||image.grade===pickerGrade).map(image=>image.unit)));
  const pickerImages=allImages.filter(image=>(pickerGrade==="Tümü"||image.grade===pickerGrade)&&(pickerUnit==="Tümü"||image.unit===pickerUnit));
  const load=()=>fetch("/api/data").then(r=>r.json()).then(value=>setData(value)).catch(()=>setNotice("Veriler alınamadı."));
  useEffect(()=>{load();fetch("/api/images").then(r=>r.ok?r.json():{images:[]}).then(v=>setUploadedImages(v.images||[]));},[]);
  function changeType(next:string){setType(next);if(next==="true_false"){setAnswerOptions([{text:"Doğru",image:""},{text:"Yanlış",image:""}]);setCorrectAnswer("Doğru");}else if(next==="open_ended"){setAnswerOptions([]);setCorrectAnswer("");}else{setAnswerOptions([{text:"A seçeneği",image:""},{text:"B seçeneği",image:""},{text:"C seçeneği",image:""},{text:"D seçeneği",image:""}]);setCorrectAnswer("A seçeneği");}}
  function updateOption(index:number,field:"text"|"image",value:string){setAnswerOptions(items=>items.map((item,i)=>i===index?{...item,[field]:value}:item));}
  function chooseReadyImage(url:string){if(imagePickerTarget==="question")setQuestionImage(url);else if(typeof imagePickerTarget==="number")updateOption(imagePickerTarget,"image",url);setImagePickerTarget(null);}
  async function uploadImage(file?:File,onReady?:(url:string)=>void){if(!file)return;setNotice("Görsel yükleniyor…");const form=new FormData();form.append("file",file);const response=await fetch("/api/images",{method:"POST",body:form});const result=await response.json() as {error?:string;key?:string;url?:string};if(!response.ok||!result.url||!result.key)return setNotice(result.error||"Görsel yüklenemedi.");setUploadedImages(items=>[...items,{key:result.key!,url:result.url!}]);(onReady||setQuestionImage)(result.url);setNotice("Görsel kütüphaneye eklendi.");}
  async function saveQuestion(){setNotice("Kaydediliyor…");const response=await fetch("/api/data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"create_question",grade:7,unit:"Işığın Kırılması",topic:"Işığın kırılması",type,prompt,options:answerOptions,correctAnswer,hint:"İkinci ortamın optik yoğunluğunu ve ışığın hızını karşılaştır.",imageUrl:questionImage,status})});const result=await response.json() as {error?:string};setNotice(response.ok?"Soru kaydedildi ve öğrencilere hazır.":result.error||"Kaydedilemedi.");if(response.ok){setShowEditor(false);setSection("questions");load();}}
  const teachers=data.users.filter(u=>u.role==="teacher").length,students=data.users.filter(u=>u.role==="student").length;
  const displayQuestions=data.questions.length?data.questions.map(q=>({type:q.type==="multiple_choice"?"Çoktan seçmeli":q.type==="true_false"?"Doğru / Yanlış":"Açık uçlu",title:String(q.prompt),grade:`${q.grade}. sınıf`,unit:String(q.unit),status:q.status==="published"?"Yayında":"Taslak",visual:Boolean(q.image_url)})):adminQuestions;
  return <main className="teacher-shell admin-shell">
    <header className="teacher-header"><div className="auth-brand"><span className="brand-mark">M</span><div><b>MODAI</b><small>ADMİN PANELİ</small></div></div><div><span>Admin</span><button onClick={onLogout}>Çıkış yap</button></div></header>
    <div className="admin-layout">
      <aside className="teacher-nav admin-nav">{[["overview","Genel bakış"],["teachers","Öğretmenler"],["students","Öğrenciler"],["classes","Sınıflar"],["questions","Soru bankası"],["visuals","Görsel kütüphane"],["ai","AI kuralları"],["logs","Sistem logları"]].map(([id,label])=><button key={id} className={section===id?"active":""} onClick={()=>{setSection(id);setShowEditor(false);setNotice("");}}>{label}</button>)}</aside>
      <section className="teacher-main">
        <div className="teacher-title"><div><p>MODAI YÖNETİM MERKEZİ</p><h1>{showEditor?"Yeni soru oluştur":section==="overview"?"Genel bakış":section==="teachers"?"Öğretmenler":section==="students"?"Öğrenciler":section==="classes"?"Sınıflar":section==="questions"?"Soru bankası":section==="visuals"?"Görsel kütüphane":section==="ai"?"AI kuralları":"Sistem logları"}</h1><span>Öğretmen, öğrenci, içerik ve yapay zekâ etkileşimlerini izle ve yönet.</span></div>{!showEditor&&<button onClick={()=>{setShowEditor(true);setSection("questions");}}>+ Yeni soru</button>}</div>
        {notice&&<p className="system-notice">{notice}</p>}
        {showEditor&&<article className="admin-card question-editor standalone-editor">
          <div className="section-head"><div><h2>Soru bilgileri</h2><p>Soru türü değiştiğinde cevap alanları otomatik uyarlanır.</p></div><select value={status} onChange={e=>setStatus(e.target.value)}><option value="published">Yayında</option><option value="draft">Taslak</option></select></div>
          <label>Soru türü<select value={type} onChange={e=>changeType(e.target.value)}><option value="multiple_choice">Çoktan seçmeli</option><option value="true_false">Doğru / Yanlış</option><option value="open_ended">Açık uçlu</option></select></label>
          <label>Soru metni<textarea value={prompt} onChange={e=>setPrompt(e.target.value)} /></label>
          <div className="image-field"><div><b>Soru görseli</b><small>Hazır görselleri önizleyerek seçin veya kendi görselinizi yükleyin.</small></div>{questionImage?<div className="selected-image"><img src={questionImage} srcSet={scienceImageSrcSet(questionImage)} sizes="(max-width: 700px) 100vw, 640px" alt="Seçilen soru görseli"/><button onClick={()=>setQuestionImage("")}>Görseli kaldır</button></div>:<p className="empty-image">Soru görseli kullanılmıyor.</p>}<button type="button" className="open-image-library" onClick={()=>setImagePickerTarget("question")}>Hazır görselleri aç</button><label className="upload-button">Bilgisayardan görsel yükle<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>uploadImage(e.target.files?.[0])}/></label></div>
          {imagePickerTarget!==null&&<div className="image-picker-backdrop" role="dialog" aria-modal="true" aria-label="Hazır fen görseli seç"><div className="image-picker-panel"><div className="image-picker-head"><div><h3>Hazır fen görselleri</h3><p>Sınıf ve üniteyi seçin, ardından kullanmak istediğiniz görsele dokunun.</p></div><button type="button" onClick={()=>setImagePickerTarget(null)}>Kapat</button></div><div className="image-picker-filters"><select value={pickerGrade} onChange={e=>{setPickerGrade(e.target.value);setPickerUnit("Tümü");}}><option>Tümü</option><option>5. sınıf</option><option>6. sınıf</option><option>7. sınıf</option><option>8. sınıf</option><option>Özel</option></select><select value={pickerUnit} onChange={e=>setPickerUnit(e.target.value)}><option>Tümü</option>{pickerUnits.map(unit=><option key={unit}>{unit}</option>)}</select><b>{pickerImages.length} görsel</b></div><div className="image-picker-grid">{pickerImages.map(image=><button type="button" key={image.key} className={(imagePickerTarget==="question"?questionImage:typeof imagePickerTarget==="number"?answerOptions[imagePickerTarget]?.image:"")===image.url?"selected":""} onClick={()=>chooseReadyImage(image.url)}><img src={image.url} srcSet={scienceImageSrcSet(image.url)} sizes="180px" alt={image.name}/><span><b>{image.name}</b><small>{image.grade} • {image.unit}</small></span></button>)}</div></div></div>}
          {type!=="open_ended"&&<div className="answer-editor"><h3>{type==="true_false"?"Doğru / Yanlış cevapları":"Cevap seçenekleri"}</h3>{answerOptions.map((option,index)=><div className="answer-option-editor" key={index}><label><span>{index+1}. seçenek</span><input value={option.text} onChange={e=>updateOption(index,"text",e.target.value)} /></label><div className="option-library-field"><span>Şık görseli</span><button type="button" className="open-image-library compact" onClick={()=>setImagePickerTarget(index)}>{option.image?"Hazır görseli değiştir":"Hazır görsel seç"}</button></div><label className="mini-upload">Şık için yükle<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>uploadImage(e.target.files?.[0],url=>updateOption(index,"image",url))}/></label>{option.image&&<div className="option-image-preview"><img src={option.image} srcSet={scienceImageSrcSet(option.image)} sizes="256px" alt={`${index+1}. seçenek görseli`}/><button onClick={()=>updateOption(index,"image","")}>Kaldır</button></div>}<label className="correct-choice"><input type="radio" name="correct-answer" checked={correctAnswer===option.text} onChange={()=>setCorrectAnswer(option.text)}/> Doğru cevap</label></div>)}</div>}
          {type==="open_ended"&&<label>Örnek doğru cevap / değerlendirme ölçütü<textarea value={correctAnswer} onChange={e=>setCorrectAnswer(e.target.value)} placeholder="Öğrencinin cevabında bulunması gereken kavramları yazın."/></label>}
          <div className="ai-hint"><b>ModAi ipucu</b><p>Soru türü ve doğru cevaba göre öğrenciye aşamalı ipucu üretilecek.</p></div>
          <div className="editor-actions"><button className="secondary" onClick={()=>setShowEditor(false)}>Vazgeç</button><button onClick={saveQuestion}>Soruyu kaydet</button></div>
        </article>}
        {!showEditor&&section==="overview"&&<>
        <div className="metric-grid admin-metrics"><article><span>Öğretmen</span><b>{teachers}</b><small>Kayıtlı hesap</small></article><article><span>Öğrenci</span><b>{students}</b><small>{data.classes.length} sınıfta</small></article><article><span>Soru</span><b>{data.questions.length}</b><small>Kalıcı soru bankası</small></article><article><span>AI müdahalesi</span><b>{data.aiInteractions.length}</b><small>{data.attempts.length} cevap kaydı</small></article></div>
        <div className="admin-grid">
          <article className="admin-card dashboard-callout"><div><span>İÇERİK YÖNETİMİ</span><h2>Yeni bir fen sorusu hazırlayın</h2><p>Görsel, cevap seçenekleri, doğru cevap ve ModAi ipucuyla birlikte yayınlayın.</p><button onClick={()=>{setShowEditor(true);setSection("questions");}}>+ Yeni soru oluştur</button></div><img src="/question-images/refraction-air-glass.png" alt="Işık kırılması soru görseli"/></article>
          <article className="admin-card"><div className="section-head"><div><h2>Soru bankası</h2><p>Tüm sınıf ve ünitelerin merkezi içerik alanı</p></div><button className="filter-button" onClick={()=>setSection("questions")}>Tümünü gör</button></div><div className="question-list">{displayQuestions.map((item,index) => <div key={`${item.title}-${index}`}><span className="question-type">{item.type}</span><p><b>{item.title}</b><small>{item.grade} • {item.unit}{item.visual ? " • Görselli" : ""}</small></p><strong className={item.status === "Yayında" ? "published" : "draft"}>{item.status}</strong><button onClick={()=>{setPrompt(item.title);setSection("questions");setShowEditor(true);}}>Düzenle</button></div>)}</div><div className="curriculum-box"><b>Ortaokul fen görsel kütüphanesi</b><p>5, 6, 7 ve 8. sınıf kavram görselleri ünite bazında eklenebilir. İlk paket: 7. sınıf Işığın Kırılması.</p><span>%12 ilk paket hazır</span></div></article>
        </div>
        <div className="admin-grid lower"><article className="admin-card"><div className="section-head"><div><h2>Sistem genelinde öğrenme sinyalleri</h2><p>Öğrencilerin topluca en çok zorlandığı alanlar</p></div></div><div className="topic-list">{topicInsights.map((item) => <div key={item.topic}><p><span>{item.topic}</span><b>{item.students} öğrenci</b></p><i><em style={{width:`${item.rate * 2.4}%`}}/></i></div>)}</div></article><article className="admin-card"><div className="section-head"><div><h2>Veri ve erişim özeti</h2><p>Rollere göre görünürlük ve son hareketler</p></div></div><div className="access-list"><p><b>Admin</b><span>Tüm öğretmen, öğrenci, soru ve log verileri</span></p><p><b>Öğretmen</b><span>Yalnızca kendi sınıfları ve öğrencileri</span></p><p><b>Öğrenci</b><span>Kendi dersleri, ilerlemesi ve ModAi desteği</span></p></div></article></div>
        </>}
        {!showEditor&&section==="teachers"&&<AdminList title="Öğretmen hesapları" empty="Henüz veritabanına kayıtlı öğretmen yok." rows={[{id:"sedahoca",name:"Seda Hoca",meta:"Sedahoca • Kullanıcı adıyla aktif"},...data.users.filter(u=>u.role==="teacher").map(u=>({id:String(u.id),name:String(u.name),meta:String(u.email||u.username)}))]}/>} 
        {!showEditor&&section==="students"&&<AdminList title="Tüm öğrenciler" empty="Henüz öğretmen tarafından öğrenci oluşturulmadı." rows={data.users.filter(u=>u.role==="student").map(u=>({id:String(u.id),name:String(u.name),meta:`${u.username} • Öğretmen: ${u.teacher_username||"—"}`}))}/>} 
        {!showEditor&&section==="classes"&&<AdminList title="Tüm sınıflar" empty="Henüz sınıf oluşturulmadı." rows={data.classes.map(c=>({id:String(c.id),name:String(c.name),meta:`${c.grade}. sınıf • ${c.teacher_username}`}))}/>} 
        {!showEditor&&section==="questions"&&<article className="admin-card section-card"><div className="section-head"><div><h2>Soru bankası</h2><p>Yayınlanan ve taslak tüm sorular</p></div><button className="primary-small" onClick={()=>setShowEditor(true)}>+ Yeni soru</button></div><div className="question-list">{displayQuestions.map((item,index)=><div key={`${item.title}-${index}`}><span className="question-type">{item.type}</span><p><b>{item.title}</b><small>{item.grade} • {item.unit}{item.visual?" • Görselli":""}</small></p><strong className={item.status==="Yayında"?"published":"draft"}>{item.status}</strong><button onClick={()=>{setPrompt(item.title);setShowEditor(true);}}>Düzenle</button></div>)}</div></article>}
        {!showEditor&&section==="visuals"&&<article className="admin-card section-card"><div className="section-head"><div><h2>Fen görsel kütüphanesi</h2><p>PDF’den çıkarılan {plannedVisualCount} kavramlık envanter; sınıf → ünite → kavram düzeninde</p></div><label className="primary-small upload-inline">+ Görsel yükle<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>uploadImage(e.target.files?.[0])}/></label></div><div className="library-filters"><select value={visualGrade} onChange={e=>setVisualGrade(e.target.value)}><option>Tümü</option><option>5. sınıf</option><option>6. sınıf</option><option>7. sınıf</option><option>8. sınıf</option><option>Özel</option></select><select value={visualUnit} onChange={e=>setVisualUnit(e.target.value)}><option>Tümü</option>{Array.from(new Set(allImages.map(image=>image.unit))).map(unit=><option key={unit}>{unit}</option>)}</select><b>{visibleImages.length} gösteriliyor • {builtInScienceImages.length+curriculumScienceImages.length}/{plannedVisualCount} üretildi</b></div><div className="visual-grid">{visibleImages.map(image=><button key={image.key} onClick={()=>{setQuestionImage(image.url);setSection("questions");setShowEditor(true);}}><img src={image.url} srcSet={scienceImageSrcSet(image.url)} sizes="(max-width: 600px) 100vw, 320px" alt={image.name}/><b>{image.name}</b><small>{image.unit}</small><span>{image.grade} • Soruda kullan</span></button>)}</div></article>}
        {!showEditor&&section==="ai"&&<article className="admin-card section-card"><div className="section-head"><div><h2>ModAi yönlendirme kuralları</h2><p>Öğrenciye ne zaman ve nasıl müdahale edileceğini belirleyin.</p></div></div><div className="rule-list"><label><input type="checkbox" defaultChecked/> İlk yanlışta kavramsal ipucu ver</label><label><input type="checkbox" defaultChecked/> İkinci yanlışta günlük yaşam örneği göster</label><label><input type="checkbox" defaultChecked/> Tekrarlanan hatayı öğretmene bildir</label><label><input type="checkbox" defaultChecked/> Öğrencinin yaşına uygun Türkçe kullan</label><button onClick={()=>setNotice("AI kuralları kaydedildi.")}>Kuralları kaydet</button></div></article>}
        {!showEditor&&section==="logs"&&<article className="admin-card section-card"><div className="section-head"><div><h2>Sistem ve öğrenme logları</h2><p>Son cevaplar ve yapay zekâ müdahaleleri</p></div><button className="filter-button" onClick={load}>Yenile</button></div><div className="admin-log-table">{[...data.attempts.map(a=>({id:`a${a.id}`,title:`${a.student_username} cevap verdi`,meta:`Soru #${a.question_id} • ${a.is_correct?"Doğru":"Yanlış"} • ${a.created_at}`})),...data.aiInteractions.map(a=>({id:`i${a.id}`,title:`${a.student_username} ModAi kullandı`,meta:`${a.kind} • ${a.created_at}`}))].map(row=><div key={row.id}><b>{row.title}</b><span>{row.meta}</span></div>)}{!data.attempts.length&&!data.aiInteractions.length&&<p className="empty-state">Henüz sistem kaydı oluşmadı.</p>}</div></article>}
      </section>
    </div>
  </main>;
}

function AdminList({title,empty,rows}:{title:string;empty:string;rows:Array<{id:string;name:string;meta:string}>}){return <article className="admin-card section-card"><div className="section-head"><div><h2>{title}</h2><p>Merkezi kayıtlar ve hesap bilgileri</p></div><b>{rows.length} kayıt</b></div><div className="directory-list">{rows.map(row=><div key={row.id}><span className="directory-avatar">{row.name.slice(0,1)}</span><p><b>{row.name}</b><small>{row.meta}</small></p><button>Ayrıntılar</button></div>)}{!rows.length&&<p className="empty-state">{empty}</p>}</div></article>}

function TeacherManagement(){
  const [data,setData]=useState<{classes:Array<{id:number;name:string;grade:number}>;students:Array<{id:number;name:string;username:string;class_id:number}>;notifications:Array<{id:number;title:string;message:string}>}>({classes:[],students:[],notifications:[]});
  const [message,setMessage]=useState(""); const [className,setClassName]=useState("7-A"); const [studentName,setStudentName]=useState(""); const [studentUser,setStudentUser]=useState(""); const [studentPassword,setStudentPassword]=useState(""); const [classId,setClassId]=useState(0); const [announcement,setAnnouncement]=useState("");
  const load=()=>fetch("/api/data").then(r=>r.json()).then(v=>{setData(v);if(!classId&&v.classes?.[0])setClassId(v.classes[0].id);}).catch(()=>setMessage("Veriler alınamadı."));
  useEffect(()=>{load();},[]);
  async function send(payload:Record<string,unknown>){setMessage("Kaydediliyor…");const r=await fetch("/api/data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const v=await r.json() as {error?:string};setMessage(r.ok?"İşlem tamamlandı.":v.error||"İşlem başarısız.");if(r.ok)load();}
  return <section className="management-wrap"><div className="management-grid"><article className="admin-card"><h2>Sınıf oluştur</h2><p>Öğrencileri ayrı sınıflarda yönetin.</p><div className="compact-form"><input value={className} onChange={e=>setClassName(e.target.value)} placeholder="Sınıf adı"/><select defaultValue="7"><option>5</option><option>6</option><option>7</option><option>8</option></select><button onClick={()=>send({action:"create_class",name:className,grade:7})}>Sınıfı kaydet</button></div><div className="chip-list">{data.classes.map(c=><span key={c.id}>{c.name} • {c.grade}. sınıf</span>)}</div></article><article className="admin-card"><h2>Öğrenci hesabı oluştur</h2><p>Kullanıcı adı ve şifreyi öğretmen belirler.</p><div className="compact-form"><input value={studentName} onChange={e=>setStudentName(e.target.value)} placeholder="Ad soyad"/><input value={studentUser} onChange={e=>setStudentUser(e.target.value)} placeholder="Kullanıcı adı"/><input value={studentPassword} onChange={e=>setStudentPassword(e.target.value)} placeholder="En az 6 karakter şifre"/><select value={classId} onChange={e=>setClassId(Number(e.target.value))}><option value="0">Sınıf seç</option>{data.classes.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select><button onClick={()=>send({action:"create_student",name:studentName,username:studentUser,password:studentPassword,classId})}>Öğrenciyi kaydet</button></div></article><article className="admin-card"><h2>Sınıfa bildirim gönder</h2><p>Ünite, ödev veya çalışma yönlendirmesi gönderin.</p><div className="compact-form"><select value={classId} onChange={e=>setClassId(Number(e.target.value))}><option value="0">Sınıf seç</option>{data.classes.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select><textarea value={announcement} onChange={e=>setAnnouncement(e.target.value)} placeholder="Bildirim mesajı"/><button onClick={()=>send({action:"send_notification",classId,title:"Öğretmen yönlendirmesi",message:announcement,unit:"Işığın Kırılması"})}>Gönder</button></div></article></div>{message&&<p className="system-notice">{message}</p>}<div className="teacher-section"><div className="section-head"><div><h2>Kayıtlı öğrenciler</h2><p>Gerçek öğretmen hesabınıza bağlı öğrenciler</p></div><b>{data.students.length} öğrenci</b></div><div className="chip-list">{data.students.map(s=><span key={s.id}><b>{s.name}</b> • {s.username}</span>)}</div></div></section>;
}

function TeacherDashboard({onLogout}:{onLogout:()=>void}){
  const [data,setData]=useState<{classes:Array<Record<string,unknown>>;students:Array<Record<string,unknown>>;attempts:Array<Record<string,unknown>>;aiInteractions:Array<Record<string,unknown>>}>({classes:[],students:[],attempts:[],aiInteractions:[]});
  const [loading,setLoading]=useState(true);
  useEffect(()=>{fetch("/api/data").then(r=>r.json()).then(v=>setData(v)).finally(()=>setLoading(false));},[]);
  const totalAttempts=data.students.reduce((sum,s)=>sum+Number(s.attempt_count||0),0); const totalCorrect=data.students.reduce((sum,s)=>sum+Number(s.correct_count||0),0); const average=totalAttempts?Math.round(totalCorrect/totalAttempts*100):0; const support=data.students.filter(s=>Number(s.wrong_count)>=5).length;
  return <main className="teacher-shell"><header className="teacher-header"><div className="auth-brand"><span className="brand-mark">M</span><div><b>MODAI</b><small>ÖĞRETMEN PANELİ</small></div></div><div><span>Seda Hoca</span><button onClick={onLogout}>Çıkış yap</button></div></header><div className="teacher-layout"><aside className="teacher-nav"><button className="active">Genel bakış</button><button onClick={()=>document.getElementById("teacher-management")?.scrollIntoView()}>Sınıflarım</button><button onClick={()=>document.getElementById("live-students")?.scrollIntoView()}>Öğrenciler</button><button onClick={()=>document.getElementById("teacher-logs")?.scrollIntoView()}>Öğrenme kayıtları</button></aside><section className="teacher-main"><div className="teacher-title"><div><p>CANLI VERİ • SEDA HOCA</p><h1>Öğrenci ilerleme merkezi</h1><span>Bu ekrandaki öğrenciler ve kayıtlar admin paneliyle aynı veritabanından gelir.</span></div></div>{loading?<p className="system-notice">Öğrenci verileri yükleniyor…</p>:<><div className="metric-grid"><article><span>Toplam öğrenci</span><b>{data.students.length}</b><small>{data.classes.length} sınıfta</small></article><article><span>Ortalama başarı</span><b>%{average}</b><small>{totalAttempts} cevap üzerinden</small></article><article><span>Tamamlanan cevap</span><b>{totalAttempts}</b><small>Kalıcı kayıt</small></article><article><span>Desteğe ihtiyaç duyan</span><b>{support}</b><small>5+ yanlış yapan</small></article></div><div className="teacher-section" id="live-students"><div className="section-head"><div><h2>Gerçek öğrenci durumu</h2><p>Admin paneliyle ortak öğrenci ve etkinlik kayıtları</p></div><b>{data.students.length} öğrenci</b></div><div className="student-table"><div className="table-row table-head"><span>Öğrenci</span><span>Başarı</span><span>Doğru / Yanlış</span><span>Çalışma</span><span>ModAi gözlemi</span></div>{data.students.map(student=>{const attempts=Number(student.attempt_count||0),correct=Number(student.correct_count||0),wrong=Number(student.wrong_count||0),rate=attempts?Math.round(correct/attempts*100):0;return <div className="table-row" key={String(student.id)}><span><b>{String(student.name)}</b><small>{String(student.class_name||"Sınıfsız")} • {String(student.username)}</small></span><span><i><em style={{width:`${rate}%`}}/></i><b>%{rate}</b></span><span><b className="ok">{correct}</b> / <b className="bad">{wrong}</b></span><span>{Math.round(Number(student.duration_seconds||0)/60)} dk</span><span>{wrong>=7?"Yoğun destek gerekli":wrong>=4?"Pekiştirme öneriliyor":"İlerleme normal"}<button>Ayrıntı</button></span></div>})}</div></div></>}</section></div><div id="teacher-management"><TeacherManagement/></div><section className="analytics-wrap" id="teacher-logs"><div className="analytics-grid"><article className="insight-card"><div className="analytics-title"><div><span>GERÇEK KAYITLAR</span><h2>Son öğrenci cevapları</h2></div><b>{data.attempts.length} kayıt</b></div><div className="live-feed">{data.attempts.slice(0,8).map(item=><p key={String(item.id)}><b>{String(item.student_username)}</b><span>{String(item.topic||"Fen Bilimleri")} • {item.is_correct?"Doğru":"Yanlış"}</span></p>)}</div></article><article className="insight-card ai-impact"><div className="analytics-title"><div><span>MODAI ETKİSİ</span><h2>Yapay zekâ kullanımı</h2></div><b>{data.aiInteractions.length} etkileşim</b></div><div className="impact-number"><strong>{data.aiInteractions.filter(i=>i.helped).length}</strong><p>Faydalı müdahale<small>Öğrencinin sonraki adımına katkı sağlayan kayıtlar.</small></p></div></article></div></section></main>;
}

const grade7Labs = [
  {id:"space",unit:"Uzay Çağı",title:"Uydu yörüngesi",goal:"Yörünge yüksekliği ve uydu hızının ilişkisini keşfet."},
  {id:"light",unit:"Işığın Madde ile Etkileşimi",title:"Işığı yönlendir",goal:"Gelme açısı ve ortam değişince kırılmayı incele."},
  {id:"energy",unit:"Kuvvet ve Enerji",title:"Enerji rampası",goal:"Kütle ve yüksekliğin enerjiye etkisini modelle."},
  {id:"circuit",unit:"Elektrik Devreleri",title:"Devreyi çalıştır",goal:"Anahtar ve ampul sayısının devreye etkisini keşfet."},
  {id:"cell",unit:"Hücre ve Bölünmeler",title:"Hücre bölünmesini yönet",goal:"Mitozun aşamalarını sıralı bir modelde gözlemle."},
  {id:"mixture",unit:"Saf Madde ve Karışımlar",title:"Karışımı ayır",goal:"Karışıma uygun ayırma yöntemini deneyerek bul."},
  {id:"growth",unit:"Canlılarda Üreme, Büyüme ve Gelişme",title:"Bitkiyi büyüt",goal:"Işık, su ve sıcaklığın büyümeye etkisini modelle."},
];

function ModelLaboratory(){
  const [lab,setLab]=useState("light");
  const [angle,setAngle]=useState(42),[medium,setMedium]=useState("cam"),[mass,setMass]=useState(2),[height,setHeight]=useState(3),[switchOn,setSwitchOn]=useState(false),[bulbs,setBulbs]=useState(1),[cellStep,setCellStep]=useState(0),[mixture,setMixture]=useState("kum-su"),[method,setMethod]=useState(""),[orbit,setOrbit]=useState(3),[water,setWater]=useState(60),[sun,setSun]=useState(70),[temperature,setTemperature]=useState(24);
  const refracted=Math.round(Math.asin(Math.sin(angle*Math.PI/180)/(medium==="cam"?1.5:medium==="su"?1.33:1))*180/Math.PI),energy=Math.round(mass*9.8*height),mixtureAnswer=mixture==="kum-su"?"Süzme":mixture==="tuz-su"?"Buharlaştırma":"Mıknatıs";
  const cellStages=["Hazırlık","Kromozomların belirginleşmesi","Ekvator düzlemine dizilme","Kardeş kromatitlerin ayrılması","İki yeni hücre"];
  const growthScore=Math.round(Math.max(5,100-(Math.abs(water-65)+Math.abs(sun-70)+Math.abs(temperature-24)*4)/2));
  return <section className="model-labs" id="model-labs"><div className="lab-heading"><div><p className="eyebrow">7. SINIF MODEL LABORATUVARI</p><h2>Değişkenleri yönet, tahmin et ve sonucu gözle</h2><p>Her modelde önce bir tahmin yap; sonra değişkenleri değiştirerek düşünceni kanıtla.</p></div><span>{grade7Labs.length} etkileşimli model</span></div><div className="lab-tabs">{grade7Labs.map(item=><button key={item.id} className={lab===item.id?"active":""} onClick={()=>setLab(item.id)}><small>{item.unit}</small><b>{item.title}</b></button>)}</div><div className="lab-workbench"><div className="lab-goal"><span>MODEL GÖREVİ</span><b>{grade7Labs.find(item=>item.id===lab)?.goal}</b></div>
    {lab==="light"&&<div className="lab-grid"><div className="lab-controls"><label>Gelme açısı <b>{angle}°</b><input type="range" min="5" max="80" value={angle} onChange={e=>setAngle(Number(e.target.value))}/></label><label>İkinci ortam<select value={medium} onChange={e=>setMedium(e.target.value)}><option value="hava">Hava</option><option value="su">Su</option><option value="cam">Cam</option></select></label><p>Işık {medium==="hava"?"doğrultusunu değiştirmiyor":`normale yaklaşıyor ve ${refracted}° ile kırılıyor`}.</p></div><div className="light-sim"><i className="normal-line"/><i className="surface-line"/><i className="incoming-ray" style={{transform:`rotate(${225+angle/2}deg)`}}/><i className="outgoing-ray" style={{transform:`rotate(${refracted}deg)`}}/><span className="light-source">●</span><b>i={angle}°</b><em>r={refracted}°</em></div></div>}
    {lab==="energy"&&<div className="lab-grid"><div className="lab-controls"><label>Kütle <b>{mass} kg</b><input type="range" min="1" max="10" value={mass} onChange={e=>setMass(Number(e.target.value))}/></label><label>Yükseklik <b>{height} m</b><input type="range" min="1" max="8" value={height} onChange={e=>setHeight(Number(e.target.value))}/></label><p>Çekim potansiyel enerjisi yaklaşık <strong>{energy} joule</strong>.</p></div><div className="ramp-sim"><i className="ramp"/><span className="ball" style={{left:`${12+height*8}%`,bottom:`${28+height*5}%`,transform:`scale(${.75+mass/20})`}}/><div><b style={{width:`${Math.min(100,energy/8)}%`}}/></div><small>Enerji göstergesi</small></div></div>}
    {lab==="circuit"&&<div className="lab-grid"><div className="lab-controls"><label>Ampul sayısı<select value={bulbs} onChange={e=>setBulbs(Number(e.target.value))}><option value="1">1 ampul</option><option value="2">2 ampul (seri)</option><option value="3">3 ampul (seri)</option></select></label><button className={switchOn?"lab-action active":"lab-action"} onClick={()=>setSwitchOn(v=>!v)}>{switchOn?"Anahtarı aç":"Anahtarı kapat"}</button><p>{switchOn?`Devre kapalı. ${bulbs} ampul ${bulbs>1?"daha sönük":"parlak"} yanıyor.`:"Devre açık olduğu için akım oluşmuyor."}</p></div><div className={`circuit-sim ${switchOn?"on":""}`}><span className="battery">+ &nbsp; −</span><i className="wire"/><span className="switch">{switchOn?"━":"╱"}</span><div>{Array.from({length:bulbs}).map((_,i)=><span className="bulb" key={i}>●</span>)}</div></div></div>}
    {lab==="cell"&&<div className="lab-grid"><div className="lab-controls"><label>Bölünme aşaması <b>{cellStep+1}/{cellStages.length}</b><input type="range" min="0" max={cellStages.length-1} value={cellStep} onChange={e=>setCellStep(Number(e.target.value))}/></label><p><strong>{cellStages[cellStep]}</strong>: {cellStep===4?"Kalıtsal bilgisi aynı iki yavru hücre oluştu.":"Kromozomların hücre içindeki konumunu gözlemle."}</p></div><div className={`cell-sim step-${cellStep}`}><div className="cell-one"><i/><i/><i/><i/></div>{cellStep===4&&<div className="cell-two"><i/><i/></div>}</div></div>}
    {lab==="mixture"&&<div className="lab-grid"><div className="lab-controls"><label>Karışım<select value={mixture} onChange={e=>{setMixture(e.target.value);setMethod("");}}><option value="kum-su">Kum + su</option><option value="tuz-su">Tuz + su</option><option value="demir-kum">Demir tozu + kum</option></select></label><div className="method-buttons">{["Süzme","Buharlaştırma","Mıknatıs"].map(item=><button key={item} onClick={()=>setMethod(item)}>{item}</button>)}</div><p>{!method?"Bir ayırma yöntemi seç.":method===mixtureAnswer?`Doğru: ${mixtureAnswer} yöntemi bu karışımı ayırır.`:"Bu yöntem uygun değil. Maddelerin özelliklerini yeniden düşün."}</p></div><div className="mixture-sim"><div className="beaker"><i/><i/><i/><i/><i/></div><b>{mixture.replace("-"," + ")}</b><span>{method||"?"}</span></div></div>}
    {lab==="space"&&<div className="lab-grid"><div className="lab-controls"><label>Yörünge yüksekliği <b>{orbit*400} km</b><input type="range" min="1" max="8" value={orbit} onChange={e=>setOrbit(Number(e.target.value))}/></label><p>Uydu yükseldikçe yörüngesi büyür ve Dünya çevresindeki dolanım süresi artar.</p></div><div className="space-sim"><span className="earth-ball">Dünya</span><i className="orbit-ring" style={{width:`${120+orbit*20}px`,height:`${70+orbit*13}px`}}/><b className="satellite" style={{transform:`translate(${55+orbit*10}px,${-18-orbit*5}px)`}}>▣</b><em>{Math.round(90+orbit*38)} dk/yörünge</em></div></div>}
    {lab==="growth"&&<div className="lab-grid"><div className="lab-controls"><label>Su <b>%{water}</b><input type="range" min="0" max="100" value={water} onChange={e=>setWater(Number(e.target.value))}/></label><label>Işık <b>%{sun}</b><input type="range" min="0" max="100" value={sun} onChange={e=>setSun(Number(e.target.value))}/></label><label>Sıcaklık <b>{temperature}°C</b><input type="range" min="5" max="45" value={temperature} onChange={e=>setTemperature(Number(e.target.value))}/></label><p>Büyüme uygunluğu %{growthScore}. {growthScore>85?"Koşullar dengeli; bitki sağlıklı gelişiyor.":"Sınırlayıcı değişkeni bulup yeniden ayarla."}</p></div><div className="growth-sim"><span className="sun-disc" style={{opacity:.25+sun/135}}/><div className="plant" style={{transform:`scale(${.55+growthScore/220})`}}><i/><b/><em/><span/></div><div className="soil"/><small>{growthScore>85?"Sağlıklı büyüme":"Gelişim yavaş"}</small></div></div>}
  </div></section>;
}

export default function Home() {
  const [view, setView] = useState<"login" | "admin" | "teacher" | "student">("login");
  const [loginRole, setLoginRole] = useState<"admin" | "teacher" | "student">("teacher");
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
  const [message, setMessage] = useState("Merhaba Ece! Bir kaşığı su dolu bardağa koyduğunda neden kırılmış gibi görünür? Işığın iki ortam arasında yön değiştirmesini birlikte modelleyelim.");
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
      const data = await response.json() as { role?: "admin" | "teacher" | "student" };
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
    const endpoint = `/api/auth/${loginRole}`;
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
        ? `İpucu: Önce ışığın hangi ortamdan hangi ortama geçtiğini belirle. İkinci ortam optik olarak daha yoğunsa ışın normale yaklaşır, daha az yoğunsa normalden uzaklaşır.`
        : `Köprü kurma örneği: Bir bisikletin sağ tekeri önce kuma girerse bisiklet sağa yönelir. “${question.label}” olayında ışığın hangi tarafı önce yavaşlıyor olabilir?`;
      setMessage(hint);
      setMascotOpen(true);
    }
  }

  function next() {
    if (!isCorrect || completed) return;
    if (questionIndex === scenarios.length - 1) {
      setCompleted(true);
      setMessage("Etkinliği tamamladın! Dört ışık olayını da doğru kırılma davranışıyla eşleştirdin. Öğretmenin ilerlemeni görebilir.");
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
    setMessage("Yeni bir ışık olayı geliyor. Önce ortamları karşılaştır, sonra ışının yönünü tahmin et!");
  }

  if (authLoading) return <main className="auth-screen"><div className="auth-card"><div className="brand-mark">M</div><h1>ModAi hazırlanıyor…</h1></div></main>;

  if (view === "login") return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-brand"><span className="brand-mark">M</span><div><b>MODAI</b><small>FEN ÖĞRENME PLATFORMU</small></div></div>
        <p className="auth-kicker">HOŞ GELDİNİZ</p><h1>Hesabınıza giriş yapın</h1><p className="auth-intro">Admin, öğretmen veya size özel öğrenci alanına güvenle devam edin.</p>
        <div className="role-tabs"><button className={loginRole === "admin" ? "active" : ""} onClick={() => { setLoginRole("admin"); setLoginError(""); }}>Admin</button><button className={loginRole === "teacher" ? "active" : ""} onClick={() => { setLoginRole("teacher"); setLoginError(""); }}>Öğretmen</button><button className={loginRole === "student" ? "active" : ""} onClick={() => { setLoginRole("student"); setLoginError(""); }}>Öğrenci</button></div>
        {loginRole === "teacher" && <><div id="google-teacher-login" className="google-login" /><div className="auth-divider"><span>veya kullanıcı adıyla</span></div></>}
        <form className="auth-form" onSubmit={submitLogin}><label>Kullanıcı adı<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" placeholder={loginRole === "admin" ? "Admin" : loginRole === "teacher" ? "Örn. Sedahoca" : "Öğretmeninizin verdiği kullanıcı adı"} required /></label><label>Şifre<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" placeholder="Şifreniz" required /></label>{loginError && <p className="auth-error">{loginError}</p>}<button className="auth-submit" type="submit">{loginRole === "admin" ? "Admin paneline gir" : loginRole === "teacher" ? "Öğretmen paneline gir" : "Derse başla"}</button></form>
        <small className="auth-help">Öğrenci hesapları öğretmen tarafından oluşturulur.</small>
      </section>
      <aside className="auth-visual"><span>7. SINIF • FEN BİLİMLERİ</span><h2>Her öğrencinin öğrenme yolculuğu görünür olsun.</h2><p>ModAi; ilerlemeyi, doğru ve yanlışları izler; öğretmene sınıf düzeyinde anlaşılır içgörüler sunar.</p><div className="auth-stats"><b>%78<small>ortalama ilerleme</small></b><b>4 sınıf<small>tek panelde</small></b></div></aside>
    </main>
  );

  if (view === "admin") return <AdminDashboard onLogout={logout} />;

  if (view === "teacher") return <TeacherDashboard onLogout={logout} />;

  if (false && view === "teacher") return (
    <main className="teacher-shell">
      <header className="teacher-header"><div className="auth-brand"><span className="brand-mark">M</span><div><b>MODAI</b><small>ÖĞRETMEN PANELİ</small></div></div><div><span>Seda Hoca</span><button onClick={logout}>Çıkış yap</button></div></header>
      <div className="teacher-layout"><aside className="teacher-nav"><button className="active">Genel bakış</button><button>Sınıflarım</button><button>Öğrenciler</button><button>İçerik yönetimi</button><button>Bildirim gönder</button></aside><section className="teacher-main"><div className="teacher-title"><div><p>7 AĞUSTOS 2026</p><h1>Öğrenci ilerleme merkezi</h1><span>Tüm sınıflarını ve öğrencilerinin ihtiyaçlarını tek ekrandan izle.</span></div><button>+ Yeni sınıf oluştur</button></div><div className="metric-grid"><article><span>Toplam öğrenci</span><b>48</b><small>4 sınıfta</small></article><article><span>Ortalama ilerleme</span><b>%69</b><small>Bu hafta +%8</small></article><article><span>Tamamlanan etkinlik</span><b>126</b><small>Son 7 gün</small></article><article><span>Desteğe ihtiyaç duyan</span><b>7</b><small>İncelenmeli</small></article></div><div className="teacher-section"><div className="section-head"><div><h2>Öğrenci durumu</h2><p>Doğru, yanlış, süre ve ihtiyaç duyulan konular</p></div><select aria-label="Sınıf seç"><option>Tüm sınıflar</option><option>5-A</option><option>5-B</option></select></div><div className="student-table"><div className="table-row table-head"><span>Öğrenci</span><span>İlerleme</span><span>Doğru / Yanlış</span><span>Çalışma</span><span>ModAi gözlemi</span></div>{studentOverview.map((student) => <div className="table-row" key={student.name}><span><b>{student.name}</b><small>{student.className}</small></span><span><i><em style={{ width: `${student.progress}%` }} /></i><b>%{student.progress}</b></span><span><b className="ok">{student.correct}</b> / <b className="bad">{student.wrong}</b></span><span>{student.time}</span><span>{student.need}<button>Ayrıntı</button></span></div>)}</div></div></section></div>
      <TeacherManagement />
      <section className="analytics-wrap">
        <div className="analytics-grid">
          <article className="insight-card"><div className="analytics-title"><div><span>SINIF GENELİ</span><h2>En çok takılınan noktalar</h2></div><b>Son 7 gün</b></div><div className="topic-list">{topicInsights.map((item) => <div key={item.topic}><p><span>{item.topic}</span><b>{item.students} öğrenci</b></p><i><em style={{ width: `${item.rate * 2.4}%` }} /></i><small>Öğrencilerin %{item.rate}&apos;i bu noktada en az iki hata yaptı.</small></div>)}</div></article>
          <article className="insight-card ai-impact"><div className="analytics-title"><div><span>MODAI ETKİSİ</span><h2>Yapay zekâdan faydalanma</h2></div><b>%67 etkili</b></div><div className="impact-number"><strong>43</strong><p>Bu hafta gösterilen ipucu<small>29 ipucundan sonra öğrenci sonraki denemede doğru cevap verdi.</small></p></div><div className="impact-split"><span><b>11</b>örnek açıklama</span><span><b>8</b>öğretmen incelemesi</span><span><b>3,4</b>ortalama ipucu</span></div></article>
        </div>
        <article className="analytics-panel"><div className="analytics-title"><div><span>ÖĞRENCİ BAZINDA</span><h2>ModAi kullanım ve fayda analizi</h2></div><button>Raporu indir</button></div><div className="ai-table"><div className="ai-row ai-head"><span>Öğrenci</span><span>ModAi kullanımı</span><span>İpucu sonrası</span><span>Fayda oranı</span><span>En çok destek aldığı konu</span></div>{aiUsage.map((item) => <div className="ai-row" key={item.name}><span><b>{item.name}</b></span><span>{item.uses} etkileşim</span><span>{item.afterHelp}</span><span><i><em style={{ width: `${item.benefit}%` }} /></i><b>%{item.benefit}</b></span><span>{item.focus}</span></div>)}</div></article>
        <article className="analytics-panel"><div className="analytics-title"><div><span>CANLI AKIŞ</span><h2>Öğrenme ve müdahale logları</h2></div><button>Tüm logları gör</button></div><div className="log-list">{activityLogs.map((log, index) => <div className="log-row" key={`${log.time}-${log.student}`}><time>{log.time}</time><span className={`log-dot l${index}`} /><span><b>{log.student}</b><small>{log.event}</small></span><span>{log.detail}</span><strong>{log.result}</strong></div>)}</div></article>
      </section>
    </main>
  );

  return (
    <main className={`app-shell ${mascotOpen ? "assistant-open" : ""}`}>
      <header className="topbar">
        <a className="brand" href="#" aria-label="ModAi Fen ana sayfa">
          <span className="brand-mark">M</span>
          <span><b>MODAI</b><small>FEN</small></span>
        </a>
        <div className="lesson-title"><span>7. SINIF • IŞIK ÜNİTESİ</span><strong>Işığın Kırılması</strong></div>
        <div className="student"><button className="install-button" onClick={installApp} disabled={isInstalled}>{isInstalled ? "Yüklendi" : "Uygulamayı yükle"}</button><span className="student-avatar">E</span><span><b>Ece Yılmaz</b><small>7-A Sınıfı</small></span><button aria-label="Öğrenci menüsünü aç">⌄</button></div>
      </header>

      <section className="lesson-bar">
        <div><span className="live-dot" /> <b>Öğretmen yönlendirmesi</b><p>2. Etkinlik: Işığın ortam değiştirirken izlediği yolu keşfet</p></div>
        <div className="progress-wrap"><span>{progress}% tamamlandı</span><div className="progress"><i style={{ width: `${progress}%` }} /></div></div>
      </section>

      <div className="workspace">
        <aside className="sidebar">
          <p className="eyebrow">DERS AKIŞI</p>
          {[
            ["✓", "Işığın Yayılması", "Tamamlandı"],
            ["02", "Işığın Kırılması", "Şimdi buradasın"],
            ["03", "Kırılma Kanunları", "Sıradaki"],
            ["04", "Merceklerde Kırılma", "Kilitli"],
            ["05", "Kendini Değerlendir", "Kilitli"],
          ].map((item, index) => <button key={item[1]} className={`nav-item ${index === 1 ? "active" : ""} ${index > 2 ? "locked" : ""}`}><span>{item[0]}</span><div><b>{item[1]}</b><small>{item[2]}</small></div></button>)}
          <div className="teacher-note"><span>ÖĞRETMEN NOTU</span><p>“Önce normal çizgisini bulun. Işının hangi ortamdan geldiğini tartışmadan cevap vermeyin.”</p><b>— Seda Öğretmen</b></div>
        </aside>

        <section className="content">
          <div className="intro"><div><p className="eyebrow">ETKİLEŞİMLİ IŞIN MODELİ</p><h1>Ortam değişince,<br /><em>ışığın yönü nasıl değişir?</em></h1><p>Işık farklı saydam ortamlara geçtiğinde hızının ve yönünün nasıl değiştiğini model üzerinde keşfet.</p></div><div className="goal"><span>🎯</span><div><small>ÖĞRENME HEDEFİ • {learningContext.outcome}</small><b>Işığın farklı ortamlardaki kırılma davranışını modelleyerek açıklar.</b><em>{learningContext.skill}</em></div></div></div>

          <div className="model-card">
            <div className="model-top"><span>Kırılma modeli üzerinde incele</span><small>Bir bölüme dokun</small></div>
            <div className="stage-row">
              {stages.map((stage, index) => <div className="stage-wrap" key={stage.id}>
                <button className={`stage ${stageIndex === index ? "selected" : ""}`} onClick={() => setStageIndex(index)} aria-label={`${stage.label} basamağını incele`}><span className={`stage-icon s${index}`}>{stage.icon}</span><b>{stage.label}</b><small>{stage.note}</small></button>
                {index < stages.length - 1 && <span className="arrow">→</span>}
              </div>)}
            </div>
            <div className="explain"><span className="explain-icon">{stages[stageIndex].icon}</span><div><small>{stages[stageIndex].label.toUpperCase()} BÖLÜMÜ</small><p><b>{stages[stageIndex].label}</b>, {stages[stageIndex].note.toLocaleLowerCase("tr-TR")}. Işının izlediği yolu yorumlarken açılar her zaman normal çizgisine göre ölçülür.</p></div></div>
          </div>

          <ModelLaboratory/>

          <section className="lesson-visuals"><div><p className="eyebrow">KONU GÖRSELLERİ</p><h2>Işığın kırılması ve mercekleri görerek incele</h2></div><div className="lesson-visual-grid">{opticsScienceImages.map(image=><figure key={image.key}><img src={image.url} srcSet={scienceImageSrcSet(image.url)} sizes="(max-width: 700px) 100vw, 360px" alt={image.name}/><figcaption>{image.name}</figcaption></figure>)}</div></section>

          <div className="challenge">
            <div className="challenge-copy"><span className="question-no">SORU {questionIndex + 1}/{scenarios.length}</span><h2>“{question.label}” durumunda ışın nasıl davranır?</h2><p>{isCorrect ? "Doğru cevap! Şimdi sonraki örneğe ilerleyebilirsin." : "Ortamları ve normal çizgisini inceleyerek en uygun seçeneği işaretle."}</p><div className="answers">{["Normale yaklaşır", "Normalden uzaklaşır", "Doğrultusu değişmez", "Yansıyarak geri döner"].map((answer) => <button key={answer} disabled={isCorrect || completed} onClick={() => choose(answer)} className={`${selected === answer ? "picked" : ""} ${selected === answer && answer === question.type ? "correct" : ""} ${selected === answer && answer !== question.type ? "wrong" : ""}`}>{answer}<span>{selected === answer ? (answer === question.type ? "✓" : "×") : ""}</span></button>)}</div></div>
            <div className="example-card"><div className="refraction-model"><i /><span /></div><b>{question.label}</b><small>Işın yolu • Temsili model</small></div>
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
          <div className="mascot-actions"><button onClick={() => setMessage(`Köprü kurma örneği: ${learningContext.bridge} Işık çok yoğun ortama geçerken yavaşlar ve normale yaklaşır; az yoğun ortama geçerken hızlanır ve normalden uzaklaşır.`)}>Örnek ver</button><button className="sound" aria-label="Maskot mesajını seslendir">♫</button><button className="close-mascot" onClick={() => setMascotOpen(false)} aria-label="Asistanı küçült">×</button></div>
        </>}
      </section>
    </main>
  );
}

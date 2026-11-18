// 공통 헤더 · 푸터 · 데이터 렌더링 · 한/영 전환
// ── 한/영 전환 ─────────────────────────────────────────────
// 언어는 ?lang=en|ko 또는 저장된 선택으로 정합니다. 화면의 한국어 문구는 아래 EN 사전으로,
// 데이터(JSON)는 각 항목의 *_en 필드로 바꿉니다. 사전에 없는 문구는 한국어로 남습니다.
const LANG = (() => {
  const q = new URLSearchParams(location.search).get("lang");
  try { if (q === "en" || q === "ko") localStorage.setItem("lang", q); return q || localStorage.getItem("lang") || "ko"; }
  catch (e) { return q || "ko"; }
})();
const IS_EN = LANG === "en";
document.documentElement.lang = LANG;

const EN = {};          // 한국어 문구 → 영어(HTML 가능). 아래 EN_TEXT에서 채웁니다.
const EN_RULES = [];    // [정규식, 치환] — 날짜처럼 바뀌는 문구용
const HANGUL = /[가-힣]/;
const norm = (s) => s.replace(/\s+/g, " ").trim();

// 영어 문안. 키는 화면에 보이는 한국어 문구(공백 정리) 그대로입니다. 문구를 고치면 여기 키도 같이 고쳐 주세요.
Object.assign(EN, {
  // 공통
  "본문 바로가기": "Skip to content", "메뉴": "Menu", "주요 메뉴": "Main menu", "바닥글": "Footer",
  "퀀텀AI바이오 실증실험실": "Quantum AI Bio Research Lab",
  "홈": "Home", "연구": "Research", "실험실": "Lab", "구성원": "People", "논문": "Publications", "코드": "Code", "뉴스": "News",
  "퀀텀AI바이오 실증실험실 (KJQI-JQL)": "Quantum AI Bio Research Lab (KJQI-JQL)",
  "한국생명공학연구원 KRIBB": "Korea Research Institute of Bioscience and Biotechnology (KRIBB)",
  "한국생명공학연구원 미래동물자원연구센터 AI-Bio 솔루션팀": "AI-Bio Solution Team, Futuristic Animal Resource Research Center, KRIBB",
  "충청북도 청주시 청원구 오창읍 연구단지로 30": "30 Yeongudanji-ro, Ochang-eup, Cheongwon-gu, Cheongju, Chungbuk, Republic of Korea",
  "전체": "All", "더 보기": "More", "아직 소식이 없습니다.": "No news yet.",
  "첫 자동 수집이 끝나면 여기에 표시됩니다.": "Items will appear here after the first automatic collection.",
  "찾는 소식이 없습니다. 검색어를 바꿔 보세요.": "Nothing found. Try a different search.",
  "찾는 항목이 없습니다. 검색어를 바꿔 보세요.": "Nothing found. Try a different search.",
  "arXiv · 양자 바이오": "arXiv · Quantum Bio",
  // 페이지 제목
  "퀀텀AI바이오 실증실험실 · KRIBB": "Quantum AI Bio Research Lab · KRIBB",
  "연구 · 퀀텀AI바이오 실증실험실": "Research · Quantum AI Bio Research Lab",
  "실험실 · 퀀텀AI바이오 실증실험실": "Lab · Quantum AI Bio Research Lab",
  "구성원 · 퀀텀AI바이오 실증실험실": "People · Quantum AI Bio Research Lab",
  "논문 · 퀀텀AI바이오 실증실험실": "Publications · Quantum AI Bio Research Lab",
  "코드 · 퀀텀AI바이오 실증실험실": "Code · Quantum AI Bio Research Lab",
  "뉴스 · 퀀텀AI바이오 실증실험실": "News · Quantum AI Bio Research Lab",
  // 홈
  "생명과학 문제를 양자컴퓨터로 풀고, 고전 계산과 비교해 검증합니다": "We solve life-science problems on quantum computers and validate them against classical computation",
  "한국생명공학연구원 퀀텀AI바이오 실증실험실은 유전자 네트워크, 분자 상호작용, 치료용 서열 설계를 CPU·GPU·QPU를 함께 쓰는 하이브리드 워크플로우로 다룹니다. 양자 하드웨어를 썼다는 사실보다 생물학적 의미와 재현 가능한 비교 결과를 중요하게 봅니다.":
    "The Quantum AI Bio Research Lab at KRIBB tackles gene networks, molecular interactions and therapeutic sequence design with hybrid workflows that combine CPUs, GPUs and QPUs. What matters to us is biological meaning and reproducible comparisons, not simply having used quantum hardware.",
  "연구 보기": "Our research", "공개 코드 →": "Open code →",
  "모듈 A": "Module A", "모듈 B": "Module B", "(γ) · QUBO 비용": "(γ) · QUBO cost", "(β) 혼합": "(β) mixer", "측정": "Measure",
  "그림 1. 유전자 상호작용 네트워크를 두 모듈로 나누는 문제를 QUBO로 바꾸고, QAOA 회로로 최적 분할을 찾는 과정의 모식도. 점선은 모듈 사이를 끊는 연결입니다.":
    "<b>Figure 1.</b> Splitting a gene interaction network into two modules: the problem is written as a QUBO and a QAOA circuit searches for the optimal partition. Dashed lines are the edges cut between modules.",
  "최근 실증 결과": "Latest demonstration",
  "ASFV · PEDV 공통 대식세포 억제 네트워크의 커뮤니티 탐지": "Community detection in the macrophage suppression network shared by ASFV and PEDV",
  "입력": "Input", "정식화": "Formulation", "하드웨어": "Hardware", "STRING 네트워크": "STRING network", "공발현 네트워크": "Co-expression network",
  "공통 하향조절 유전자 471개에서 고른 20-유전자 코어 모듈": 'A <span class="num">20</span>-gene core module selected from <span class="num">471</span> commonly down-regulated genes',
  "모듈성 기반 QUBO, 20 큐비트": 'Modularity QUBO, <span class="num">20</span> qubits',
  "IBM Fez Heron r2 (156 큐비트), QAOA p = 1–3": 'IBM Fez Heron r2 (<span class="num">156</span> qubits), QAOA <span class="num">p = 1–3</span>',
  "p = 3에서 하드웨어 5회 모두 정확한 최적 모듈성 0.499 재현 (근사비 1.000)": 'At <span class="num">p = 3</span>, all <span class="num">5</span> hardware runs reproduced the exact optimal modularity <span class="num">0.499</span> (approximation ratio <span class="num">1.000</span>)',
  "p = 1에서 가장 좋은 평균 성능. 깊이가 커질수록 노이즈 누적으로 성능 저하": 'Best mean performance at <span class="num">p = 1</span>; deeper circuits degrade as noise accumulates',
  "완전탐색 및 Simulated Annealing과 비교했습니다. 튜토리얼 코드로 같은 절차를 작은 네트워크에서 재현할 수 있습니다.": 'Compared against brute force and Simulated Annealing. The <a href="code.html">tutorial code</a> reproduces the same procedure on a small network.',
  "연구 주제": "Research topics", "전체 연구 보기": "All research",
  "실험실 소식": "Lab news", "양자 연구 동향": "Quantum research updates",
  "arXiv와 양자 산업 매체에서 매일 아침 모으고, 매주 한국어로 번역합니다.": "Collected every morning from arXiv and quantum industry media.",
  // 연구
  "Quantum AI for Advanced Biotechnology. 디지털 바이오와 양자-고전 하이브리드 컴퓨팅을 잇는 연구를 합니다.": "Quantum AI for Advanced Biotechnology. Our research connects digital biology with hybrid quantum–classical computing.",
  "왜 양자인가": "Why quantum",
  "지금의 AI는 데이터에서 통계적 패턴을 배워 분자 예측, 오믹스 분석, 바이오 설계를 크게 발전시켰습니다. 그러나 탐색해야 할 조합이 폭발적으로 늘어나는 문제나 복잡한 분자 상호작용 앞에서는 여전히 데이터 품질과 계산 자원의 한계에 부딪힙니다.":
    "Today's AI learns statistical patterns from data and has greatly advanced molecular prediction, omics analysis and biological design. Yet for problems whose search space explodes combinatorially, or for complex molecular interactions, it still runs into limits of data quality and compute.",
  "우리는 양자컴퓨팅을 AI를 대체하는 기술이 아니라 보완하는 계산 자원으로 봅니다. 생물학적으로 의미 있게 문제를 정의하고, 하드웨어 특성에 맞는 알고리즘을 고르고, 오류를 관리하며, 처음부터 끝까지 재현 가능한 벤치마크를 만드는 일이 핵심입니다.":
    "We see quantum computing not as a replacement for AI but as a complementary computational resource. The key is to define problems in biologically meaningful ways, choose algorithms that fit the hardware, manage errors, and build end-to-end reproducible benchmarks.",
  "평가 기준은 생물학적 타당성, 해의 품질, 실행 시간, 자원 비용입니다. 양자 하드웨어를 썼다는 이유만으로 양자 우위를 가정하지 않습니다.":
    "We evaluate biological validity, solution quality, run time and resource cost. We never assume quantum advantage just because quantum hardware was used.",
  "하이브리드 워크플로우": "Hybrid workflow",
  "문제 정의": "Problem definition", "멀티오믹스, 구조, 서열 데이터에서 양자로 풀 만한 하위 문제를 골라냅니다.": "Select subproblems worth solving on quantum hardware from multi-omics, structure and sequence data.",
  "AI · 바이오인포매틱스": "AI · Bioinformatics", "학습과 추론으로 문제를 작은 계산 표현으로 압축합니다.": "Compress the problem into a compact computational representation through learning and inference.",
  "양자 계산": "Quantum computation", "QUBO, QAOA, VQE로 최적화, 샘플링, 양자 시뮬레이션을 수행합니다.": "Run optimization, sampling and quantum simulation with QUBO, QAOA and VQE.",
  "고전 비교": "Classical comparison", "완전탐색, Simulated Annealing과 비교해 재현성을 확인합니다.": "Check reproducibility against brute force and Simulated Annealing.",
  // 실험실
  "실험실 소개": "About the lab",
  "Quantum AI Bio Research Laboratory (KJQI-JQL). 생명과학 문제를 실제 양자컴퓨터에서 풀어 보고 검증하는 실증 실험실입니다.": "Quantum AI Bio Research Laboratory (KJQI-JQL). A demonstration lab that solves life-science problems on real quantum computers and validates the results.",
  "하는 일": "What we do",
  "한국생명공학연구원(KRIBB) 미래동물자원연구센터 AI-Bio 솔루션팀에 속한 실험실입니다. 생물학 질문을 양자 계산 문제로 옮기고, 클라우드로 연결된 여러 양자 하드웨어에서 실행한 뒤 고전 계산과 비교해 결과를 검증합니다.":
    "We are part of the AI-Bio Solution Team at KRIBB's Futuristic Animal Resource Research Center. We translate biological questions into quantum computing problems, run them on several cloud-connected quantum devices, and validate the results against classical computation.",
  "상호운용 가능한 컴퓨팅 인프라, 검증된 연구 워크플로우, 양자·AI·생명과학을 함께 다루는 인력을 키워 양자-고전 하이브리드 컴퓨팅이 인류 건강에 기여할 기반을 만드는 것이 목표입니다.":
    "Our goal is to lay the groundwork for hybrid quantum–classical computing to contribute to human health by building interoperable computing infrastructure, validated research workflows, and people fluent in quantum, AI and life science together.",
  "소속": "Affiliation", "학위과정": "Degree programs", "위치": "Location",
  "UST KRIBB School 바이오융합학과": "UST KRIBB School, Department of Bio-Convergence",
  "충청북도 청주시 청원구 오창읍 연구단지로 30 (KRIBB 오창캠퍼스)": "30 Yeongudanji-ro, Ochang-eup, Cheongju, Chungbuk (KRIBB Ochang campus)",
  "계산 인프라와 양자 플랫폼": "Computing infrastructure and quantum platforms",
  "주요 활동": "Activities", "함께할 연구자를 찾습니다": "Join us",
  "양자컴퓨팅, AI, 바이오인포매틱스 가운데 하나에 깊이가 있고 나머지 둘을 배우고 싶은 분을 기다립니다. UST 석·박사과정이나 박사후연구원으로 함께할 수 있습니다.":
    "We are looking for people with depth in one of quantum computing, AI or bioinformatics who want to learn the other two. You can join as a UST master's or PhD student or as a postdoctoral researcher.",
  "구성원 보기": "Meet the team",
  // 구성원
  "양자 계산, AI, 생명과학을 함께 다루는 사람들입니다.": "People working across quantum computing, AI and life science.",
  // 논문
  "논문 · 발표": "Publications · Talks", "실험실의 논문, 학회 발표, 보고서입니다.": "Papers, conference talks and reports from the lab.",
  "유형": "Type", "저널 논문": "Journal articles", "학회 발표": "Conference talks", "프리프린트": "Preprints", "보고서 · 기고": "Reports · Articles",
  "제목, 저자 검색": "Search title or author", "논문 검색": "Search publications",
  // 코드
  "공개 코드": "Open code", "누구나 같은 결과를 다시 얻을 수 있도록 코드와 튜토리얼을 공개합니다.": "We publish code and tutorials so anyone can reproduce our results.",
  "분류": "Category", "바로 실행해 보기": "Try it now",
  "유전자 네트워크를 두 모듈로 나누는 문제를 QUBO로 만들고 QAOA로 풀어, 완전탐색 · Simulated Annealing 결과와 비교합니다.": "Write the two-module split of a gene network as a QUBO, solve it with QAOA, and compare with brute force and Simulated Annealing.",
  // 뉴스
  "실험실 소식과, arXiv 및 양자 산업 매체에서 매일 아침 모으는 연구 동향입니다. 연구 동향은 매주 한국어로 번역해 올립니다.": "Lab news, plus research updates collected every morning from arXiv and quantum industry media.",
  "한국양자생물학회 뉴스": "Korean Society for Quantum Biology news <small lang=\"en\">(in Korean)</small>",
  "yangja.club에서 더 보기 →": "More at yangja.club →",
  "출처": "Source", "키워드 검색, 예: 단백질, QAOA": "Search keywords, e.g. protein, QAOA", "뉴스 검색": "Search news",
  "소식을 불러오지 못했습니다.": "Could not load news.",
  "링크": "Link",
});
EN_RULES.push([/^매주 갱신 · 업데이트 (.+)$/, "Updated weekly · $1"], [/^업데이트 (.+)$/, "Updated $1"]);

function localize(x) {
  if (!IS_EN || x == null || typeof x !== "object") return x;
  if (Array.isArray(x)) return x.map(localize);
  const out = {};
  for (const [k, v] of Object.entries(x)) out[k] = localize(v);
  for (const k of Object.keys(x)) if (k.endsWith("_en")) out[k.slice(0, -3)] = localize(x[k]);
  return out;
}

function translateNode(el) {
  if (!IS_EN || !el || el.nodeType !== 1 || /^(SCRIPT|STYLE)$/.test(el.tagName) || el.closest("[data-keep-ko]")) return;
  for (const attr of ["placeholder", "aria-label", "alt"]) {
    const v = el.getAttribute(attr);
    if (v && HANGUL.test(v) && EN[norm(v)]) el.setAttribute(attr, EN[norm(v)]);
  }
  const own = [...el.childNodes].some(n => n.nodeType === 3 && HANGUL.test(n.nodeValue));
  if (own) {
    const key = norm(el.textContent);
    if (EN[key] != null) { el.innerHTML = EN[key]; return; }
    for (const [re, rep] of EN_RULES) if (re.test(key)) { el.textContent = key.replace(re, rep); return; }
  }
  for (const c of [...el.children]) translateNode(c);
}

function setupLanguage() {
  if (IS_EN) {
    const t = norm(document.title);
    if (EN[t]) document.title = EN[t];
    translateNode(document.body);
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => translateNode(n.nodeType === 3 ? n.parentElement : n))))
      .observe(document.body, { childList: true, subtree: true });
  }
  const btn = document.querySelector(".lang-toggle");
  if (btn) btn.onclick = () => {
    const next = IS_EN ? "ko" : "en";
    try { localStorage.setItem("lang", next); } catch (e) {}
    const u = new URL(location.href); u.searchParams.set("lang", next); location.href = u.toString();
  };
}

const NAV = [
  ["index.html", "홈"],
  ["research.html", "연구"],
  ["lab.html", "실험실"],
  ["members.html", "구성원"],
  ["publications.html", "논문"],
  ["code.html", "코드"],
  ["news.html", "뉴스"],
];
const REPO = "https://github.com/TKEIBIO/quantum-ai-bio-lab";

function renderChrome() {
  const here = location.pathname.split("/").pop() || "index.html";
  const links = NAV.map(([h, t]) =>
    `<a href="${h}"${h === here ? ' aria-current="page"' : ""}>${t}</a>`).join("");

  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <a class="skip" href="#main">본문 바로가기</a>
    <div class="wrap">
      <a class="brand" href="index.html">
        <img class="brand-mark" src="assets/img/kribb-symbol.png" alt="" width="30" height="30">
        <span class="brand-name">퀀텀AI바이오 실증실험실</span>
        <span class="brand-sub">KRIBB Quantum AI Bio Lab</span>
      </a>
      <div class="header-tools">
        <button class="lang-toggle" type="button" data-keep-ko lang="${IS_EN ? "ko" : "en"}" aria-label="${IS_EN ? "한국어로 보기" : "View in English"}">${IS_EN ? "한국어" : "EN"}</button>
        <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">메뉴</button>
      </div>
      <nav class="nav" id="site-nav" aria-label="주요 메뉴">${links}</nav>
    </div>`;
  document.body.prepend(header);
  const btn = header.querySelector(".nav-toggle");
  btn.onclick = () => {
    const open = header.querySelector(".nav").classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  };

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="wrap">
      <div>
        <a class="kribb-logo" href="https://www.kribb.re.kr" target="_blank" rel="noopener">
          <img src="assets/img/kribb-logo.png" alt="한국생명공학연구원 KRIBB" width="202" height="45"></a>
        <div class="name">퀀텀AI바이오 실증실험실 (KJQI-JQL)</div>
        <span>한국생명공학연구원 미래동물자원연구센터 AI-Bio 솔루션팀</span><br>
        <span>충청북도 청주시 청원구 오창읍 연구단지로 30</span>
      </div>
      <nav aria-label="바닥글">${links.replace(/ aria-current="page"/, "")}<a href="${REPO}">GitHub</a></nav>
    </div>`;
  document.body.append(footer);
}

async function loadJSON(path) {
  try {
    const r = await fetch(path, { cache: "no-cache" });
    if (!r.ok) throw new Error(r.status);
    return localize(await r.json());
  } catch (e) {
    console.warn("load failed", path, e);
    return null;
  }
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function fmtDate(d) {
  if (!d) return "";
  const t = new Date(d);
  return isNaN(t) ? esc(d) : t.toISOString().slice(0, 10);
}

const keywords = (list) => list && list.length
  ? `<div class="keywords">${list.map((t) => `<span>${esc(t)}</span>`).join("")}</div>` : "";

// 양자 연구 동향: 영어 원문(매일 자동 수집)에 한국어 번역(매주 수동 갱신)을 글 주소로 합칩니다.
async function loadQuantumNews() {
  const [q, ko] = await Promise.all([loadJSON("data/quantum-news.json"), loadJSON("data/quantum-news-ko.json")]);
  if (!q || IS_EN) return q;
  const map = (ko && ko.items) || {};
  q.items = (q.items || []).map(n => map[n.url] ? { ...n, titleKo: map[n.url].title, summaryKo: map[n.url].summary } : n);
  return q;
}

function newsItem(n) {
  const title = n.titleKo || n.title, summary = n.titleKo ? n.summaryKo : n.summary;
  return `<article class="row">
    <time class="when" datetime="${esc(n.date)}">${fmtDate(n.date)}</time>
    <div>
      <a class="title" href="${esc(n.url || "#")}"${n.source === "lab" ? "" : ' target="_blank" rel="noopener"'}${n.titleKo ? ` lang="ko"` : ""}>${esc(title)}</a>
      ${summary ? `<p>${esc(summary)}</p>` : ""}
      <div class="meta"><span class="src">${esc(n.sourceName || n.source)}</span>${n.titleKo ? ` · <span class="orig" lang="en">원문: ${esc(n.title)}</span>` : ""}</div>
    </div>
  </article>`;
}

function pubItem(p) {
  const links = [
    p.doi && `<a href="https://doi.org/${esc(p.doi)}">DOI</a>`,
    p.pdf && `<a href="${esc(p.pdf)}">PDF</a>`,
    p.code && `<a href="${esc(p.code)}">코드</a>`,
    p.url && `<a href="${esc(p.url)}">링크</a>`,
  ].filter(Boolean).join("");
  return `<article class="row">
    <div class="when">${esc(p.year)}</div>
    <div>
      <div class="title">${esc(p.title)}</div>
      <p>${esc(p.authors)}</p>
      <div class="meta">${esc(p.venue)}${p.status ? ` · ${esc(p.status)}` : ""}</div>
      ${links ? `<div class="links">${links}</div>` : ""}
    </div>
  </article>`;
}

function filterBar(el, options, current, onPick) {
  el.innerHTML = options.map(([k, v]) =>
    `<button type="button" data-k="${esc(k)}" aria-pressed="${k === current}">${esc(v)}</button>`).join("");
  el.onclick = (e) => {
    const k = e.target.closest("button")?.dataset.k;
    if (k == null) return;
    el.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.k === k));
    onPick(k);
  };
}

document.addEventListener("DOMContentLoaded", () => { renderChrome(); setupLanguage(); });

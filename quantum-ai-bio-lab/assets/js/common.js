// 공통 헤더 · 푸터 · 데이터 렌더링
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
        <span class="brand-name">퀀텀AI바이오 실증실험실</span>
        <span class="brand-sub">KRIBB Quantum AI Bio Lab</span>
      </a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">메뉴</button>
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
        <div class="name">퀀텀AI바이오 실증실험실 (KJQI-JQL)</div>
        한국생명공학연구원 미래동물자원연구센터 AI-Bio 솔루션팀<br>
        충청북도 청주시 청원구 오창읍 연구단지로 30
      </div>
      <nav aria-label="바닥글">${links.replace(/ aria-current="page"/, "")}<a href="${REPO}">GitHub</a></nav>
    </div>`;
  document.body.append(footer);
}

async function loadJSON(path) {
  try {
    const r = await fetch(path, { cache: "no-cache" });
    if (!r.ok) throw new Error(r.status);
    return await r.json();
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

function newsItem(n) {
  return `<article class="row">
    <time class="when" datetime="${esc(n.date)}">${fmtDate(n.date)}</time>
    <div>
      <a class="title" href="${esc(n.url || "#")}"${n.source === "lab" ? "" : ' target="_blank" rel="noopener"'}>${esc(n.title)}</a>
      ${n.summary ? `<p>${esc(n.summary)}</p>` : ""}
      <div class="meta"><span class="src">${esc(n.sourceName || n.source)}</span></div>
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

document.addEventListener("DOMContentLoaded", renderChrome);

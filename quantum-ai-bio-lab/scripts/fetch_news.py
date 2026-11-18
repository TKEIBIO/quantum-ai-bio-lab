#!/usr/bin/env python3
"""양자 최신 뉴스 수집기 — 표준 라이브러리만 사용.

arXiv(quant-ph 전체 + 양자 바이오 키워드)와 양자 산업 뉴스 RSS를 모아
data/quantum-news.json 으로 저장합니다. GitHub Actions에서 매일 실행됩니다.
"""
import json
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "data" / "quantum-news.json"
UA = {"User-Agent": "quantum-ai-bio-lab-news-bot/1.0"}
ATOM = "{http://www.w3.org/2005/Atom}"

ARXIV_QUERIES = {
    "arxiv-bio": ("arXiv · 양자 바이오",
                  '(cat:quant-ph) AND (abs:protein OR abs:drug OR abs:molecular OR abs:genomic OR abs:biolog*)'),
    "arxiv": ("arXiv · quant-ph", "cat:quant-ph"),
}
RSS_FEEDS = {
    "tqi": ("The Quantum Insider", "https://thequantuminsider.com/feed/"),
    "qcr": ("Quantum Computing Report", "https://quantumcomputingreport.com/feed/"),
}


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return r.read()


def clean(text, n=260):
    text = re.sub(r"<[^>]+>", " ", text or "")
    text = re.sub(r"\s+", " ", text).strip()
    return text if len(text) <= n else text[:n].rsplit(" ", 1)[0] + "…"


def fetch_arxiv(key, name, query, n=15):
    url = "https://export.arxiv.org/api/query?" + urllib.parse.urlencode({
        "search_query": query, "sortBy": "submittedDate", "sortOrder": "descending", "max_results": n})
    root = ET.fromstring(get(url))
    for e in root.findall(f"{ATOM}entry"):
        yield {
            "source": key, "sourceName": name,
            "title": clean(e.findtext(f"{ATOM}title"), 300),
            "summary": clean(e.findtext(f"{ATOM}summary")),
            "url": e.findtext(f"{ATOM}id"),
            "date": e.findtext(f"{ATOM}published"),
        }


def fetch_rss(key, name, url, n=15):
    root = ET.fromstring(get(url))
    for it in root.iter("item"):
        d = it.findtext("pubDate")
        try:
            d = parsedate_to_datetime(d).astimezone(timezone.utc).isoformat()
        except Exception:
            pass
        yield {
            "source": key, "sourceName": name,
            "title": clean(it.findtext("title"), 300),
            "summary": clean(it.findtext("description")),
            "url": it.findtext("link"),
            "date": d,
        }
        n -= 1
        if n == 0:
            break


def main():
    items, errors = [], []
    jobs = [(fetch_arxiv, k, *v) for k, v in ARXIV_QUERIES.items()] + \
           [(fetch_rss, k, *v) for k, v in RSS_FEEDS.items()]
    for fn, *args in jobs:
        try:
            items.extend(fn(*args))
        except Exception as e:  # 한 소스가 실패해도 나머지는 저장
            errors.append(f"{args[0]}: {e}")

    seen, uniq = set(), []
    for it in items:
        if it["url"] and it["url"] not in seen:
            seen.add(it["url"])
            uniq.append(it)
    uniq.sort(key=lambda x: x.get("date") or "", reverse=True)

    if not uniq:
        print("no items fetched; keeping previous file", errors, file=sys.stderr)
        return 1
    OUT.write_text(json.dumps({
        "updated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "items": uniq,
    }, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"saved {len(uniq)} items", ("errors: " + "; ".join(errors)) if errors else "")
    return 0


if __name__ == "__main__":
    sys.exit(main())

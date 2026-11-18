#!/usr/bin/env python3
"""한국양자생물학회(yangja.club) 뉴스 수집기 — 표준 라이브러리만 사용.

학회 뉴스 게시판은 RSS를 막아 두었기 때문에 목록 페이지에서 제목과 링크를 읽고,
각 글에서 작성일만 확인해 data/yangja-news.json 으로 저장합니다.
본문은 가져오지 않고 제목·날짜·원문 링크만 보여 줍니다.
"""
import html
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "data" / "yangja-news.json"
LIST_URL = "https://yangja.club/news"
UA = {"User-Agent": "quantum-ai-bio-lab-news-bot/1.0"}
LIMIT = 12

ROW = re.compile(r'<div class="bo_tit">\s*<a href="(https://yangja\.club/news/(\d+))">(.*?)</a>', re.S)
WRITTEN = re.compile(r"작성일(?:<[^>]+>|\s)*(\d{2})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})")


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def text(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def main():
    items, seen = [], set()
    for url, wr_id, title in ROW.findall(get(LIST_URL)):
        if wr_id in seen:
            continue
        seen.add(wr_id)
        date = None
        try:
            m = WRITTEN.search(get(url))
            if m:
                yy, mo, dd, hh, mi = m.groups()
                date = f"20{yy}-{mo}-{dd}T{hh}:{mi}:00+09:00"
        except Exception as e:  # 글 하나가 실패해도 목록은 유지
            print(f"warn: {url}: {e}", file=sys.stderr)
        items.append({"title": text(title), "url": url, "date": date,
                      "source": "kqbs", "sourceName": "한국양자생물학회"})
        if len(items) >= LIMIT:
            break
    if not items:
        sys.exit("yangja.club 목록에서 글을 찾지 못했습니다. 기존 파일을 유지합니다.")
    OUT.write_text(json.dumps({
        "updated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": LIST_URL,
        "items": items,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"saved {len(items)} items -> {OUT}")


if __name__ == "__main__":
    main()

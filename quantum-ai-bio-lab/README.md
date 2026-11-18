# 퀀텀AI바이오 실증실험실 홈페이지

한국생명공학연구원(KRIBB) Quantum AI Bio Research Laboratory 홈페이지입니다.
빌드 도구 없이 HTML + JSON 만으로 동작하며 GitHub Pages로 바로 배포됩니다.

## 구성

| 페이지 | 내용 | 수정할 파일 |
|---|---|---|
| `index.html` | 홈 (주요 연구, 최신 뉴스) | — |
| `research.html` | 연구 소개 | `data/research.json` |
| `lab.html` | 실험실 소개, 양자 플랫폼, 활동 | `data/lab.json` |
| `members.html` | 구성원 | `data/members.json` (사진은 `assets/img/`) |
| `publications.html` | 논문 · 발표 | `data/publications.json` |
| `code.html` | 공개 코드 | `data/code.json`, `code/` |
| `news.html` | 실험실 소식 + 양자 최신 뉴스 | `data/news.json` (수동), `data/quantum-news.json` (자동) |

대부분의 내용 수정은 `data/*.json` 파일만 고치면 됩니다. GitHub 웹에서 파일을 열고 연필 아이콘으로 편집해도 됩니다.

## 양자 최신 뉴스 자동 수집

`.github/workflows/quantum-news.yml` 이 매일 07:00(KST)에 `scripts/fetch_news.py`를 실행해
arXiv(quant-ph, 양자 바이오 키워드), The Quantum Insider, Quantum Computing Report 소식을 `data/quantum-news.json`에 저장합니다.
저장소 **Actions** 탭에서 *Run workflow* 로 즉시 실행할 수도 있습니다.

## 배포 (GitHub Pages)

1. GitHub에서 새 저장소 생성 (예: `quantum-ai-bio-lab`, 또는 `<계정>.github.io`)
2. 이 폴더를 push
3. 저장소 **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**
4. **Settings → Actions → General → Workflow permissions → Read and write** 로 설정 (뉴스 자동 커밋용)

## 로컬 미리보기

```bash
python3 -m http.server 8000
```
브라우저에서 http://localhost:8000 접속 (`file://`로 열면 JSON을 못 읽습니다).

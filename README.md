# 올레길의 디지털 가든

iOS 엔지니어의 개인 블로그 & 디지털 가든

## 📚 소개

순수 HTML/CSS/JavaScript로 만든 미니멀한 개인 블로그입니다.
일상의 생각, 기술 탐구, 여행 기록, 프로젝트를 기록하는 공간입니다.

## 🎨 특징

- **순수 웹 기술**: 무거운 프레임워크 없이 HTML/CSS/JS만 사용
- **정적 호스팅**: 빠른 로딩 속도와 저렴한 운영 비용
- **반응형 디자인**: 모바일, 태블릿, 데스크탑 모두 지원
- **디자인 시스템**: CSS Variables로 일관된 스타일 유지
- **SEO 최적화**: 각 페이지 독립 HTML로 검색 엔진 친화적

## 📂 프로젝트 구조

```
ollekil/
├── index.html              # 메인 랜딩 페이지
├── log/                    # 일상 로그
├── tech/                   # 기술 블로그
├── travel/                 # 여행 기록
├── projects/               # 프로젝트 소개
├── about/                  # 자기소개
├── assets/
│   ├── css/               # 스타일시트
│   ├── js/                # JavaScript
│   └── images/            # 이미지 파일
└── data/                   # JSON 데이터 (향후 추가)
```

## 🚀 로컬 실행

### 방법 1: VS Code Live Server
```bash
# VS Code 설치 후 Live Server 확장 설치
code .
# index.html 우클릭 → "Open with Live Server"
```

### 방법 2: Python HTTP 서버
```bash
cd ollekil
python3 -m http.server 8000
# http://localhost:8000 접속
```

### 방법 3: Node.js http-server
```bash
npm install -g http-server
cd ollekil
http-server
```

## 🎨 커스터마이징

### 색상 변경
`assets/css/variables.css` 파일에서 색상을 변경할 수 있습니다:

```css
:root {
  --color-primary: #2563EB;      /* 메인 색상 */
  --color-secondary: #10B981;    /* 서브 색상 */
  /* ... */
}
```

### 폰트 변경
`assets/css/variables.css` 파일에서 폰트를 변경할 수 있습니다:

```css
:root {
  --font-main: 'Pretendard Variable', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### 레이아웃 조정
`assets/css/variables.css` 파일에서 간격과 크기를 조정할 수 있습니다:

```css
:root {
  --max-width-content: 1000px;   /* 최대 컨텐츠 폭 */
  --spacing-xl: 2rem;            /* 큰 간격 */
  /* ... */
}
```

## 📝 컨텐츠 추가

### 새 포스트 추가
각 섹션의 `index.html` 파일에서 `posts-list` 안에 새 `<article>` 블록을 추가하면 됩니다:

```html
<article class="post-card">
  <time class="post-date">2024.11.22</time>
  <h2 class="post-title">
    <a href="#">새 글 제목</a>
  </h2>
  <p class="post-excerpt">
    글 요약...
  </p>
  <div class="post-tags">
    <span class="tag">태그1</span>
    <span class="tag">태그2</span>
  </div>
</article>
```

## 🌐 배포

### Vercel
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### Netlify
1. netlify.com 접속
2. "Add new site" → "Import an existing project"
3. GitHub 저장소 연결
4. 자동 배포 완료

### GitHub Pages
```bash
# 저장소 설정에서 GitHub Pages 활성화
# Source: main branch / root
```

## 📄 라이선스

MIT License

## 🙏 감사

- 폰트: [Pretendard](https://github.com/orioncactus/pretendard)
- 아이콘: 이모지 사용

---

Made with ❤️ by 올레길

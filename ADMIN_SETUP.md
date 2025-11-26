# 관리자 페이지 설정 가이드

## 📁 별도 Private Repository로 관리

관리자 페이지는 보안을 위해 **별도의 Private Repository**로 분리되었습니다.

## 🎯 설정 단계

### 1단계: Private Repository 생성

1. GitHub에서 새 저장소 생성
2. 이름: `ollekil-admin` (또는 원하는 이름)
3. **❗ 반드시 Private으로 설정**

### 2단계: Admin 파일 복사

현재 `admin/` 폴더의 내용을 새 저장소로 복사:

```bash
# 임시 폴더에 admin 구조 준비됨
cd /tmp/ollekil-admin

# Git 초기화
git init
git add .
git commit -m "Initial admin panel setup"

# Private repo에 푸시
git remote add origin https://github.com/jejuolledev/ollekil-admin.git
git branch -M main
git push -u origin main
```

### 3단계: GitHub Token 설정

Private Repo에서 `assets/js/config.js` 생성:

```javascript
export const CONFIG = {
  GITHUB_TOKEN: 'ghp_your_actual_github_token_here',
};
```

**중요:** Private Repo라서 토큰을 코드에 넣어도 안전합니다!

### 4단계: 배포 (선택사항)

**Vercel 배포:**

```bash
cd ollekil-admin
vercel --prod
```

**Netlify 배포:**
1. Netlify → Add new site
2. Private Repo 연결
3. 자동 배포

### 5단계: 완료!

이제 다음 URL에서 관리자 페이지 접속:
- 로컬: `http://localhost:8000`
- Vercel: `https://ollekil-admin.vercel.app`
- Netlify: `https://ollekil-admin.netlify.app`

## 🔐 보안

### Public Repo (ollekil)
- ❌ admin 폴더 없음
- ✅ 블로그 메인만
- ✅ GitHub Pages 배포

### Private Repo (ollekil-admin)
- ✅ 관리자 페이지만
- ✅ config.js에 토큰 저장 가능
- ✅ 어디서든 접속 가능

## 📊 파일 구조

### Public Repo (ollekil)
```
ollekil/
├── index.html
├── log/
├── tech/
├── travel/
├── projects/
├── about/
├── assets/
│   ├── css/
│   ├── js/
│   │   ├── firebase-config.js
│   │   ├── github-uploader.js
│   │   └── (admin-editor.js는 없음)
│   └── images/
└── (admin 폴더 없음!)
```

### Private Repo (ollekil-admin)
```
ollekil-admin/
├── index.html              # 관리자 에디터
├── assets/
│   ├── css/               # 공유 스타일
│   ├── js/
│   │   ├── firebase-config.js
│   │   ├── github-uploader.js
│   │   ├── admin-editor.js
│   │   └── config.js      # GitHub Token (안전!)
│   └── images/
├── vercel.json
└── README.md
```

## 🚀 사용 흐름

```
[로컬 또는 배포된 Admin Panel]
    ↓ 로그인 (Firebase Auth)
    ↓ 글 작성
    ↓ 이미지 업로드 (GitHub API → Public Repo)
    ↓ 글 발행 (Firestore)
[Public Blog]
    ↓ Firestore에서 글 로드
    ↓ GitHub Pages에서 이미지 표시
[방문자]
```

## ⚠️ 주의사항

1. **Admin Repo는 절대 Public으로 변경하지 마세요!**
2. 배포 URL은 타인과 공유하지 마세요
3. Token이 노출되면 즉시 GitHub에서 삭제하고 재생성

## 💡 팁

- 북마크에 배포 URL 저장
- 모바일에서도 접속 가능
- Firebase Auth로 이중 보안
- GitHub Token 만료 기간 설정 (1년 권장)

---

이제 안전하고 편리하게 어디서든 블로그를 관리할 수 있습니다! 🎉

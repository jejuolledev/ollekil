# Firebase 블로그 관리자 기능 사용 가이드

## 🎉 완료된 기능

### ✅ 구현된 기능
1. **Google 로그인/로그아웃**
   - 우측 상단 "로그인" 버튼 클릭
   - Google 계정으로 로그인
   
2. **관리자 전용 글쓰기**
   - `jejuolleapps@gmail.com` 계정만 글 작성/수정/삭제 가능
   - 로그인 후 "글쓰기" 버튼 표시
   
3. **글 작성/수정/삭제**
   - `/admin/` 페이지에서 글 작성
   - 각 포스트에 수정/삭제 버튼 표시 (관리자만)
   
4. **동적 포스트 로딩**
   - Firestore에서 실시간으로 포스트 불러오기
   - 카테고리별 자동 분류

---

## 🚀 사용 방법

### 1단계: Authentication 설정 확인

Firebase Console에서 Google 로그인이 활성화되었는지 확인:

1. https://console.firebase.google.com/project/ollekil-blog/authentication 접속
2. "Sign-in method" 탭
3. Google 제공업체가 "사용 설정됨"인지 확인

### 2단계: Firestore 보안 규칙 업데이트 (중요!)

30일 후에는 **반드시** 보안 규칙을 변경해야 합니다:

1. Firebase Console → Firestore Database → 규칙
2. 다음 코드로 교체:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // posts 컬렉션: 모두 읽기 가능, 관리자만 쓰기 가능
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'jejuolleapps@gmail.com';
    }
  }
}
```

3. "게시" 버튼 클릭

---

## 📝 글 작성 방법

### 새 글 작성

1. **로그인**: 우측 상단 "로그인" 버튼 클릭 → Google 로그인
2. **글쓰기 페이지**: "글쓰기" 버튼 클릭 또는 `/admin/` 접속
3. **작성**:
   - 카테고리 선택 (Log, Tech, Travel, Projects)
   - 제목 입력
   - 요약 입력 (선택)
   - 본문 입력
   - 태그 입력 (Enter로 추가)
4. **발행**: "발행하기" 버튼 클릭

### 글 수정

1. 해당 카테고리 페이지에서 포스트 찾기
2. 포스트 하단의 "수정" 버튼 클릭
3. 내용 수정 후 "발행하기" 클릭

### 글 삭제

1. 포스트 하단의 "삭제" 버튼 클릭
2. 확인 팝업에서 "확인" 클릭

---

## 🌐 로컬 테스트 방법

```bash
# 1. 폴더 이동
cd /Users/baejeong-gil/Desktop/ZZB-Labs/webs/ollekil

# 2. 로컬 서버 실행
python3 -m http.server 8000

# 3. 브라우저 접속
# http://localhost:8000
```

---

## 📂 파일 구조

```
ollekil/
├── index.html                      # 메인 페이지
├── log/index.html                  # Log 페이지 (동적 로딩)
├── admin/index.html                # 관리자 페이지
├── assets/
│   ├── js/
│   │   ├── firebase-config.js     # Firebase 설정
│   │   ├── auth.js                # 인증 관리
│   │   ├── admin-editor.js        # 글쓰기 에디터
│   │   └── posts-loader.js        # 포스트 로딩
│   └── css/
│       └── layout.css             # 레이아웃 (인증 UI 추가)
```

---

## ⚙️ Firebase 설정 정보

- **프로젝트 ID**: ollekil-blog
- **관리자 이메일**: jejuolleapps@gmail.com
- **Firestore 컬렉션**: `posts`

### Firestore 데이터 구조

```javascript
posts/{postId}
{
  category: "log" | "tech" | "travel" | "projects",
  title: "글 제목",
  excerpt: "요약",
  content: "본문",
  tags: ["태그1", "태그2"],
  createdAt: "2024-11-22T...",
  updatedAt: "2024-11-22T..."
}
```

---

## 🔒 보안 주의사항

1. **절대 API Key를 공개 저장소에 업로드하지 마세요**
   - 현재는 정적 호스팅이므로 노출되지만
   - Firestore 규칙으로 쓰기 권한 제한됨

2. **관리자 이메일 변경 시**:
   - `/assets/js/firebase-config.js`의 `ADMIN_EMAIL` 수정
   - Firestore 규칙의 이메일도 수정

3. **30일 후 보안 규칙 업데이트 필수!**

---

## 🐛 문제 해결

### 로그인이 안 돼요
- Firebase Console에서 Google 로그인이 활성화되었는지 확인
- 브라우저 콘솔(F12)에서 에러 메시지 확인

### 글이 안 올라가요
- 로그인한 계정이 `jejuolleapps@gmail.com`인지 확인
- Firestore 규칙이 올바른지 확인
- 브라우저 콘솔에서 에러 확인

### 포스트가 안 보여요
- Firestore에 데이터가 있는지 확인
- 카테고리가 올바른지 확인
- 브라우저 콘솔에서 에러 확인

---

## 🎯 다음 단계 (선택)

1. **나머지 페이지 업데이트**
   - tech, travel, projects 페이지에도 동적 로딩 적용
   
2. **개별 포스트 페이지**
   - `/posts/{id}/` 경로로 전체 글 보기
   
3. **이미지 업로드**
   - Firebase Storage 사용
   
4. **검색 기능**
   - Algolia 또는 클라이언트 검색

5. **다크모드**
   - 토글 버튼 추가

---

## 📞 문의

문제가 있으면 스크린샷과 함께 공유해주세요!
```

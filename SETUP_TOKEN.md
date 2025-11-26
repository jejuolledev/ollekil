# GitHub Token 설정 가이드

## 방법 1: Config 파일 사용 (권장) ⭐

**한 번만 설정하면 매번 입력 불필요!**

### 1단계: config.js 파일 생성

```bash
cd assets/js
cp config.template.js config.js
```

### 2단계: GitHub Token 생성

1. [이 링크 클릭](https://github.com/settings/tokens/new?description=Ollekil%20Blog%20Image%20Upload&scopes=repo)
2. "Generate token" 클릭
3. 생성된 토큰 복사

### 3단계: config.js에 토큰 입력

`assets/js/config.js` 파일을 열어서:

```javascript
export const CONFIG = {
  GITHUB_TOKEN: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // 여기에 실제 토큰 붙여넣기
};
```

### 4단계: 완료! 🎉

이제 이미지 업로드 시 자동으로 토큰이 사용됩니다.

**중요:**
- ✅ `config.js`는 `.gitignore`에 등록되어 Git에 커밋되지 않음
- ✅ 로컬에서만 사용되므로 안전
- ✅ `config.template.js`만 Git에 커밋됨

---

## 방법 2: localStorage 사용 (기본값)

config.js 파일이 없으면 자동으로 localStorage 방식 사용:

1. 첫 이미지 업로드 시 팝업에서 토큰 입력
2. 브라우저에 자동 저장
3. 다음부터는 입력 불필요

---

## 토큰 우선순위

1. **config.js 파일** (있으면 사용)
2. **localStorage** (config.js 없으면 사용)
3. **수동 입력** (둘 다 없으면 팝업)

---

## 보안 주의사항 ⚠️

### ❌ 절대 하지 말 것:

```javascript
// 이렇게 소스 코드에 직접 넣지 마세요!
const TOKEN = 'ghp_xxxxx'; // 위험! Git에 커밋되면 노출됨
```

### ✅ 올바른 방법:

```javascript
// config.js 파일 사용 (Git에 커밋 안 됨)
import { CONFIG } from './config.js';
const TOKEN = CONFIG.GITHUB_TOKEN;
```

---

## 문제 해결

### config.js를 만들었는데 토큰이 안 읽혀요

**확인사항:**
1. 파일 위치: `assets/js/config.js` (정확한 경로인지 확인)
2. 파일 내용: `export const CONFIG = { GITHUB_TOKEN: '실제토큰' };`
3. 브라우저 콘솔: F12 눌러서 에러 확인
4. 서버 재시작: Live Server 재시작

### config.js가 Git에 커밋되었어요

```bash
# Git에서 제거 (파일은 유지)
git rm --cached assets/js/config.js

# .gitignore 확인
cat .gitignore  # assets/js/config.js 있는지 확인

# 다시 커밋
git add .gitignore
git commit -m "Add config.js to gitignore"
```

### 토큰이 노출되었어요

1. [GitHub Tokens 페이지](https://github.com/settings/tokens) 접속
2. 노출된 토큰 삭제
3. 새 토큰 생성
4. config.js에 새 토큰 입력

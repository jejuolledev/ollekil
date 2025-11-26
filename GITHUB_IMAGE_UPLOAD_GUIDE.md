# GitHub 이미지 업로드 가이드

## 개요

이 블로그는 **Firebase Storage 대신 GitHub 저장소에 직접 이미지를 저장**합니다.
- ✅ 완전 무료
- ✅ 결제 정보 필요 없음
- ✅ Git으로 버전 관리
- ✅ GitHub Pages가 자동으로 서빙

## 사용 방법

### 1. GitHub Personal Access Token 생성 (최초 1회만)

1. **GitHub Token 생성 페이지로 이동:**
   - [이 링크 클릭](https://github.com/settings/tokens/new?description=Ollekil%20Blog%20Image%20Upload&scopes=repo)
   - 또는 직접: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token

2. **토큰 설정:**
   - Note: `Ollekil Blog Image Upload` (자동 입력됨)
   - Expiration: 원하는 기간 선택 (권장: No expiration 또는 1 year)
   - Select scopes: **`repo`** 체크 (자동 체크됨)

3. **토큰 생성:**
   - 맨 아래 "Generate token" 클릭
   - **생성된 토큰을 복사** (한 번만 보여지므로 안전한 곳에 저장 권장)

### 2. 블로그에서 이미지 업로드

1. **Travel 포스트 작성 페이지에서 이미지 선택**

2. **첫 업로드 시 토큰 입력**
   - 팝업 창이 나타나면 복사한 토큰을 붙여넣기
   - "확인" 클릭
   - 토큰은 브라우저 localStorage에 저장되어 다음부터는 자동으로 사용

3. **이미지 업로드**
   - 여러 이미지를 선택할 수 있습니다 (Ctrl/Cmd + 클릭 또는 Shift + 클릭)
   - "발행하기" 버튼 클릭
   - 이미지가 자동으로 GitHub 저장소에 업로드됩니다

## 작동 원리

1. **이미지 선택:** 브라우저에서 파일 선택
2. **Base64 인코딩:** 이미지를 텍스트로 변환
3. **GitHub API 호출:** `assets/images/travel/` 폴더에 이미지 저장
4. **Git Commit:** GitHub가 자동으로 커밋 생성
5. **URL 저장:** Firestore에 GitHub Pages URL 저장
6. **이미지 표시:** GitHub Pages가 이미지 서빙

## 저장 위치

```
ollekil/
  assets/
    images/
      travel/
        1234567890_image1.jpg
        1234567891_image2.jpg
        ...
```

## 이미지 URL 형식

```
https://jejuolledev.github.io/ollekil/assets/images/travel/1234567890_image.jpg
```

## 토큰 관리

### 토큰 재설정

토큰이 만료되거나 변경해야 하는 경우:

1. 브라우저 콘솔에서 실행:
   ```javascript
   localStorage.removeItem('github_token')
   ```

2. 다음 업로드 시 새 토큰 입력

### 토큰 확인

현재 저장된 토큰 확인:

```javascript
localStorage.getItem('github_token')
```

## 문제 해결

### "GitHub API 오류: Bad credentials"

- 토큰이 잘못되었거나 만료됨
- 해결: 토큰 재설정 (위 참고)

### "권한 오류"

- 토큰에 `repo` 권한이 없음
- 해결: repo 권한이 있는 새 토큰 생성

### "업로드 타임아웃"

- 네트워크가 느리거나 이미지 파일이 너무 큼
- 해결: 이미지 크기 줄이기 (권장: 5MB 이하)

### 이미지가 표시되지 않음

- GitHub Pages 배포 대기 중 (최대 1-2분 소요)
- 해결: 잠시 후 페이지 새로고침

## 보안

- 토큰은 브라우저 localStorage에만 저장됨
- 다른 사용자와 공유되지 않음
- repo 권한만 있으면 되므로 큰 보안 문제 없음
- 토큰은 언제든지 GitHub에서 삭제 가능

## 참고

- GitHub API Rate Limit: 인증된 요청 시간당 5,000회 (충분함)
- 저장소 크기 제한: GitHub는 1GB 권장, 5GB 제한 (일반 블로그는 문제 없음)
- 파일 크기 제한: GitHub API는 100MB까지 지원

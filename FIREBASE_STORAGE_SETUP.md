# Firebase Storage 설정 가이드

이미지 업로드가 작동하지 않는 경우, Firebase Storage 규칙을 확인하고 설정해야 합니다.

## 1. Firebase Console에서 Storage 규칙 확인

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. `ollekil-blog` 프로젝트 선택
3. 왼쪽 메뉴에서 **Storage** 클릭
4. 상단 탭에서 **Rules** 클릭

## 2. Storage 규칙 설정

현재 프로젝트의 `storage.rules` 파일 내용을 Firebase Console에 복사하여 붙여넣기:

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /travel/{imageId} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email == 'jejuolleapps@gmail.com';
    }

    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email == 'jejuolleapps@gmail.com';
    }
  }
}
```

3. **Publish** 버튼 클릭하여 규칙 배포

## 3. Firebase CLI로 배포 (선택사항)

Firebase CLI가 설치되어 있다면:

```bash
firebase deploy --only storage
```

## 4. 문제 해결

### 브라우저 콘솔에서 에러 확인

1. 이미지 업로드 시도
2. 브라우저 개발자 도구 열기 (F12)
3. Console 탭에서 에러 메시지 확인

### 일반적인 에러와 해결방법

#### `storage/unauthorized`
- **원인**: Storage 규칙에서 업로드 권한이 없음
- **해결**: 위의 규칙을 Firebase Console에 적용

#### `storage/unknown`
- **원인**: 네트워크 문제 또는 Storage 버킷 설정 문제
- **해결**:
  1. 네트워크 연결 확인
  2. Firebase Console에서 Storage가 활성화되어 있는지 확인

#### `업로드 타임아웃`
- **원인**: 파일이 너무 크거나 네트워크가 느림
- **해결**:
  1. 이미지 파일 크기 줄이기 (권장: 5MB 이하)
  2. 안정적인 네트워크 환경에서 시도

#### `Firebase Storage가 초기화되지 않았습니다`
- **원인**: Firebase 설정 오류
- **해결**: 페이지 새로고침 후 재시도

## 5. Storage 버킷 확인

Firebase Console > Storage에서:
- 버킷 이름: `ollekil-blog.firebasestorage.app`
- 위치가 설정되어 있는지 확인
- Storage가 활성화되어 있는지 확인

## 6. 테스트

1. 관리자 계정(`jejuolleapps@gmail.com`)으로 로그인
2. Travel 포스트 작성 페이지 이동
3. 이미지 선택 (5MB 이하 권장)
4. 브라우저 콘솔 열어서 로그 확인
5. 업로드 시도

콘솔에 다음과 같은 로그가 나타나야 정상:
```
이미지 업로드 시작: travel/1234567890_image.jpg (2.34MB)
Storage 버킷: ollekil-blog.firebasestorage.app
사용자: jejuolleapps@gmail.com
uploadBytes 시작...
uploadBytes 완료: [UploadResult]
getDownloadURL 시작...
업로드 성공: https://firebasestorage.googleapis.com/...
```

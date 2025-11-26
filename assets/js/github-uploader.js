// ============================================
// GitHub 이미지 업로더
// ============================================

// 로컬 설정 파일에서 토큰 가져오기 (선택사항)
let CONFIG = null;
try {
  const configModule = await import('./config.js');
  CONFIG = configModule.CONFIG;
  console.log('✅ config.js에서 GitHub 토큰 로드됨');
} catch (e) {
  console.log('ℹ️ config.js 없음 - localStorage 또는 수동 입력 사용');
}

// GitHub 저장소 정보
const GITHUB_OWNER = 'jejuolledev';
const GITHUB_REPO = 'ollekil';
const GITHUB_BRANCH = 'main';
const IMAGE_BASE_PATH = 'assets/images/travel';

// GitHub Personal Access Token 관리
class GitHubTokenManager {
  constructor() {
    this.storageKey = 'github_token';
  }

  // 토큰 가져오기
  getToken() {
    // 1순위: config.js 파일에서
    if (CONFIG && CONFIG.GITHUB_TOKEN && CONFIG.GITHUB_TOKEN !== 'YOUR_GITHUB_TOKEN_HERE') {
      return CONFIG.GITHUB_TOKEN;
    }

    // 2순위: localStorage에서
    return localStorage.getItem(this.storageKey);
  }

  // 토큰 저장
  setToken(token) {
    localStorage.setItem(this.storageKey, token);
  }

  // 토큰 삭제
  clearToken() {
    localStorage.removeItem(this.storageKey);
  }

  // 토큰이 있는지 확인
  hasToken() {
    return !!this.getToken();
  }

  // 토큰 입력 받기
  async promptForToken() {
    const token = prompt(
      'GitHub Personal Access Token을 입력하세요:\n\n' +
      '토큰 생성 방법:\n' +
      '1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)\n' +
      '2. "Generate new token (classic)" 클릭\n' +
      '3. "repo" 권한 체크\n' +
      '4. 생성된 토큰 복사\n\n' +
      '토큰은 브라우저에 안전하게 저장됩니다.'
    );

    if (token && token.trim()) {
      this.setToken(token.trim());
      return token.trim();
    }

    return null;
  }

  // 토큰 가져오기 (없으면 입력 받기)
  async ensureToken() {
    let token = this.getToken();

    if (!token) {
      token = await this.promptForToken();
    }

    return token;
  }
}

// GitHub API를 사용한 이미지 업로드
class GitHubImageUploader {
  constructor() {
    this.tokenManager = new GitHubTokenManager();
    this.apiBase = 'https://api.github.com';
  }

  // 파일을 Base64로 인코딩
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // "data:image/jpeg;base64,..." 형식에서 Base64 부분만 추출
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // GitHub API로 파일 업로드
  async uploadFile(path, content, message, token) {
    const url = `${this.apiBase}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: message,
        content: content,
        branch: GITHUB_BRANCH
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GitHub API 오류: ${error.message || response.statusText}`);
    }

    return await response.json();
  }

  // 이미지 업로드 (메인 함수)
  async uploadImage(file) {
    try {
      // 토큰 확인
      const token = await this.tokenManager.ensureToken();
      if (!token) {
        throw new Error('GitHub 토큰이 필요합니다.');
      }

      // 파일명 생성
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${safeFileName}`;
      const filePath = `${IMAGE_BASE_PATH}/${fileName}`;

      console.log(`GitHub에 이미지 업로드 시작: ${filePath}`);

      // 파일을 Base64로 변환
      const base64Content = await this.fileToBase64(file);

      // GitHub API로 업로드
      const result = await this.uploadFile(
        filePath,
        base64Content,
        `Upload travel image: ${fileName}`,
        token
      );

      // GitHub Pages URL 생성
      const imageUrl = `https://${GITHUB_OWNER}.github.io/${GITHUB_REPO}/${filePath}`;

      console.log('GitHub 업로드 성공:', imageUrl);

      return imageUrl;
    } catch (error) {
      console.error('GitHub 업로드 실패:', error);

      // 토큰 관련 에러면 토큰 초기화
      if (error.message.includes('401') || error.message.includes('Bad credentials')) {
        this.tokenManager.clearToken();
        throw new Error('GitHub 토큰이 유효하지 않습니다. 다시 시도해주세요.');
      }

      throw error;
    }
  }

  // 여러 이미지 업로드
  async uploadImages(files, onProgress) {
    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (onProgress) {
        onProgress(i + 1, files.length, file.name);
      }

      try {
        const url = await this.uploadImage(file);
        results.push(url);
      } catch (error) {
        console.error(`이미지 ${i + 1} 업로드 실패:`, error);
        errors.push({ file: file.name, error: error.message });
        // 에러 발생 시 중단
        break;
      }
    }

    if (errors.length > 0) {
      throw new Error(`이미지 업로드 실패:\n${errors.map(e => `- ${e.file}: ${e.error}`).join('\n')}`);
    }

    return results;
  }

  // 토큰 재설정
  resetToken() {
    this.tokenManager.clearToken();
    alert('GitHub 토큰이 삭제되었습니다. 다음 업로드 시 다시 입력해주세요.');
  }

  // 토큰 상태 확인
  hasToken() {
    return this.tokenManager.hasToken();
  }
}

// Export
export const githubUploader = new GitHubImageUploader();

// ============================================
// 인증 상태 관리
// ============================================

import { 
  auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  ADMIN_EMAIL 
} from './firebase-config.js';

// 현재 사용자 상태
let currentUser = null;
let isAdmin = false;

// DOM 요소
let authButton = null;
let userInfo = null;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  authButton = document.getElementById('auth-button');
  userInfo = document.getElementById('user-info');
  
  // 인증 상태 감지
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    isAdmin = user && user.email === ADMIN_EMAIL;
    updateUI();
  });
  
  // 로그인/로그아웃 버튼 이벤트
  if (authButton) {
    authButton.addEventListener('click', handleAuthClick);
  }
});

// 로그인 처리
async function handleLogin() {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
    console.log('로그인 성공');
  } catch (error) {
    console.error('로그인 실패:', error);
    alert('로그인에 실패했습니다.');
  }
}

// 로그아웃 처리
async function handleLogout() {
  try {
    await signOut(auth);
    console.log('로그아웃 성공');
  } catch (error) {
    console.error('로그아웃 실패:', error);
    alert('로그아웃에 실패했습니다.');
  }
}

// 버튼 클릭 처리
function handleAuthClick() {
  if (currentUser) {
    handleLogout();
  } else {
    handleLogin();
  }
}

// UI 업데이트
function updateUI() {
  if (!authButton) return;
  
  if (currentUser) {
    // 로그인 상태
    authButton.textContent = '로그아웃';
    authButton.classList.add('logged-in');
    
    // 관리자인 경우 편집 버튼 표시
    if (isAdmin) {
      showAdminControls();
    }
    
    // 사용자 정보 표시
    if (userInfo) {
      userInfo.textContent = currentUser.email;
      userInfo.style.display = 'block';
    }
  } else {
    // 로그아웃 상태
    authButton.textContent = '로그인';
    authButton.classList.remove('logged-in');
    hideAdminControls();
    
    if (userInfo) {
      userInfo.style.display = 'none';
    }
  }
}

// 관리자 컨트롤 표시
function showAdminControls() {
  // 모든 .admin-only 요소 표시
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = 'block';
  });
  
  // 편집 버튼 추가 (포스트 카드에)
  document.querySelectorAll('.post-card').forEach(card => {
    if (!card.querySelector('.admin-controls')) {
      const controls = document.createElement('div');
      controls.className = 'admin-controls';
      controls.innerHTML = `
        <button class="btn-edit" onclick="editPost(this)">수정</button>
        <button class="btn-delete" onclick="deletePost(this)">삭제</button>
      `;
      card.appendChild(controls);
    }
  });
}

// 관리자 컨트롤 숨기기
function hideAdminControls() {
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = 'none';
  });
  
  document.querySelectorAll('.admin-controls').forEach(el => {
    el.remove();
  });
}

// Export
export { currentUser, isAdmin };

// ============================================
// 관리자 에디터 (글쓰기/수정)
// ============================================

import {
  auth,
  db,
  storage,
  onAuthStateChanged,
  collection,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  ref,
  uploadBytes,
  getDownloadURL,
  ADMIN_EMAIL
} from './firebase-config.js';

// 상태
let isAdmin = false;
let currentPostId = null;
let tags = [];
let currentUser = null;

// DOM 요소
const authMessage = document.getElementById('auth-message');
const editor = document.getElementById('editor');
const pageTitle = document.getElementById('page-title');
const postForm = document.getElementById('post-form');
const postIdInput = document.getElementById('post-id');
const categoryInput = document.getElementById('category');
const titleInput = document.getElementById('title');
const excerptInput = document.getElementById('excerpt');
const contentInput = document.getElementById('content');
const tagsContainer = document.getElementById('tags-container');
const tagInput = document.getElementById('tag-input');
const authButton = document.getElementById('auth-button');
const userInfo = document.getElementById('user-info');

// Travel 필드
const travelImageInput = document.getElementById('travel-image');
const imagePreviewDiv = document.getElementById('image-preview');
const previewContainer = document.getElementById('preview-container');
const imageUrlsInput = document.getElementById('image-urls');
const locationInput = document.getElementById('location');

// Projects 필드
const projectEmojiInput = document.getElementById('project-emoji');
const statusInput = document.getElementById('status');

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 인증 상태 확인
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    isAdmin = user && user.email === ADMIN_EMAIL;
    
    // UI 업데이트
    updateAuthUI();
    
    if (isAdmin) {
      authMessage.style.display = 'none';
      editor.style.display = 'block';
      
      // URL에서 수정할 포스트 ID 가져오기
      const urlParams = new URLSearchParams(window.location.search);
      const editId = urlParams.get('edit');
      
      if (editId) {
        await loadPost(editId);
      }
    } else {
      authMessage.style.display = 'block';
      editor.style.display = 'none';
    }
  });
  
  // 폼 제출
  postForm.addEventListener('submit', handleSubmit);
  
  // 태그 입력
  tagInput.addEventListener('keydown', handleTagInput);
  
  // 카테고리 변경 시 필드 표시/숨김
  categoryInput.addEventListener('change', handleCategoryChange);
  
  // 이미지 업로드 미리보기
  if (travelImageInput) {
    travelImageInput.addEventListener('change', handleImagePreview);
  }
  
  // 초기 카테고리 필드 설정
  handleCategoryChange();
  
  // 인증 버튼 클릭 이벤트
  if (authButton) {
    authButton.addEventListener('click', handleAuthClick);
  }
});

// 인증 UI 업데이트
function updateAuthUI() {
  if (!authButton) return;
  
  if (currentUser) {
    // 로그인 상태
    authButton.textContent = '로그아웃';
    authButton.classList.add('logged-in');
    
    if (userInfo) {
      userInfo.textContent = currentUser.email;
      userInfo.style.display = 'inline';
    }
  } else {
    // 로그아웃 상태
    authButton.textContent = '로그인';
    authButton.classList.remove('logged-in');
    
    if (userInfo) {
      userInfo.style.display = 'none';
    }
  }
}

// 인증 버튼 클릭 처리
async function handleAuthClick() {
  if (currentUser) {
    // 로그아웃
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃에 실패했습니다.');
    }
  } else {
    // 로그인
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인에 실패했습니다.');
    }
  }
}

// 카테골0리 변경 처리
function handleCategoryChange() {
  const category = categoryInput.value;
  const categoryFields = document.querySelectorAll('.category-field');
  
  // 모든 카테고리 필드 숨김
  categoryFields.forEach(field => {
    field.style.display = 'none';
  });
  
  // 선택된 카테고리 필드만 표시
  const selectedFields = document.querySelectorAll(`[data-category="${category}"]`);
  selectedFields.forEach(field => {
    field.style.display = 'block';
  });
}

// 포스트 불러오기 (수정 시)
async function loadPost(postId) {
  try {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const post = docSnap.data();
      
      pageTitle.textContent = '글 수정';
      postIdInput.value = postId;
      categoryInput.value = post.category;
      titleInput.value = post.title;
      excerptInput.value = post.excerpt || '';
      contentInput.value = post.content;
      
      // 태그 복원
      tags = post.tags || [];
      renderTags();
      
      // 카테고리별 필드 복원
      if (post.category === 'travel') {
        locationInput.value = post.location || '';

        // 기존 이미지 URL 복원
        if (post.imageUrls && post.imageUrls.length > 0) {
          imageUrlsInput.value = JSON.stringify(post.imageUrls);

          // 미리보기 표시
          previewContainer.innerHTML = '';
          post.imageUrls.forEach((url, index) => {
            const imgWrapper = document.createElement('div');
            imgWrapper.style.cssText = 'position: relative; width: 150px;';

            const img = document.createElement('img');
            img.src = url;
            img.alt = `미리보기 ${index + 1}`;
            img.style.cssText = 'width: 100%; height: 150px; object-fit: cover; border-radius: 8px;';

            imgWrapper.appendChild(img);
            previewContainer.appendChild(imgWrapper);
          });

          imagePreviewDiv.style.display = 'block';
        }
      } else if (post.category === 'projects') {
        projectEmojiInput.value = post.emoji || '';
        statusInput.value = post.status || 'active';
      }
      
      // 카테고리 필드 표시
      handleCategoryChange();
      
      currentPostId = postId;
    } else {
      alert('포스트를 찾을 수 없습니다.');
      window.location.href = '/admin/';
    }
  } catch (error) {
    console.error('포스트 로딩 실패:', error);
    alert('포스트를 불러오는데 실패했습니다.');
  }
}

// 로딩 오버레이 생성
function createLoadingOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'upload-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    color: white;
  `;

  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 60px;
    height: 60px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  `;

  const message = document.createElement('div');
  message.id = 'upload-message';
  message.style.cssText = `
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 10px;
  `;

  const progress = document.createElement('div');
  progress.id = 'upload-progress';
  progress.style.cssText = `
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  `;

  overlay.appendChild(spinner);
  overlay.appendChild(message);
  overlay.appendChild(progress);

  // 스피너 애니메이션 추가
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(overlay);
  return overlay;
}

// 로딩 오버레이 메시지 업데이트
function updateLoadingMessage(message, progress = '') {
  const messageEl = document.getElementById('upload-message');
  const progressEl = document.getElementById('upload-progress');
  if (messageEl) messageEl.textContent = message;
  if (progressEl) progressEl.textContent = progress;
}

// 로딩 오버레이 제거
function removeLoadingOverlay() {
  const overlay = document.getElementById('upload-overlay');
  if (overlay) overlay.remove();
}

// 폼 제출 처리
async function handleSubmit(e) {
  e.preventDefault();

  if (!isAdmin) {
    alert('관리자만 글을 작성할 수 있습니다.');
    return;
  }

  const submitButton = e.target.querySelector('.btn-submit');
  let overlay = null;
  let success = false;

  try {
    console.log('폼 제출 시작...');

    // 전체 화면 로딩 오버레이 표시
    overlay = createLoadingOverlay();
    updateLoadingMessage('업로드 준비 중...', '');

    // 버튼 비활성화
    submitButton.disabled = true;

    const category = categoryInput.value;
    const postData = {
      category: category,
      title: titleInput.value,
      excerpt: excerptInput.value,
      content: contentInput.value,
      tags: tags,
      updatedAt: new Date().toISOString(),
    };

    // 카테고리별 추가 필드
    if (category === 'travel') {
      // 이미지 업로드
      if (travelImageInput.files && travelImageInput.files.length > 0) {
        const files = Array.from(travelImageInput.files).filter(file => file.type.startsWith('image/'));

        if (files.length === 0) {
          throw new Error('유효한 이미지 파일이 없습니다.');
        }

        console.log(`${files.length}개의 이미지 업로드 시작...`);
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        console.log(`총 파일 크기: ${totalSizeMB}MB`);

        updateLoadingMessage('이미지 업로드 중...', `0/${files.length} (총 ${totalSizeMB}MB)`);

        const imageUrls = [];
        const uploadErrors = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

          updateLoadingMessage(
            '이미지 업로드 중...',
            `${i + 1}/${files.length} - ${file.name} (${fileSizeMB}MB)`
          );
          console.log(`이미지 ${i + 1}/${files.length} 업로드 중: ${file.name} (${fileSizeMB}MB)`);

          try {
            const imageUrl = await uploadImage(file);
            imageUrls.push(imageUrl);
            console.log(`이미지 ${i + 1} 업로드 완료:`, imageUrl);
          } catch (error) {
            console.error(`이미지 ${i + 1} 업로드 실패:`, error);
            uploadErrors.push({ file: file.name, error: error.message });
            // 첫 번째 에러 발생 시 즉시 중단
            break;
          }
        }

        if (uploadErrors.length > 0) {
          const errorMsg = uploadErrors.map(e => `- ${e.file}: ${e.error}`).join('\n');
          throw new Error(`이미지 업로드 실패:\n${errorMsg}\n\n네트워크 연결을 확인하고 다시 시도해주세요.`);
        }

        if (imageUrls.length === 0) {
          throw new Error('업로드된 이미지가 없습니다.');
        }

        postData.imageUrls = imageUrls;
        console.log(`모든 이미지 업로드 완료 (${imageUrls.length}개):`, imageUrls);
      } else if (imageUrlsInput.value) {
        // 기존 이미지 URL 유지 (수정 모드)
        postData.imageUrls = JSON.parse(imageUrlsInput.value);
        console.log('기존 이미지 URL 유지:', postData.imageUrls);
      }

      postData.location = locationInput.value;
    } else if (category === 'projects') {
      postData.emoji = projectEmojiInput.value;
      postData.status = statusInput.value;
    }

    updateLoadingMessage('글 저장 중...', '데이터베이스에 저장하는 중...');

    if (currentPostId) {
      // 수정
      const docRef = doc(db, 'posts', currentPostId);
      await updateDoc(docRef, postData);
      console.log('글 수정 완료');
    } else {
      // 새 글 작성
      postData.createdAt = new Date().toISOString();
      await addDoc(collection(db, 'posts'), postData);
      console.log('글 발행 완료');
    }

    updateLoadingMessage('완료!', '페이지로 이동 중...');
    success = true;

    // 짧은 딜레이 후 페이지 이동 (사용자가 완료 메시지를 볼 수 있도록)
    await new Promise(resolve => setTimeout(resolve, 500));

    // 해당 카테고리 페이지로 이동
    window.location.href = `/${postData.category}/`;
  } catch (error) {
    console.error('저장 실패:', error);

    // 로딩 오버레이 제거
    removeLoadingOverlay();

    // 사용자에게 에러 메시지 표시
    const errorMessage = error.message || '알 수 없는 오류가 발생했습니다.';
    alert('글 저장에 실패했습니다:\n\n' + errorMessage);

    // 버튼 복원
    submitButton.disabled = false;
  } finally {
    // 성공하지 못한 경우 (페이지 이동하지 않은 경우)에만 정리
    if (!success) {
      // 혹시 모를 경우를 대비해 오버레이 한번 더 제거 시도
      setTimeout(() => {
        removeLoadingOverlay();
        submitButton.disabled = false;
      }, 100);
    }
  }
}

// 태그 입력 처리
function handleTagInput(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const tag = tagInput.value.trim();
    
    if (tag && !tags.includes(tag)) {
      tags.push(tag);
      renderTags();
      tagInput.value = '';
    }
  }
}

// 태그 렌더링
function renderTags() {
  // 기존 태그 제거 (input은 유지)
  tagsContainer.querySelectorAll('.tag-item').forEach(el => el.remove());
  
  // 태그 추가
  tags.forEach(tag => {
    const tagElement = document.createElement('span');
    tagElement.className = 'tag-item';
    tagElement.innerHTML = `
      ${tag}
      <span class="tag-remove" onclick="removeTag('${tag}')">×</span>
    `;
    tagsContainer.insertBefore(tagElement, tagInput);
  });
}

// 태그 제거
window.removeTag = function(tag) {
  tags = tags.filter(t => t !== tag);
  renderTags();
};

// 이미지 미리보기
function handleImagePreview(e) {
  const files = Array.from(e.target.files);

  if (files.length === 0) {
    imagePreviewDiv.style.display = 'none';
    return;
  }

  console.log(`${files.length}개의 파일이 선택되었습니다.`);

  // 이미지 파일만 필터링
  const imageFiles = files.filter(file => file.type.startsWith('image/'));

  if (imageFiles.length === 0) {
    alert('이미지 파일을 선택해주세요.');
    travelImageInput.value = '';
    imagePreviewDiv.style.display = 'none';
    return;
  }

  // 파일 크기 정보 출력
  const totalSize = imageFiles.reduce((sum, file) => sum + file.size, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`총 파일 크기: ${totalSizeMB}MB`);

  // 미리보기 컨테이너 초기화
  previewContainer.innerHTML = '';

  // 로딩 메시지 표시
  const loadingMsg = document.createElement('div');
  loadingMsg.textContent = '미리보기 생성 중...';
  loadingMsg.style.cssText = 'color: #666; margin-bottom: 1rem;';
  previewContainer.appendChild(loadingMsg);

  let loadedCount = 0;

  imageFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      loadedCount++;

      // 첫 이미지 로드 시 로딩 메시지 제거
      if (loadedCount === 1) {
        loadingMsg.remove();
      }

      const imgWrapper = document.createElement('div');
      imgWrapper.style.cssText = 'position: relative; width: 150px;';

      const img = document.createElement('img');
      img.src = e.target.result;
      img.alt = `미리보기 ${index + 1}`;
      img.style.cssText = 'width: 100%; height: 150px; object-fit: cover; border-radius: 8px;';

      const fileSize = (file.size / (1024 * 1024)).toFixed(2);
      const fileName = document.createElement('div');
      fileName.textContent = file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name;
      fileName.style.cssText = 'font-size: 11px; color: #666; margin-top: 4px; text-align: center;';

      const fileSizeDiv = document.createElement('div');
      fileSizeDiv.textContent = `${fileSize}MB`;
      fileSizeDiv.style.cssText = 'font-size: 10px; color: #999; text-align: center;';

      imgWrapper.appendChild(img);
      imgWrapper.appendChild(fileName);
      imgWrapper.appendChild(fileSizeDiv);
      previewContainer.appendChild(imgWrapper);

      console.log(`미리보기 ${loadedCount}/${imageFiles.length} 생성 완료 (${fileSize}MB)`);
    };
    reader.onerror = function(error) {
      console.error(`파일 읽기 실패: ${file.name}`, error);
      loadedCount++;
    };
    reader.readAsDataURL(file);
  });

  imagePreviewDiv.style.display = 'block';
}

// Promise에 타임아웃 추가하는 헬퍼 함수
function withTimeout(promise, timeoutMs, errorMessage) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

// 이미지 Firebase Storage에 업로드
async function uploadImage(file) {
  if (!file) return null;

  const maxRetries = 3;
  let retryCount = 0;
  const uploadTimeout = 60000; // 60초 타임아웃

  while (retryCount < maxRetries) {
    try {
      // 파일명 생성 (타임스탬프 + 원본 파일명)
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `travel/${timestamp}_${safeFileName}`;

      // Storage 참조 생성
      const storageRef = ref(storage, fileName);

      // 업로드
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      console.log(`이미지 업로드 시작: ${fileName} (${fileSizeMB}MB)`);

      // 타임아웃과 함께 업로드
      await withTimeout(
        uploadBytes(storageRef, file),
        uploadTimeout,
        `업로드 타임아웃 (${uploadTimeout/1000}초 초과)`
      );

      // 다운로드 URL 가져오기 (타임아웃 포함)
      const downloadURL = await withTimeout(
        getDownloadURL(storageRef),
        10000,
        'URL 가져오기 타임아웃 (10초 초과)'
      );
      console.log('업로드 성공:', downloadURL);

      return downloadURL;
    } catch (error) {
      retryCount++;
      console.error(`이미지 업로드 실패 (시도 ${retryCount}/${maxRetries}):`, error);

      if (retryCount >= maxRetries) {
        throw new Error(`이미지 업로드 실패 (${file.name}): ${error.message}`);
      }

      // 재시도 전 대기 (1초, 2초, 3초)
      console.log(`${retryCount}초 후 재시도...`);
      await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
    }
  }
}

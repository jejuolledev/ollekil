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
const emojiInput = document.getElementById('emoji');

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

// 폼 제출 처리
async function handleSubmit(e) {
  e.preventDefault();

  if (!isAdmin) {
    alert('관리자만 글을 작성할 수 있습니다.');
    return;
  }

  const submitButton = e.target.querySelector('.btn-submit');
  const originalButtonText = submitButton.textContent;

  try {
    // 로딩 상태로 변경
    submitButton.disabled = true;
    submitButton.textContent = '업로드 중...';
    submitButton.style.opacity = '0.6';

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
        console.log(`${travelImageInput.files.length}개의 이미지 업로드 시작...`);
        submitButton.textContent = `이미지 업로드 중 (0/${travelImageInput.files.length})...`;

        const imageUrls = [];
        const files = Array.from(travelImageInput.files);

        for (let i = 0; i < files.length; i++) {
          submitButton.textContent = `이미지 업로드 중 (${i + 1}/${files.length})...`;
          console.log(`이미지 ${i + 1}/${files.length} 업로드 중...`);

          const imageUrl = await uploadImage(files[i]);
          imageUrls.push(imageUrl);

          console.log(`이미지 ${i + 1} 업로드 완료:`, imageUrl);
        }

        postData.imageUrls = imageUrls;
        console.log('모든 이미지 URL 저장:', imageUrls);
      } else if (imageUrlsInput.value) {
        // 기존 이미지 URL 유지 (수정 모드)
        postData.imageUrls = JSON.parse(imageUrlsInput.value);
      }

      postData.location = locationInput.value;
    } else if (category === 'projects') {
      postData.emoji = projectEmojiInput.value;
      postData.status = statusInput.value;
    }

    submitButton.textContent = '저장 중...';

    if (currentPostId) {
      // 수정
      const docRef = doc(db, 'posts', currentPostId);
      await updateDoc(docRef, postData);
      alert('글이 수정되었습니다!');
    } else {
      // 새 글 작성
      postData.createdAt = new Date().toISOString();
      await addDoc(collection(db, 'posts'), postData);
      alert('글이 발행되었습니다!');
    }

    // 해당 카테고리 페이지로 이동
    window.location.href = `/${postData.category}/`;
  } catch (error) {
    console.error('저장 실패:', error);
    alert('글 저장에 실패했습니다: ' + error.message);

    // 버튼 복원
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
    submitButton.style.opacity = '1';
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

  if (files.length === 0) return;

  // 이미지 크기 검증 (5MB 제한)
  const maxSize = 5 * 1024 * 1024; // 5MB
  const oversizedFiles = files.filter(file => file.size > maxSize);

  if (oversizedFiles.length > 0) {
    alert(`일부 이미지가 너무 큽니다 (최대 5MB). 큰 이미지를 제거하고 다시 선택해주세요.\n큰 파일: ${oversizedFiles.map(f => f.name).join(', ')}`);
    travelImageInput.value = ''; // 파일 선택 초기화
    return;
  }

  // 미리보기 컨테이너 초기화
  previewContainer.innerHTML = '';

  files.forEach((file, index) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const imgWrapper = document.createElement('div');
        imgWrapper.style.cssText = 'position: relative; width: 150px;';

        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = `미리보기 ${index + 1}`;
        img.style.cssText = 'width: 100%; height: 150px; object-fit: cover; border-radius: 8px;';

        const fileName = document.createElement('div');
        fileName.textContent = file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name;
        fileName.style.cssText = 'font-size: 11px; color: #666; margin-top: 4px; text-align: center;';

        imgWrapper.appendChild(img);
        imgWrapper.appendChild(fileName);
        previewContainer.appendChild(imgWrapper);
      };
      reader.readAsDataURL(file);
    }
  });

  imagePreviewDiv.style.display = 'block';
}

// 이미지 Firebase Storage에 업로드
async function uploadImage(file) {
  if (!file) return null;
  
  try {
    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now();
    const fileName = `travel/${timestamp}_${file.name}`;
    
    // Storage 참조 생성
    const storageRef = ref(storage, fileName);
    
    // 업로드
    console.log('이미지 업로드 시작:', fileName);
    await uploadBytes(storageRef, file);
    
    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(storageRef);
    console.log('업로드 성공:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    throw error;
  }
}

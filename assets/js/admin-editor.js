// ============================================
// 관리자 에디터 (글쓰기/수정)
// ============================================

import {
  auth,
  db,
  onAuthStateChanged,
  collection,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  ADMIN_EMAIL
} from './firebase-config.js';

// 상태
let isAdmin = false;
let currentPostId = null;
let tags = [];

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

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 인증 상태 확인
  onAuthStateChanged(auth, async (user) => {
    isAdmin = user && user.email === ADMIN_EMAIL;
    
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
});

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
  
  const postData = {
    category: categoryInput.value,
    title: titleInput.value,
    excerpt: excerptInput.value,
    content: contentInput.value,
    tags: tags,
    updatedAt: new Date().toISOString(),
  };
  
  try {
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

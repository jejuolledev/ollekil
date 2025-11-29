// ============================================
// 포스트 동적 로딩
// ============================================

import {
  db,
  collection,
  getDocs,
  query,
  orderBy
} from './firebase-config.js';

// 초기화 - 바로 포스트 로드 (인증 불필요, 공개 블로그)
document.addEventListener('DOMContentLoaded', async () => {
  await loadPosts();
});

// 포스트 불러오기
async function loadPosts() {
  const postsContainer = document.getElementById('posts-container');
  if (!postsContainer) return;
  
  // 현재 카테고리 확인
  const path = window.location.pathname;
  let category = 'log';
  if (path.includes('/tech/')) category = 'tech';
  else if (path.includes('/travel/')) category = 'travel';
  else if (path.includes('/projects/')) category = 'projects';
  
  try {
    // Firestore에서 포스트 가져오기
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    // 카테고리별 필터링
    const posts = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.category === category) {
        posts.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    // 포스트 렌더링
    if (posts.length === 0) {
      postsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p class="empty-state-text">아직 작성된 글이 없습니다.</p>
        </div>
      `;
    } else {
      postsContainer.innerHTML = posts.map(post => renderPost(post)).join('');
    }
  } catch (error) {
    console.error('포스트 로딩 실패:', error);
    postsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <p class="empty-state-text">포스트를 불러오는데 실패했습니다.</p>
      </div>
    `;
  }
}

// 포스트 렌더링
function renderPost(post) {
  const path = window.location.pathname;
  let category = 'log';
  if (path.includes('/tech/')) category = 'tech';
  else if (path.includes('/travel/')) category = 'travel';
  else if (path.includes('/projects/')) category = 'projects';
  
  // 카테고리별 렌더링
  if (category === 'travel') {
    return renderTravelPost(post);
  } else if (category === 'projects') {
    return renderProjectPost(post);
  } else {
    return renderDefaultPost(post);
  }
}

// 기본 포스트 렌더링 (Log, Tech)
function renderDefaultPost(post) {
  const date = new Date(post.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\. /g, '.').replace('.', '');

  const tags = (post.tags || []).map(tag =>
    `<span class="tag">${tag}</span>`
  ).join('');

  return `
    <article class="post-card" data-id="${post.id}">
      <time class="post-date">${date}</time>
      <h2 class="post-title">
        <a href="#">${post.title}</a>
      </h2>
      <p class="post-excerpt">${post.excerpt || post.content.substring(0, 150) + '...'}</p>
      <div class="post-tags">${tags}</div>
    </article>
  `;
}

// Travel 포스트 렌더링
function renderTravelPost(post) {
  const date = new Date(post.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long'
  });

  // 이미지 URL이 있으면 실제 이미지 표시, 없으면 기본 이모지 표시
  // 여러 이미지가 있으면 첫 번째 이미지를 대표로 사용
  const imageUrl = post.imageUrls && post.imageUrls.length > 0
    ? post.imageUrls[0]
    : post.imageUrl; // 기존 단일 이미지 지원 (하위 호환성)

  const imageHtml = imageUrl
    ? `<img src="${imageUrl}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">`
    : `<div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 4rem;">✈️</div>`;

  return `
    <article class="travel-card" data-id="${post.id}">
      <a href="#">
        <div class="travel-image">${imageHtml}</div>
        <div class="travel-content">
          <div class="travel-location">${post.location || ''}</div>
          <h2 class="travel-title">${post.title}</h2>
          <time class="travel-date">${date}</time>
          <p class="travel-excerpt">${post.excerpt || post.content.substring(0, 150) + '...'}</p>
        </div>
      </a>
    </article>
  `;
}

// Projects 포스트 렌더링
function renderProjectPost(post) {
  const tags = (post.tags || []).map(tag =>
    `<span class="tech-badge">${tag}</span>`
  ).join('');

  const links = (post.links || []).map(link =>
    `<a href="${link.url}" class="project-link">
      <span>${link.emoji || '🔗'}</span>
      ${link.label}
    </a>`
  ).join('');

  return `
    <article class="project-card" data-id="${post.id}">
      <div class="project-header">
        <div class="project-icon">${post.emoji || '🚀'}</div>
        <div class="project-info">
          <h2 class="project-title">${post.title}</h2>
          <span class="project-status ${post.status === 'active' ? 'status-active' : 'status-planning'}">
            ${post.status === 'active' ? '운영 중' : '기획 중'}
          </span>
        </div>
      </div>
      <p class="project-description">${post.content}</p>
      <div class="project-tech">${tags}</div>
      <div class="project-links">${links}</div>
    </article>
  `;
}

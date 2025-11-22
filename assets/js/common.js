// ============================================
// 공통 JavaScript 기능
// ============================================

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', () => {
  // 현재 연도를 푸터에 자동 표시
  const yearElement = document.querySelector('.current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // 모바일 메뉴 토글 (나중에 추가 시)
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  
  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
      siteNav.classList.toggle('active');
    });
  }

  // 스크롤 시 헤더 그림자 추가
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        header.style.boxShadow = 'var(--shadow-sm)';
      } else {
        header.style.boxShadow = 'none';
      }
    });
  }
});

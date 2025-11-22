// ============================================
// 네비게이션 활성 상태 관리
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // 현재 페이지 경로 가져오기
  const currentPath = window.location.pathname;
  
  // 모든 네비게이션 링크 가져오기
  const navLinks = document.querySelectorAll('.site-nav a');
  
  navLinks.forEach(link => {
    const linkPath = new URL(link.href).pathname;
    
    // 현재 경로와 링크 경로 비교
    if (currentPath === linkPath || 
        (linkPath !== '/' && currentPath.startsWith(linkPath))) {
      link.classList.add('active');
    }
  });
});

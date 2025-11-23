// HTML에서 현재 관심사 데이터 파싱
function parseInterestsFromHTML() {
  const interestsGrid = document.querySelector('.interests-grid');
  if (!interestsGrid) return [];
  
  const cards = interestsGrid.querySelectorAll('.card');
  const interests = [];
  
  cards.forEach(card => {
    const title = card.querySelector('.card-title');
    const excerpt = card.querySelector('.card-excerpt');
    
    if (title && excerpt) {
      const titleText = title.textContent.trim();
      // 첫 글자는 이모지, 나머지는 텍스트로 간주
      const icon = titleText.charAt(0);
      const titleOnly = titleText.substring(1).trim();
      
      interests.push({
        icon: icon,
        title: titleOnly,
        description: excerpt.textContent.trim()
      });
    }
  });
  
  console.log('파싱된 관심사:', interests);
  return interests;
}

// HTML에서 현재 사이트 소개 데이터 파싱
function parseSiteInfoFromHTML() {
  const siteInfoCard = document.querySelector('.site-info-card');
  if (!siteInfoCard) {
    console.log('site-info-card 요소를 찾을 수 없습니다');
    return null;
  }
  
  const titleEl = siteInfoCard.querySelector('.card-title');
  const excerpts = siteInfoCard.querySelectorAll('.card-excerpt');
  
  if (!titleEl) {
    console.log('card-title 요소를 찾을 수 없습니다');
    return null;
  }
  
  const paragraphs = [];
  excerpts.forEach(excerpt => {
    const text = excerpt.textContent.trim();
    if (text) paragraphs.push(text);
  });
  
  const result = {
    title: titleEl.textContent.trim(),
    paragraphs: paragraphs.length > 0 ? paragraphs : ['설명을 입력해주세요.']
  };
  
  console.log('파싱된 사이트 소개:', result);
  return result;
}

// ============================================
// About 페이지 편집 기능
// ============================================

import {
  auth,
  db,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  ADMIN_EMAIL
} from './firebase-config.js';

// 상태
let isAdmin = false;
let aboutData = null;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  console.log('About editor 초기화 시작');
  
  // Firebase 초기화 대기
  const initFirebase = () => {
    return new Promise((resolve) => {
      if (auth && db) {
        console.log('Firebase 이미 초기화됨');
        resolve();
      } else {
        console.log('Firebase 초기화 대기 중...');
        setTimeout(() => {
          initFirebase().then(resolve);
        }, 100);
      }
    });
  };
  
  // Firebase 초기화 후 인증 확인
  initFirebase().then(() => {
    console.log('Firebase 초기화 완료, 인증 상태 확인 시작');
    
    // 인증 상태 확인
    onAuthStateChanged(auth, async (user) => {
      console.log('인증 상태:', user ? user.email : '비로그인');
      isAdmin = user && user.email === ADMIN_EMAIL;
      console.log('관리자 여부:', isAdmin);
      
      // About 데이터 로드
      await loadAboutData();
      
      // 관리자면 편집 버튼 표시
      if (isAdmin) {
        console.log('편집 버튼 표시 시작');
        showEditButtons();
      }
    });
  });
});

// About 데이터 로드
async function loadAboutData() {
  try {
    console.log('About 데이터 로드 시작');
    console.log('db:', db);
    
    if (!db) {
      console.error('Firebase db가 초기화되지 않았습니다');
      return;
    }
    
    const docRef = doc(db, 'about', 'profile');
    console.log('docRef 생성:', docRef);
    
    const docSnap = await getDoc(docRef);
    console.log('docSnap 존재 여부:', docSnap.exists());
    
    if (docSnap.exists()) {
      console.log('기존 데이터 로드 성공');
      aboutData = docSnap.data();
      console.log('로드된 aboutData:', aboutData);
      renderAboutData();
    } else {
      console.log('초기 데이터 생성');
      // 초기 데이터 생성
      aboutData = getDefaultAboutData();
      console.log('생성한 초기 aboutData:', aboutData);
      await setDoc(docRef, aboutData);
      console.log('초기 데이터 저장 완료');
      renderAboutData();
    }
  } catch (error) {
    console.error('About 데이터 로딩 실패:', error);
    console.error('에러 상세:', error.message, error.stack);
  }
}

// 기본 About 데이터
function getDefaultAboutData() {
  return {
    profile: {
      avatar: '👨‍💻',
      name: '올레길',
      role: 'iOS Engineer & Digital Gardener',
      bio: 'iOS 개발과 웹 기술에 관심이 많은 엔지니어입니다.\n사용자에게 가치를 전달하는 제품을 만드는 것을 좋아하며,\n배운 것을 기록하고 공유하는 것을 즐깁니다.'
    },
    skills: [
      {
        title: 'iOS Development',
        items: ['Swift', 'SwiftUI', 'UIKit', 'Combine', 'TCA', 'Core Data', 'Firebase', 'StoreKit']
      },
      {
        title: 'Web Development',
        items: ['HTML/CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS']
      },
      {
        title: 'DevOps & Tools',
        items: ['Git', 'GitHub Actions', 'Vercel', 'Supabase', 'Xcode', 'VS Code']
      }
    ],
    experiences: [
      {
        date: '2023 - 현재',
        title: 'iOS 개발자',
        description: 'SwiftUI를 활용한 모던 iOS 앱 개발에 집중하고 있습니다. 사용자 경험 개선과 코드 품질 향상을 위해 꾸준히 학습하고 있습니다.'
      },
      {
        date: '2022 - 2023',
        title: '사이드 프로젝트 런칭',
        description: '개인 앱 서비스를 기획, 개발, 운영하며 수익화 경험을 쌓았습니다. AdMob을 통한 광고 수익화와 사용자 피드백 기반 개선 작업을 진행했습니다.'
      },
      {
        date: '2021',
        title: 'iOS 개발 시작',
        description: 'Swift와 iOS 개발에 입문했습니다. UIKit부터 시작해 점차 SwiftUI와 모던 아키텍처를 학습하며 성장해왔습니다.'
      }
    ],
    interests: [
      {
        icon: '📱',
        title: '모바일 개발',
        description: 'SwiftUI의 선언형 UI와 Combine을 활용한 반응형 프로그래밍에 관심이 많습니다. 사용자 경험을 개선하는 인터랙션 디자인을 고민합니다.'
      },
      {
        icon: '💰',
        title: '앱 수익화',
        description: 'AdMob, IAP 등 다양한 수익화 전략을 연구하고 실험합니다. 사용자 경험을 해치지 않으면서 지속 가능한 수익 모델을 찾고 있습니다.'
      },
      {
        icon: '🌐',
        title: '웹 기술',
        description: 'React, Next.js를 활용한 웹 서비스 개발에도 관심이 있습니다. 정적 사이트 생성과 서버리스 아키텍처를 실험하고 있습니다.'
      },
      {
        icon: '✈️',
        title: '여행',
        description: '새로운 곳을 여행하며 영감을 얻고, 다양한 문화를 경험하는 것을 좋아합니다. 여행지에서 로컬 개발자 커뮤니티를 방문하기도 합니다.'
      }
    ],
    contacts: [
      {
        icon: '📧',
        label: 'Email',
        value: 'jejuolleapps@gmail.com',
        url: 'mailto:jejuolleapps@gmail.com'
      },
      {
        icon: '💻',
        label: 'GitHub',
        value: '@ollekil',
        url: 'https://github.com/ollekil'
      }
    ],
    siteInfo: {
      title: '디지털 가든이란?',
      paragraphs: [
        '디지털 가든(Digital Garden)은 블로그보다 덜 형식적이고, 노션보다 더 공개적인 지식 관리 공간입니다. 완벽하게 정리된 글만 발행하기보다는, 생각이 자라나는 과정 자체를 기록하고 공유하는 것을 지향합니다.',
        '이 사이트는 순수 HTML/CSS/JavaScript로 만들어졌으며, 정적 호스팅으로 가볍게 운영됩니다. 일상의 메모(Log), 기술 글(Tech), 여행 기록(Travel), 프로젝트 소개(Projects) 등을 담고 있습니다.'
      ]
    }
  };
}

// About 데이터 렌더링
function renderAboutData() {
  console.log('renderAboutData 호출', aboutData);
  
  if (!aboutData) {
    console.error('aboutData가 없습니다');
    return;
  }
  
  // 프로필 렌더링
  renderProfile();
  
  // 기술 스택 렌더링
  renderSkills();
  
  // 경력 렌더링
  renderExperiences();
  
  // 관심사 렌더링
  renderInterests();
  
  // 연락처 렌더링
  renderContacts();
  
  // 사이트 소개 렌더링
  renderSiteInfo();
}

// 프로필 렌더링
function renderProfile() {
  if (!aboutData || !aboutData.profile) {
    console.error('profile 데이터 없음');
    return;
  }
  
  const { profile } = aboutData;
  
  const avatar = document.querySelector('.about-avatar');
  const name = document.querySelector('.about-name');
  const role = document.querySelector('.about-role');
  const bio = document.querySelector('.about-bio');
  
  if (avatar) avatar.textContent = profile.avatar;
  if (name) name.textContent = profile.name;
  if (role) role.textContent = profile.role;
  if (bio) bio.innerHTML = profile.bio.replace(/\n/g, '<br>');
}

// 기술 스택 렌더링
function renderSkills() {
  if (!aboutData || !aboutData.skills) {
    console.error('skills 데이터 없음');
    return;
  }
  
  const skillsGrid = document.querySelector('.skills-grid');
  if (!skillsGrid) return;
  
  skillsGrid.innerHTML = aboutData.skills.map((category, index) => `
    <div class="skill-category" data-category-index="${index}">
      <h3 class="skill-category-title">${category.title}</h3>
      <div class="skill-list">
        ${category.items.map((item, itemIndex) => `
          <span class="skill-item" data-item-index="${itemIndex}">${item}</span>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// 경력 렌더링
function renderExperiences() {
  if (!aboutData || !aboutData.experiences) {
    console.error('experiences 데이터 없음');
    return;
  }
  
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;
  
  timeline.innerHTML = aboutData.experiences.map((exp, index) => `
    <div class="timeline-item" data-exp-index="${index}">
      <div class="timeline-date">${exp.date}</div>
      <h3 class="timeline-title">${exp.title}</h3>
      <p class="timeline-description">${exp.description}</p>
    </div>
  `).join('');
}

// 연락처 렌더링
function renderContacts() {
  if (!aboutData || !aboutData.contacts) {
    console.error('contacts 데이터 없음');
    return;
  }
  
  const contactGrid = document.querySelector('.contact-grid');
  if (!contactGrid) return;
  
  contactGrid.innerHTML = aboutData.contacts.map((contact, index) => `
    <a href="${contact.url}" class="contact-item" data-contact-index="${index}" ${contact.url.startsWith('http') ? 'target="_blank"' : ''}>
      <div class="contact-icon">${contact.icon}</div>
      <div class="contact-info">
        <div class="contact-label">${contact.label}</div>
        <div class="contact-value">${contact.value}</div>
      </div>
    </a>
  `).join('');
}

// 관심사 렌더링
function renderInterests() {
  if (!aboutData || !aboutData.interests) {
    console.error('interests 데이터 없음');
    return;
  }
  
  const interestsGrid = document.querySelector('.interests-grid');
  if (!interestsGrid) return;
  
  interestsGrid.innerHTML = aboutData.interests.map((interest, index) => `
    <div class="card" data-interest-index="${index}">
      <h3 class="card-title">${interest.icon} ${interest.title}</h3>
      <p class="card-excerpt">${interest.description}</p>
    </div>
  `).join('');
}

// 사이트 소개 렌더링
function renderSiteInfo() {
  if (!aboutData || !aboutData.siteInfo || !aboutData.siteInfo.paragraphs) {
    console.error('siteInfo 데이터 없음', aboutData);
    return;
  }
  
  const siteInfoCard = document.querySelector('.site-info-card');
  if (!siteInfoCard) return;
  
  siteInfoCard.innerHTML = `
    <h3 class="card-title">${aboutData.siteInfo.title}</h3>
    ${aboutData.siteInfo.paragraphs.map((p, i) => `
      <p class="card-excerpt"${i > 0 ? ' style="margin-top: var(--spacing-md);"' : ''}>${p}</p>
    `).join('')}
  `;
}

// 관리자 편집 버튼 표시
function showEditButtons() {
  console.log('showEditButtons 실행');
  console.log('현재 aboutData:', aboutData);
  
  // 프로필 편집 버튼
  const aboutIntro = document.querySelector('.about-intro');
  console.log('aboutIntro:', aboutIntro);
  if (aboutIntro && !aboutIntro.querySelector('.btn-edit-section')) {
    const editBtn = createEditButton('프로필 편집', () => editProfile());
    aboutIntro.appendChild(editBtn);
    console.log('프로필 편집 버튼 추가됨');
  }
  
  // 모든 about-section 찾기
  const allSections = document.querySelectorAll('.about-section');
  console.log('전체 섹션 수:', allSections.length);
  
  // 각 섹션의 제목을 확인하여 편집 버튼 추가
  allSections.forEach((section, index) => {
    const title = section.querySelector('.section-title');
    if (!title) return;
    
    const titleText = title.textContent.trim();
    console.log(`섹션 ${index}: ${titleText}`);
    
    // 이미 버튼이 있으면 건너뛰기
    if (title.querySelector('.btn-edit-section')) {
      console.log(`${titleText} - 버튼 이미 존재`);
      return;
    }
    
    let editBtn;
    switch(titleText) {
      case '기술 스택':
        editBtn = createEditButton('편집', () => editSkills());
        editBtn.style.float = 'right';
        title.appendChild(editBtn);
        console.log('기술 스택 편집 버튼 추가됨');
        break;
      case '경력':
        editBtn = createEditButton('편집', () => editExperiences());
        editBtn.style.float = 'right';
        title.appendChild(editBtn);
        console.log('경력 편집 버튼 추가됨');
        break;
      case '관심사':
        editBtn = createEditButton('편집', () => editInterests());
        editBtn.style.float = 'right';
        title.appendChild(editBtn);
        console.log('관심사 편집 버튼 추가됨');
        break;
      case '연락처':
        editBtn = createEditButton('편집', () => editContacts());
        editBtn.style.float = 'right';
        title.appendChild(editBtn);
        console.log('연락처 편집 버튼 추가됨');
        break;
      case '이 사이트에 대하여':
        editBtn = createEditButton('편집', () => editSiteInfo());
        editBtn.style.float = 'right';
        title.appendChild(editBtn);
        console.log('사이트 소개 편집 버튼 추가됨');
        break;
    }
  });
  
  console.log('모든 편집 버튼 추가 완료');
}

// 편집 버튼 생성
function createEditButton(text, onClick) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.className = 'btn-edit-section';
  btn.style.cssText = `
    padding: 0.5rem 1rem;
    background: var(--color-primary);
    color: white;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  `;
  btn.addEventListener('click', (e) => {
    console.log(`편집 버튼 클릭: ${text}`);
    e.preventDefault();
    e.stopPropagation();
    onClick();
  });
  return btn;
}

// 프로필 편집
function editProfile() {
  console.log('프로필 편집 함수 호출');
  
  if (!aboutData) {
    console.error('aboutData가 없습니다');
    alert('데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    return;
  }
  
  // profile이 없으면 기본값으로 초기화
  if (!aboutData.profile) {
    console.log('profile 필드가 없어 기본값으로 초기화');
    aboutData.profile = {
      avatar: '👨‍💻',
      name: '올레길',
      role: 'iOS Engineer & Digital Gardener',
      bio: 'iOS 개발과 웹 기술에 관심이 많은 엔지니어입니다.'
    };
  }
  
  const { profile } = aboutData;
  
  const modal = createModal('프로필 편집', `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">아바타 이모지</label>
        <input type="text" id="edit-avatar" value="${profile.avatar}" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-border); border-radius: 0.375rem; font-size: 2rem; text-align: center;">
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">이름</label>
        <input type="text" id="edit-name" value="${profile.name}" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">직함</label>
        <input type="text" id="edit-role" value="${profile.role}" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">소개</label>
        <textarea id="edit-bio" rows="4" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-border); border-radius: 0.375rem; resize: vertical;">${profile.bio}</textarea>
      </div>
    </div>
  `, async () => {
    aboutData.profile = {
      avatar: document.getElementById('edit-avatar').value,
      name: document.getElementById('edit-name').value,
      role: document.getElementById('edit-role').value,
      bio: document.getElementById('edit-bio').value
    };
    await saveAboutData();
    renderProfile();
    closeModal();
  });
  
  document.body.appendChild(modal);
}

// 기술 스택 편집
function editSkills() {
  console.log('기술 스택 편집 함수 호출');
  
  if (!aboutData) {
    console.error('aboutData가 없습니다');
    alert('데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    return;
  }
  
  // skills가 없으면 기본값으로 초기화
  if (!aboutData.skills) {
    console.log('skills 필드가 없어 기본값으로 초기화');
    aboutData.skills = [];
  }

  const modal = createModal('기술 스택 편집', `
    <div id="skills-editor" style="display: flex; flex-direction: column; gap: 1.5rem;">
      ${aboutData.skills.map((category, catIndex) => `
        <div style="border: 1px solid var(--color-border); border-radius: 0.5rem; padding: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <input type="text" value="${category.title}" 
                   onchange="updateSkillCategoryTitle(${catIndex}, this.value)"
                   style="flex: 1; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem; font-weight: 600;">
            <button onclick="removeSkillCategory(${catIndex})" 
                    style="margin-left: 0.5rem; padding: 0.5rem 1rem; background: #ef4444; color: white; border-radius: 0.375rem; cursor: pointer;">
              삭제
            </button>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
            ${category.items.map((item, itemIndex) => `
              <span style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--color-bg-tertiary); border-radius: 0.375rem;">
                ${item}
                <button onclick="removeSkillItem(${catIndex}, ${itemIndex})" 
                        style="padding: 0; background: none; color: var(--color-text-secondary); cursor: pointer; font-weight: bold;">
                  ×
                </button>
              </span>
            `).join('')}
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <input type="text" id="new-skill-${catIndex}" placeholder="새 기술 추가..." 
                   style="flex: 1; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
            <button onclick="addSkillItem(${catIndex})" 
                    style="padding: 0.5rem 1rem; background: var(--color-primary); color: white; border-radius: 0.375rem; cursor: pointer;">
              추가
            </button>
          </div>
        </div>
      `).join('')}
    </div>
    <button onclick="addSkillCategory()" 
            style="width: 100%; padding: 0.75rem; margin-top: 1rem; background: var(--color-secondary); color: white; border-radius: 0.375rem; cursor: pointer;">
      + 카테고리 추가
    </button>
  `, async () => {
    await saveAboutData();
    renderSkills();
    closeModal();
  });
  
  document.body.appendChild(modal);
}

// 경력 편집
function editExperiences() {
  console.log('경력 편집 함수 호출');
  
  if (!aboutData) {
    console.error('aboutData가 없습니다');
    alert('데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    return;
  }
  
  // experiences가 없으면 기본값으로 초기화
  if (!aboutData.experiences) {
    console.log('experiences 필드가 없어 기본값으로 초기화');
    aboutData.experiences = [];
  }

  const modal = createModal('경력 편집', `
    <div id="experiences-editor" style="display: flex; flex-direction: column; gap: 1rem;">
      ${aboutData.experiences.map((exp, index) => `
        <div style="border: 1px solid var(--color-border); border-radius: 0.5rem; padding: 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
            <input type="text" value="${exp.date}" 
                   onchange="updateExperienceDate(${index}, this.value)"
                   style="flex: 1; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem; font-size: 0.875rem;">
            <button onclick="removeExperience(${index})" 
                    style="margin-left: 0.5rem; padding: 0.5rem 1rem; background: #ef4444; color: white; border-radius: 0.375rem; cursor: pointer;">
              삭제
            </button>
          </div>
          <input type="text" value="${exp.title}" 
                 onchange="updateExperienceTitle(${index}, this.value)"
                 style="width: 100%; padding: 0.5rem; margin-bottom: 0.75rem; border: 1px solid var(--color-border); border-radius: 0.375rem; font-weight: 600;">
          <textarea rows="3" 
                    onchange="updateExperienceDescription(${index}, this.value)"
                    style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem; resize: vertical;">${exp.description}</textarea>
        </div>
      `).join('')}
    </div>
    <button onclick="addExperience()" 
            style="width: 100%; padding: 0.75rem; margin-top: 1rem; background: var(--color-secondary); color: white; border-radius: 0.375rem; cursor: pointer;">
      + 경력 추가
    </button>
  `, async () => {
    await saveAboutData();
    renderExperiences();
    closeModal();
  });
  
  document.body.appendChild(modal);
}

// 연락처 편집
function editContacts() {
  console.log('연락처 편집 함수 호출');
  
  if (!aboutData) {
    console.error('aboutData가 없습니다');
    alert('데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    return;
  }
  
  // contacts가 없으면 기본값으로 초기화
  if (!aboutData.contacts) {
    console.log('contacts 필드가 없어 기본값으로 초기화');
    aboutData.contacts = [];
  }

  const modal = createModal('연락처 편집', `
    <div id="contacts-editor" style="display: flex; flex-direction: column; gap: 1rem;">
      ${aboutData.contacts.map((contact, index) => `
        <div style="border: 1px solid var(--color-border); border-radius: 0.5rem; padding: 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
            <input type="text" value="${contact.icon}" 
                   onchange="updateContactIcon(${index}, this.value)"
                   style="width: 60px; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem; font-size: 1.5rem; text-align: center;">
            <button onclick="removeContact(${index})" 
                    style="padding: 0.5rem 1rem; background: #ef4444; color: white; border-radius: 0.375rem; cursor: pointer;">
              삭제
            </button>
          </div>
          <input type="text" value="${contact.label}" 
                 onchange="updateContactLabel(${index}, this.value)"
                 placeholder="라벨 (예: Email)"
                 style="width: 100%; padding: 0.5rem; margin-bottom: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
          <input type="text" value="${contact.value}" 
                 onchange="updateContactValue(${index}, this.value)"
                 placeholder="값 (예: your@email.com)"
                 style="width: 100%; padding: 0.5rem; margin-bottom: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
          <input type="text" value="${contact.url}" 
                 onchange="updateContactUrl(${index}, this.value)"
                 placeholder="URL"
                 style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
        </div>
      `).join('')}
    </div>
    <button onclick="addContact()" 
            style="width: 100%; padding: 0.75rem; margin-top: 1rem; background: var(--color-secondary); color: white; border-radius: 0.375rem; cursor: pointer;">
      + 연락처 추가
    </button>
  `, async () => {
    await saveAboutData();
    renderContacts();
    closeModal();
  });
  
  document.body.appendChild(modal);
}

// 관심사 편집
function editInterests() {
  console.log('관심사 편집 함수 호출');
  console.log('aboutData:', aboutData);
  
  if (!aboutData) {
    console.error('aboutData가 없습니다');
    alert('데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    return;
  }
  
  // interests가 없으면 HTML에서 파싱
  if (!aboutData.interests || aboutData.interests.length === 0) {
    console.log('interests 필드가 없어 HTML에서 파싱');
    aboutData.interests = parseInterestsFromHTML();
    console.log('파싱된 interests:', aboutData.interests);
  }
  
  const modal = createModal('관심사 편집', `
    <div id="interests-editor" style="display: flex; flex-direction: column; gap: 1rem;">
      ${aboutData.interests.map((interest, index) => `
        <div style="border: 1px solid var(--color-border); border-radius: 0.5rem; padding: 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
            <input type="text" value="${interest.icon}" 
                   onchange="updateInterestIcon(${index}, this.value)"
                   style="width: 60px; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem; font-size: 1.5rem; text-align: center;">
            <button onclick="removeInterest(${index})" 
                    style="padding: 0.5rem 1rem; background: #ef4444; color: white; border-radius: 0.375rem; cursor: pointer;">
              삭제
            </button>
          </div>
          <input type="text" value="${interest.title}" 
                 onchange="updateInterestTitle(${index}, this.value)"
                 placeholder="제목"
                 style="width: 100%; padding: 0.5rem; margin-bottom: 0.75rem; border: 1px solid var(--color-border); border-radius: 0.375rem; font-weight: 600;">
          <textarea rows="3" 
                    onchange="updateInterestDescription(${index}, this.value)"
                    placeholder="설명"
                    style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem; resize: vertical;">${interest.description}</textarea>
        </div>
      `).join('')}
    </div>
    <button onclick="addInterest()" 
            style="width: 100%; padding: 0.75rem; margin-top: 1rem; background: var(--color-secondary); color: white; border-radius: 0.375rem; cursor: pointer;">
      + 관심사 추가
    </button>
  `, async () => {
    await saveAboutData();
    renderInterests();
    closeModal();
  });
  
  document.body.appendChild(modal);
}

// 사이트 소개 편집
function editSiteInfo() {
  console.log('사이트 소개 편집 함수 호출');
  console.log('aboutData:', aboutData);
  
  if (!aboutData) {
    console.error('aboutData가 없습니다');
    alert('데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    return;
  }
  
  // siteInfo가 없거나 비어있으면 HTML에서 파싱
  if (!aboutData.siteInfo || !aboutData.siteInfo.paragraphs || aboutData.siteInfo.paragraphs.length === 0) {
    console.log('siteInfo 필드가 없거나 비어있어 HTML에서 파싱');
    const parsedSiteInfo = parseSiteInfoFromHTML();
    if (parsedSiteInfo) {
      aboutData.siteInfo = parsedSiteInfo;
      console.log('파싱된 siteInfo:', aboutData.siteInfo);
    } else {
      aboutData.siteInfo = {
        title: '디지털 가든이란?',
        paragraphs: ['설명을 입력해주세요.']
      };
    }
  }
  
  const modal = createModal('사이트 소개 편집', `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">제목</label>
        <input type="text" id="edit-site-title" value="${aboutData.siteInfo.title}" 
               style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-border); border-radius: 0.375rem; font-weight: 600;">
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">문단들</label>
        ${aboutData.siteInfo.paragraphs.map((p, i) => `
          <div style="margin-bottom: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-size: 0.875rem; color: var(--color-text-secondary);">문단 ${i + 1}</span>
              ${aboutData.siteInfo.paragraphs.length > 1 ? `
                <button onclick="removeSiteParagraph(${i})" 
                        style="padding: 0.25rem 0.75rem; background: #ef4444; color: white; border-radius: 0.375rem; cursor: pointer; font-size: 0.75rem;">
                  삭제
                </button>
              ` : ''}
            </div>
            <textarea id="site-paragraph-${i}" rows="3" 
                      style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem; resize: vertical;">${p}</textarea>
          </div>
        `).join('')}
        <button onclick="addSiteParagraph()" 
                style="width: 100%; padding: 0.5rem; background: var(--color-bg-tertiary); color: var(--color-text-primary); border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
          + 문단 추가
        </button>
      </div>
    </div>
  `, async () => {
    // 제목 업데이트
    aboutData.siteInfo.title = document.getElementById('edit-site-title').value;
    
    // 문단들 업데이트
    aboutData.siteInfo.paragraphs = aboutData.siteInfo.paragraphs.map((_, i) => {
      const textarea = document.getElementById(`site-paragraph-${i}`);
      return textarea ? textarea.value : '';
    }).filter(p => p.trim());
    
    await saveAboutData();
    renderSiteInfo();
    closeModal();
  });
  
  document.body.appendChild(modal);
}

// 모달 생성
function createModal(title, content, onSave) {
  const modal = document.createElement('div');
  modal.id = 'edit-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  `;
  
  modal.innerHTML = `
    <div style="background: var(--color-bg-primary); border-radius: 0.5rem; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 2rem;">
      <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem;">${title}</h2>
      <div>${content}</div>
      <div style="display: flex; gap: 0.75rem; margin-top: 2rem;">
        <button onclick="saveModal()" style="flex: 1; padding: 0.75rem; background: var(--color-primary); color: white; border-radius: 0.375rem; font-weight: 600; cursor: pointer;">저장</button>
        <button onclick="closeModal()" style="padding: 0.75rem 1.5rem; background: var(--color-bg-tertiary); color: var(--color-text-primary); border-radius: 0.375rem; font-weight: 600; cursor: pointer;">취소</button>
      </div>
    </div>
  `;
  
  modal.querySelector('[onclick="saveModal()"]').onclick = onSave;
  
  return modal;
}

// 모달 닫기
window.closeModal = function() {
  const modal = document.getElementById('edit-modal');
  if (modal) {
    modal.remove();
  }
};

// About 데이터 저장
async function saveAboutData() {
  try {
    const docRef = doc(db, 'about', 'profile');
    await setDoc(docRef, aboutData);
    alert('저장되었습니다!');
  } catch (error) {
    console.error('저장 실패:', error);
    alert('저장에 실패했습니다.');
  }
}

// 기술 스택 관리 함수들
window.updateSkillCategoryTitle = function(catIndex, value) {
  aboutData.skills[catIndex].title = value;
};

window.removeSkillCategory = function(catIndex) {
  if (confirm('이 카테고리를 삭제하시겠습니까?')) {
    aboutData.skills.splice(catIndex, 1);
    editSkills();
  }
};

window.addSkillCategory = function() {
  aboutData.skills.push({
    title: '새 카테고리',
    items: []
  });
  editSkills();
};

window.addSkillItem = function(catIndex) {
  const input = document.getElementById(`new-skill-${catIndex}`);
  const value = input.value.trim();
  if (value) {
    aboutData.skills[catIndex].items.push(value);
    input.value = '';
    editSkills();
  }
};

window.removeSkillItem = function(catIndex, itemIndex) {
  aboutData.skills[catIndex].items.splice(itemIndex, 1);
  editSkills();
};

// 경력 관리 함수들
window.updateExperienceDate = function(index, value) {
  aboutData.experiences[index].date = value;
};

window.updateExperienceTitle = function(index, value) {
  aboutData.experiences[index].title = value;
};

window.updateExperienceDescription = function(index, value) {
  aboutData.experiences[index].description = value;
};

window.removeExperience = function(index) {
  if (confirm('이 경력을 삭제하시겠습니까?')) {
    aboutData.experiences.splice(index, 1);
    editExperiences();
  }
};

window.addExperience = function() {
  aboutData.experiences.unshift({
    date: '20XX - 20XX',
    title: '새 경력',
    description: '설명을 입력하세요.'
  });
  editExperiences();
};

// 연락처 관리 함수들
window.updateContactIcon = function(index, value) {
  aboutData.contacts[index].icon = value;
};

window.updateContactLabel = function(index, value) {
  aboutData.contacts[index].label = value;
};

window.updateContactValue = function(index, value) {
  aboutData.contacts[index].value = value;
};

window.updateContactUrl = function(index, value) {
  aboutData.contacts[index].url = value;
};

window.removeContact = function(index) {
  if (confirm('이 연락처를 삭제하시겠습니까?')) {
    aboutData.contacts.splice(index, 1);
    editContacts();
  }
};

window.addContact = function() {
  aboutData.contacts.push({
    icon: '📧',
    label: '새 연락처',
    value: 'value',
    url: '#'
  });
  editContacts();
};

// 관심사 관리 함수들
window.updateInterestIcon = function(index, value) {
  aboutData.interests[index].icon = value;
};

window.updateInterestTitle = function(index, value) {
  aboutData.interests[index].title = value;
};

window.updateInterestDescription = function(index, value) {
  aboutData.interests[index].description = value;
};

window.removeInterest = function(index) {
  if (confirm('이 관심사를 삭제하시겠습니까?')) {
    aboutData.interests.splice(index, 1);
    editInterests();
  }
};

window.addInterest = function() {
  aboutData.interests.push({
    icon: '💡',
    title: '새 관심사',
    description: '설명을 입력하세요.'
  });
  editInterests();
};

// 사이트 소개 관리 함수들
window.removeSiteParagraph = function(index) {
  if (confirm('이 문단을 삭제하시겠습니까?')) {
    aboutData.siteInfo.paragraphs.splice(index, 1);
    editSiteInfo();
  }
};

window.addSiteParagraph = function() {
  aboutData.siteInfo.paragraphs.push('새 문단을 입력하세요.');
  editSiteInfo();
};

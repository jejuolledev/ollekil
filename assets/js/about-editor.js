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

// About 데이터 로드
async function loadAboutData() {
  try {
    console.log('About 데이터 로드 시작');
    const docRef = doc(db, 'about', 'profile');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('기존 데이터 로드 성공');
      aboutData = docSnap.data();
      renderAboutData();
    } else {
      console.log('초기 데이터 생성');
      // 초기 데이터 생성
      aboutData = getDefaultAboutData();
      await setDoc(docRef, aboutData);
      console.log('초기 데이터 저장 완료');
    }
  } catch (error) {
    console.error('About 데이터 로딩 실패:', error);
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
    ]
  };
}

// About 데이터 렌더링
function renderAboutData() {
  if (!aboutData) return;
  
  // 프로필 렌더링
  renderProfile();
  
  // 기술 스택 렌더링
  renderSkills();
  
  // 경력 렌더링
  renderExperiences();
  
  // 연락처 렌더링
  renderContacts();
}

// 프로필 렌더링
function renderProfile() {
  const { profile } = aboutData;
  
  document.querySelector('.about-avatar').textContent = profile.avatar;
  document.querySelector('.about-name').textContent = profile.name;
  document.querySelector('.about-role').textContent = profile.role;
  document.querySelector('.about-bio').innerHTML = profile.bio.replace(/\n/g, '<br>');
}

// 기술 스택 렌더링
function renderSkills() {
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

// 관리자 편집 버튼 표시
function showEditButtons() {
  console.log('showEditButtons 실행');
  
  // 프로필 편집 버튼
  const aboutIntro = document.querySelector('.about-intro');
  console.log('aboutIntro:', aboutIntro);
  if (aboutIntro) {
    const editBtn = createEditButton('프로필 편집', () => editProfile());
    aboutIntro.appendChild(editBtn);
    console.log('프로필 편집 버튼 추가됨');
  }
  
  // 기술 스택 편집 버튼
  const allSections = document.querySelectorAll('.about-section');
  console.log('전체 섹션 수:', allSections.length);
  
  const skillsSection = allSections[0]?.querySelector('.section-title');
  console.log('skillsSection:', skillsSection);
  if (skillsSection) {
    const editBtn = createEditButton('편집', () => editSkills());
    editBtn.style.float = 'right';
    skillsSection.appendChild(editBtn);
    console.log('기술 스택 편집 버튼 추가됨');
  }
  
  // 경력 편집 버튼
  const expSection = allSections[1]?.querySelector('.section-title');
  console.log('expSection:', expSection);
  if (expSection) {
    const editBtn = createEditButton('편집', () => editExperiences());
    editBtn.style.float = 'right';
    expSection.appendChild(editBtn);
    console.log('경력 편집 버튼 추가됨');
  }
  
  // 연락처 편집 버튼 (관심사 다음이므로 index 3)
  const contactSection = allSections[3]?.querySelector('.section-title');
  console.log('contactSection:', contactSection);
  if (contactSection) {
    const editBtn = createEditButton('편집', () => editContacts());
    editBtn.style.float = 'right';
    contactSection.appendChild(editBtn);
    console.log('연락처 편집 버튼 추가됨');
  }
  
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
  btn.addEventListener('click', onClick);
  return btn;
}

// 프로필 편집
function editProfile() {
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

// ============================================
// Firebase 설정 및 초기화
// ============================================

// Firebase SDK import (CDN 사용)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, doc, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyCQ-9Fq8poFpn30n_GnBCo_n6GyXO2FAiQ",
  authDomain: "ollekil-blog.firebaseapp.com",
  projectId: "ollekil-blog",
  storageBucket: "ollekil-blog.firebasestorage.app",
  messagingSenderId: "1069636822614",
  appId: "1:1069636822614:web:2adc47b22d9d889dc4fdf7",
  measurementId: "G-8S74V0MSCP"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export (읽기 전용 - 블로그 표시용)
export {
  db,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit
};

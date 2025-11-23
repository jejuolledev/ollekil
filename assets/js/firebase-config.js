// ============================================
// Firebase 설정 및 초기화
// ============================================

// Firebase SDK import (CDN 사용)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, setDoc, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 관리자 이메일
const ADMIN_EMAIL = 'jejuolleapps@gmail.com';

// Export
export {
  auth,
  db,
  storage,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  limit,
  ref,
  uploadBytes,
  getDownloadURL,
  ADMIN_EMAIL
};

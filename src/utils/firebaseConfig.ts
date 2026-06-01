import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // :white_check_mark: ADD THIS

const firebaseConfig = {
  apiKey: 'AIzaSyA_rkSOjyWVwgzWGXMIxze676dBKt2TC4M',
  authDomain: 'appinstragram-531c1.firebaseapp.com',
  projectId: 'appinstragram-531c1',
  storageBucket: 'appinstragram-531c1.firebasestorage.app',
  messagingSenderId: '437698094226',
  appId: '1:437698094226:web:c2a56fd46addca8460b24b',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

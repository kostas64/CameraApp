import firebase from 'firebase/compat/app';
import {initializeApp} from 'firebase/app';
import {getStorage} from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCT5sK8-SP4b8Gxz7ujo9QN0_X9mNedUU0',
  authDomain: 'cameraapp-5ebb9.firebaseapp.com',
  projectId: 'cameraapp-5ebb9',
  storageBucket: 'cameraapp-5ebb9.appspot.com',
  messagingSenderId: '492384548906',
  appId: '1:492384548906:web:dcf89aab6f94d80595eb53',
};

let storage;
if (firebase.apps.length === 0) {
  const app = initializeApp(firebaseConfig);
  storage = getStorage();
} else {
  firebase.app();
}

export {storage};

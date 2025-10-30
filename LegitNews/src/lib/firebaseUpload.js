import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const storage = getStorage(app)

let authReady
function ensureAuth() {
  if (!authReady) {
    authReady = new Promise((resolve, reject) => {
      const unsub = onAuthStateChanged(auth, (u) => {
        if (u) { unsub(); resolve(u); }
      })
      signInAnonymously(auth).catch(reject)
    })
  }
  return authReady
}

// ✅ For News image upload
export async function uploadNewsImage(file, category) {
  await ensureAuth()
  const safeCat = encodeURIComponent(category.replace(/\s+/g, '+'))
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}.${ext || 'webp'}`
  const path = `images/${safeCat}/${fileName}`   // ✅ match backend convention
  const r = ref(storage, path)
  await uploadBytes(r, file)
  console.log("✅ Uploaded to Firebase:", path)
  // Return relative path for DB (backend will compute public URL)
  return `/${path}`
}

// ✅ For Comment image upload
export async function uploadCommentImage(file, category, newsId) {
  await ensureAuth()
  const safeCat = encodeURIComponent(category.replace(/\s+/g, '+'))
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}.${ext || 'webp'}`
  const path = `images/Comments/${safeCat}/${newsId}/${fileName}`
  const r = ref(storage, path)
  await uploadBytes(r, file)
  console.log("✅ Uploaded comment image:", path)
  return `/${path}`
}

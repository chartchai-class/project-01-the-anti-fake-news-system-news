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

export async function uploadCommentImage(file, category, newsId) {
  await ensureAuth()
  const safeCat = encodeURIComponent(category || 'General')
  const path = `Comments/${safeCat}/${newsId}/${Date.now()}-${file.name}`
  const r = ref(storage, path)
  await uploadBytes(r, file)           // you can add { contentType: file.type } if you like
  return await getDownloadURL(r)
}

export async function uploadNewsImage(file, category) {
  await ensureAuth()
  const safeCat = encodeURIComponent(category || 'General')
  const path = `News/${safeCat}/${Date.now()}-${file.name}`
  const r = ref(storage, path)
  await uploadBytes(r, file)
  return await getDownloadURL(r)
}

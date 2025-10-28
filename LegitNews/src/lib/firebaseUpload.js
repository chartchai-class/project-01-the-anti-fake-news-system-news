import { initializeApp } from 'firebase/app'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET, // e.g. legitnews-xxxx.appspot.com
}

const app = initializeApp(firebaseConfig)
const storage = getStorage(app)

export async function uploadCommentImage(file, category, newsId) {
  const safeCat = encodeURIComponent(category || 'General')
  const path = `Comments/${safeCat}/${newsId}/${Date.now()}-${file.name}`
  const r = ref(storage, path)
  await uploadBytes(r, file)
  return await getDownloadURL(r)
}

export async function uploadNewsImage(file, category) {
  const safeCat = encodeURIComponent(category || 'General')
  const path = `News/${safeCat}/${Date.now()}-${file.name}`
  const r = ref(storage, path)
  await uploadBytes(r, file)
  return await getDownloadURL(r)
}

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
        if (u) { unsub(); resolve(u) }
      })
      signInAnonymously(auth).catch(reject)
    })
  }
  return authReady
}

function splitCategoryForms(category) {
  const raw = (category || 'General').toString().trim()
  const storageCat = raw.replace(/\+/g, ' ').replace(/\s+/g, ' ').trim()
  const dbCat = storageCat.replace(/\s+/g, '+')
  return { storageCat, dbCat }
}

// ===== NEWS =====
export async function uploadNewsImage(file, category) {
  await ensureAuth()
  const { storageCat, dbCat } = splitCategoryForms(category)
  const ext = (file.name.split('.').pop() || 'webp').toLowerCase()
  const fileName = `${Date.now()}.${ext}`
  const storagePath = `images/${storageCat}/${fileName}`
  await uploadBytes(ref(storage, storagePath), file)
  console.log('✅ News image uploaded:', storagePath)
  return `/images/${dbCat}/${fileName}`
}

// ===== COMMENTS =====
export async function uploadCommentImage(file, newsId) {
  await ensureAuth()
  if (!newsId) throw new Error('uploadCommentImage: newsId is required')
  const ext = (file.name.split('.').pop() || 'webp').toLowerCase()
  const fileName = `${Date.now()}.${ext}`
  const storagePath = `images/Comments/${newsId}/${fileName}`
  const r = ref(storage, storagePath)
  await uploadBytes(r, file, { contentType: file.type || `image/${ext}` })
  const downloadUrl = await getDownloadURL(r)
  console.log('✅ Comment image uploaded:', storagePath, '->', downloadUrl)
  return downloadUrl
}

// ===== PROFILE =====
export async function uploadProfileImage(file, userEmail) {
  await ensureAuth()
  if (!userEmail) throw new Error('uploadProfileImage: userEmail is required')
  
  const ext = (file.name.split('.').pop() || 'webp').toLowerCase()
  // Use email as filename (sanitized)
  const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '_')
  const fileName = `${sanitizedEmail}.${ext}`
  const storagePath = `images/Profile/${fileName}`
  
  const r = ref(storage, storagePath)
  await uploadBytes(r, file, { contentType: file.type || `image/${ext}` })
  const downloadUrl = await getDownloadURL(r)
  
  console.log('✅ Profile image uploaded:', storagePath, '->', downloadUrl)
  return downloadUrl
}
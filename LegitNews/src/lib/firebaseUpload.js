import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'  // ADD getDownloadURL here

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

/**
 * Normalize a category into:
 *  - storage folder form (spaces)
 *  - db path form (pluses)
 */
function splitCategoryForms(category) {
  const raw = (category || 'General').toString().trim()
  const storageCat = raw.replace(/\+/g, ' ').replace(/\s+/g, ' ').trim()       // "Business news"
  const dbCat      = storageCat.replace(/\s+/g, '+')                            // "Business+news"
  return { storageCat, dbCat }
}

// ===== NEWS =====
export async function uploadNewsImage(file, category) {
  await ensureAuth()
  const { storageCat, dbCat } = splitCategoryForms(category)
  const ext = (file.name.split('.').pop() || 'webp').toLowerCase()
  const fileName = `${Date.now()}.${ext}`

  // Store with spaces inside Firebase, under images/<Category>/<file>
  const storagePath = `images/${storageCat}/${fileName}`
  await uploadBytes(ref(storage, storagePath), file)
  console.log('✅ News image uploaded:', storagePath)

  // Return DB-relative path with pluses so backend resolver works
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
  const downloadUrl = await getDownloadURL(r)  // Now this will work!

  console.log('✅ Comment image uploaded:', storagePath, '->', downloadUrl)
  return downloadUrl
}
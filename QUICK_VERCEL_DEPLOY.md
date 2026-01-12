# ⚡ Vercel Hızlı Deployment (Backend Önce)

## 🚀 Adımlar

### 1. Vercel'de Proje Oluştur (1 dakika)

1. **vercel.com** → "Add New..." → "Project"
2. GitHub repo'nuzu seçin
3. **Root Directory**: Boş bırakın
4. **Framework Preset**: Otomatik (Vite)

### 2. Backend Environment Variables Ekle (2 dakika)

**Settings** → **Environment Variables** → Aşağıdakileri ekleyin:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
VERCEL=1
```

⚠️ **Şimdilik sadece bunları ekleyin!**

### 3. İlk Deploy (2 dakika)

1. **"Deploy"** butonuna tıklayın
2. Bekleyin (2-5 dakika)
3. URL'inizi kopyalayın (örn: `https://your-project.vercel.app`)

### 4. Backend Test

Tarayıcıda açın: `https://your-project.vercel.app/api/auth/me`

- ✅ 401/404 hatası = Backend çalışıyor!
- ❌ "Cannot GET" = API route sorunu var

### 5. Frontend Environment Variables Ekle

**Settings** → **Environment Variables** → Ekleyin:

```
VITE_API_BASE_URL=https://your-project.vercel.app/api
FRONTEND_URL=https://your-project.vercel.app
```

### 6. CORS Güncelle

`backend/server.js` dosyasında:

```javascript
const allowedOrigins = [
  "http://localhost:3000",
  "https://your-project.vercel.app", // ← Buraya ekleyin
  process.env.FRONTEND_URL
].filter(Boolean);
```

Commit + Push yapın (Vercel otomatik deploy eder)

### 7. Redeploy

Vercel Dashboard → Deployments → ... → Redeploy

## ✅ Test

URL'inizi açın ve test edin!

## 🔧 Sorun mu var?

- **MongoDB**: Atlas → Network Access → `0.0.0.0/0` ekleyin
- **CORS**: `backend/server.js`'de Vercel URL'inizi ekleyin
- **Logs**: Vercel Dashboard → Deployments → View Function Logs

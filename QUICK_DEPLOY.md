# 🚀 Hızlı Deployment Rehberi

## ⚡ Hızlı Başlangıç

### 1️⃣ Backend'i Render'da Deploy Edin (5 dakika)

1. **Render.com**'a gidin ve hesap oluşturun
2. "New +" → "Web Service" seçin
3. GitHub repo'nuzu bağlayın
4. Ayarlar:
   - **Name**: `social-media-backend`
   - **Root Directory**: Boş bırakın (root'ta)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Environment Variables** ekleyin:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-secret-key
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
6. **Deploy** butonuna tıklayın
7. Backend URL'inizi kopyalayın (örn: `https://social-media-backend.onrender.com`)

### 2️⃣ Frontend'i Vercel'de Deploy Edin (3 dakika)

1. **Vercel.com**'a gidin ve hesap oluşturun
2. "Add New..." → "Project" seçin
3. GitHub repo'nuzu import edin
4. Ayarlar:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (otomatik)
   - **Output Directory**: `dist` (otomatik)
5. **Environment Variables** ekleyin:
   ```
   VITE_API_BASE_URL=https://social-media-backend.onrender.com/api
   ```
   ⚠️ **ÖNEMLİ**: URL'in sonunda `/api` olmamalı!
6. **Deploy** butonuna tıklayın

### 3️⃣ CORS'u Güncelleyin

Backend deploy olduktan sonra, `backend/server.js` dosyasındaki `allowedOrigins` array'ine Vercel URL'inizi ekleyin ve tekrar deploy edin:

```javascript
const allowedOrigins = [
  "http://localhost:3000", 
  "https://onsekiz.onrender.com",
  "https://your-vercel-app.vercel.app" // ← Buraya Vercel URL'inizi ekleyin
];
```

## ✅ Test

1. Vercel URL'inizi açın
2. Signup/Login yapın
3. Post oluşturun
4. Her şey çalışıyorsa başarılı! 🎉

## 🔧 Sorun Giderme

### CORS Hatası
- Backend'de `allowedOrigins` array'ine frontend URL'inizi eklediğinizden emin olun
- Render'da `FRONTEND_URL` environment variable'ını ekleyin

### API Bağlantı Hatası
- `VITE_API_BASE_URL`'in doğru olduğundan emin olun
- Backend'in çalıştığını Render dashboard'da kontrol edin

### MongoDB Hatası
- MongoDB Atlas'da Network Access'e `0.0.0.0/0` ekleyin
- Connection string'in doğru olduğundan emin olun

## 📝 Notlar

- Backend Render'da ilk deploy'da biraz yavaş olabilir (cold start)
- Render free tier'da 15 dakika inaktiflikten sonra uyku moduna geçer
- Production'da MongoDB connection string'in doğru olduğundan emin olun

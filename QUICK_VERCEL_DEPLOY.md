# ⚡ Vercel Hızlı Deployment (5 Dakika)

## 🚀 Adımlar

### 1. Vercel'de Proje Oluştur (2 dakika)

1. **vercel.com** → "Add New..." → "Project"
2. GitHub repo'nuzu seçin
3. **Root Directory**: Boş bırakın
4. **Framework Preset**: Otomatik (Vite)

### 2. Environment Variables Ekle (2 dakika)

**Settings** → **Environment Variables** → Aşağıdakileri ekleyin:

```
# Backend
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
VERCEL=1

# Frontend (deploy sonrası güncelleyin)
VITE_API_BASE_URL=https://your-project.vercel.app/api
FRONTEND_URL=https://your-project.vercel.app
```

### 3. Deploy Et (1 dakika)

1. **"Deploy"** butonuna tıklayın
2. Bekleyin (2-5 dakika)

### 4. Environment Variables Güncelle

Deploy tamamlandıktan sonra:

1. Vercel URL'inizi kopyalayın
2. **Settings** → **Environment Variables**
3. `VITE_API_BASE_URL` ve `FRONTEND_URL`'i güncelleyin
4. **Redeploy** yapın

## ✅ Test

URL'inizi açın ve test edin!

## 🔧 Sorun mu var?

- **MongoDB**: Atlas → Network Access → `0.0.0.0/0` ekleyin
- **CORS**: `backend/server.js`'de Vercel URL'inizi ekleyin
- **Logs**: Vercel Dashboard → Deployments → View Function Logs

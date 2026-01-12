# Vercel Deployment Guide

Bu projeyi Vercel'de deploy etmek için aşağıdaki adımları takip edin.

## Ön Gereksinimler

1. **Vercel hesabı** oluşturun: https://vercel.com
2. **Render veya Railway hesabı** (Backend için): https://render.com veya https://railway.app
3. **MongoDB Atlas** hesabı: https://www.mongodb.com/cloud/atlas
4. **Cloudinary** hesabı: https://cloudinary.com

## Adım 1: Backend'i Render'da Deploy Edin

### 1.1 Render'da Yeni Web Service Oluşturun

1. Render dashboard'a gidin
2. "New +" butonuna tıklayın
3. "Web Service" seçin
4. GitHub repository'nizi bağlayın

### 1.2 Render Ayarları

- **Name**: `social-media-backend` (veya istediğiniz isim)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Root Directory**: `backend` (veya boş bırakın, root'ta ise)

### 1.3 Environment Variables (Render)

Render'da aşağıdaki environment variables'ları ekleyin:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### 1.4 CORS Ayarları

`backend/server.js` dosyasında `allowedOrigins` array'ine Render URL'inizi ekleyin:

```javascript
const allowedOrigins = [
  "http://localhost:3000", 
  "https://your-render-app.onrender.com",
  "https://your-vercel-app.vercel.app"
];
```

## Adım 2: Frontend'i Vercel'de Deploy Edin

### 2.1 Vercel'de Yeni Proje Oluşturun

1. Vercel dashboard'a gidin
2. "Add New..." → "Project" seçin
3. GitHub repository'nizi import edin

### 2.2 Vercel Ayarları

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.3 Environment Variables (Vercel)

Vercel'de aşağıdaki environment variable'ı ekleyin:

```
VITE_API_BASE_URL=https://your-render-app.onrender.com/api
```

**Önemli**: Render URL'inizin sonunda `/api` olmamalı, çünkü kod otomatik olarak ekliyor.

### 2.4 Deploy

"Deploy" butonuna tıklayın ve deploy işleminin tamamlanmasını bekleyin.

## Adım 3: Son Kontroller

### 3.1 CORS Güncellemesi

Backend'in `server.js` dosyasında Vercel URL'inizi de ekleyin:

```javascript
const allowedOrigins = [
  "http://localhost:3000", 
  "https://your-render-app.onrender.com",
  "https://your-vercel-app.vercel.app"
];
```

### 3.2 Test

1. Frontend URL'inizi açın
2. Login/Signup işlemlerini test edin
3. Post oluşturmayı test edin
4. Tüm özellikleri test edin

## Sorun Giderme

### CORS Hatası

- Backend'de `allowedOrigins` array'ine frontend URL'inizi eklediğinizden emin olun
- Render'da environment variable'ların doğru olduğundan emin olun

### API Bağlantı Hatası

- `VITE_API_BASE_URL` environment variable'ının doğru olduğundan emin olun
- Backend'in çalıştığından emin olun (Render dashboard'da kontrol edin)

### MongoDB Bağlantı Hatası

- MongoDB Atlas'da IP whitelist'e `0.0.0.0/0` ekleyin (tüm IP'lere izin verir)
- MongoDB connection string'in doğru olduğundan emin olun

## Alternatif: Railway ile Backend Deploy

Railway kullanmak isterseniz:

1. Railway'de yeni proje oluşturun
2. GitHub repository'nizi bağlayın
3. Environment variables'ları ekleyin
4. Deploy edin
5. Vercel'de `VITE_API_BASE_URL`'i Railway URL'inizle güncelleyin

## Notlar

- Backend ve Frontend ayrı deploy edilmelidir
- Environment variables'ları her iki platformda da doğru ayarlayın
- CORS ayarlarını her iki tarafta da kontrol edin
- MongoDB Atlas'da network access ayarlarını kontrol edin

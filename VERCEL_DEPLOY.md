# 🚀 Vercel Deployment Rehberi (Backend + Frontend)

Bu rehber, hem backend hem frontend'i Vercel'de deploy etmek için hazırlanmıştır.

## 📋 Ön Gereksinimler

1. **Vercel hesabı**: https://vercel.com
2. **MongoDB Atlas** hesabı: https://www.mongodb.com/cloud/atlas
3. **Cloudinary** hesabı: https://cloudinary.com
4. **GitHub repository** (projeniz GitHub'da olmalı)

## 🚀 Adım Adım Deployment

### 1️⃣ GitHub Repository Hazırlığı

1. Projenizi GitHub'a push edin
2. Tüm değişikliklerin commit edildiğinden emin olun

### 2️⃣ Vercel'de Proje Oluşturma

1. **Vercel Dashboard**'a gidin: https://vercel.com/dashboard
2. **"Add New..."** → **"Project"** seçin
3. GitHub repository'nizi seçin veya import edin
4. **"Import"** butonuna tıklayın

### 3️⃣ Vercel Proje Ayarları

#### Framework Preset
- **Framework Preset**: Vercel otomatik olarak algılayacak (Vite)

#### Root Directory
- **Root Directory**: Boş bırakın (root'ta)

#### Build Settings
- **Build Command**: Otomatik algılanacak
- **Output Directory**: `frontend/dist` (otomatik)

### 4️⃣ Environment Variables Ekleme

Vercel'de aşağıdaki environment variables'ları ekleyin:

#### Backend Environment Variables

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-app-password
FRONTEND_URL=https://your-project.vercel.app
VERCEL=1
```

#### Frontend Environment Variables

```
VITE_API_BASE_URL=https://your-project.vercel.app/api
```

⚠️ **ÖNEMLİ**: 
- `VITE_API_BASE_URL` için Vercel URL'inizi kullanın (deploy olduktan sonra güncelleyebilirsiniz)
- URL'in sonunda `/api` olmamalı, kod otomatik ekliyor

### 5️⃣ Deploy

1. **"Deploy"** butonuna tıklayın
2. Deploy işleminin tamamlanmasını bekleyin (2-5 dakika)
3. Deploy tamamlandıktan sonra URL'inizi kopyalayın

### 6️⃣ Environment Variables Güncelleme

Deploy tamamlandıktan sonra:

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. `VITE_API_BASE_URL` değerini güncelleyin:
   ```
   VITE_API_BASE_URL=https://your-actual-vercel-url.vercel.app/api
   ```
3. `FRONTEND_URL` değerini güncelleyin:
   ```
   FRONTEND_URL=https://your-actual-vercel-url.vercel.app
   ```
4. **"Redeploy"** yapın (Deployments → ... → Redeploy)

## ✅ Test

1. Vercel URL'inizi açın
2. Signup/Login yapın
3. Post oluşturun
4. Tüm özellikleri test edin

## 🔧 Sorun Giderme

### MongoDB Bağlantı Hatası

1. **MongoDB Atlas Network Access**:
   - MongoDB Atlas Dashboard → Network Access
   - **"Add IP Address"** → **"Allow Access from Anywhere"** (`0.0.0.0/0`)
   
2. **Connection String Kontrolü**:
   - MongoDB Atlas → Database → Connect → Drivers
   - Connection string'i kopyalayın
   - Username ve password'ü değiştirin
   - `MONGODB_URI` environment variable'ını güncelleyin

### CORS Hatası

1. `backend/server.js` dosyasında `allowedOrigins` array'ine Vercel URL'inizi ekleyin:
   ```javascript
   const allowedOrigins = [
     "http://localhost:3000",
     "https://your-project.vercel.app",
     process.env.FRONTEND_URL
   ].filter(Boolean);
   ```

2. Değişiklikleri commit edip push edin
3. Vercel otomatik olarak yeniden deploy edecek

### API Route 404 Hatası

1. `vercel.json` dosyasının doğru yapılandırıldığından emin olun
2. `api/index.js` dosyasının mevcut olduğundan emin olun
3. Vercel logs'u kontrol edin (Deployments → ... → View Function Logs)

### Build Hatası

1. **Local Build Test**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Dependencies Kontrolü**:
   - Tüm dependencies'in `package.json`'da olduğundan emin olun
   - `node_modules` klasörünü `.gitignore`'da olduğundan emin olun

## 📝 Önemli Notlar

### Vercel Serverless Functions

- Backend Vercel serverless functions olarak çalışır
- Her API çağrısı ayrı bir function instance'ı oluşturabilir
- MongoDB connection caching kullanılıyor (performans için)

### Cold Start

- İlk API çağrısı biraz yavaş olabilir (cold start)
- Sonraki çağrılar hızlı olacaktır

### Cron Jobs

- Vercel'de cron job'lar için **Vercel Cron Jobs** kullanılmalı
- `vercel.json`'a cron job yapılandırması eklenebilir
- Şu an için cron job'lar çalışmayabilir (gerekirse ayrı bir servis kullanın)

### File Upload Limits

- Vercel serverless functions'da 4.5MB request limit var
- Büyük dosyalar için Cloudinary kullanılıyor (zaten yapılandırılmış)

### Environment Variables

- Production, Preview ve Development için ayrı environment variables ayarlanabilir
- `VITE_` prefix'li değişkenler frontend'de kullanılabilir
- Diğer değişkenler sadece backend'de kullanılabilir

## 🎉 Başarılı Deployment Checklist

- [ ] Vercel'de proje oluşturuldu
- [ ] Tüm environment variables eklendi
- [ ] İlk deploy tamamlandı
- [ ] Environment variables güncellendi (Vercel URL ile)
- [ ] Redeploy yapıldı
- [ ] MongoDB bağlantısı çalışıyor
- [ ] Frontend API çağrıları çalışıyor
- [ ] Signup/Login çalışıyor
- [ ] Post oluşturma çalışıyor
- [ ] Tüm özellikler test edildi

## 📞 Yardım

Sorun yaşarsanız:
1. Vercel logs'u kontrol edin
2. Browser console'u kontrol edin
3. Network tab'ı kontrol edin
4. MongoDB Atlas logs'u kontrol edin

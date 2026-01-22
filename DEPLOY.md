# Xirman_Docs Sürətli Yeniləmə Skripti

Serverdə (VPS) layihəni sürətli yeniləmək üçün aşağıdakı əmrləri terminala yapışdıra və ya bir `.sh` faylı kimi yadda saxlayıb işlədə bilərsiniz.

Bu skripti işlətməzdən əvvəl lokal kompüterdə (burada) etdiyimiz dəyişiklikləri **GitHub-a push etməyi unutmayın!**

```bash
#!/bin/bash

# Xəta baş verərsə dayandır
set -e

echo "🚀 Yeniləmə başladı..."

# 1. Layihə qovluğuna keçid (Serverdəki qovluq adınız fərqlidirsə dəyişin)
cd ~/Xirman_Docs || { echo "❌ Layihə qovluğu tapılmadı!"; exit 1; }

echo "📥 Kodlar GitHub-dan çəkilir..."
git pull origin main

# 2. API (Backend) Yenilənməsi
echo "⚙️  Backend (API) yenilənir..."
cd api
pnpm install --frozen-lockfile
pnpm build

# PM2 Prosesini restart et (Adı: xirman-api)
echo "🔄 API restart edilir..."
pm2 restart xirman-api --update-env

# 3. Client (Frontend) Yenilənməsi
echo "🎨 Frontend (Client) yenilənir..."
cd ../client
pnpm install --frozen-lockfile
pnpm build

# Frontend Nginx ilə verildiyi üçün sadəcə build kifayətdir.
# Əgər Nginx keşləməsi varsa, reload verilə bilər:
# sudo systemctl reload nginx

echo "✅ Yeniləmə uğurla tamamlandı!"
pm2 status
```

### Necə istifadə etmeli?

1.  Serverdə bir fayl yaradın: `nano deploy.sh`
2.  Yuxarıdakı kodu içinə yapışdırın.
3.  İcazə verin: `chmod +x deploy.sh`
4.  Hər dəfə yeniləmək üçün sadəcə bunu yazın: `./deploy.sh`

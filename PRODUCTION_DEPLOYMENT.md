# Production Deployment & Database Guide (Xirman EAS)

Bu sənəd sistemin production mühitinə köçürülməsi, verilənlər bazası (DB) bağlantıları və digər mühüm konfiqurasiyalar haqqında texniki məlumatları ehtiva edir.

## 1. Mühit Dəyişənləri (.env)

Sistemin işləməsi üçün `api` qovluğunda `.env` faylı yaradılmalı və aşağıdakı məlumatlar doldurulmalıdır:

### Verilənlər Bazası (PostgreSQL)
- `DB_HOST`: Verilənlər bazasının server ünvanı (məs: `localhost` və ya `db.example.com`)
- `DB_PORT`: Port (adətən `5432`)
- `DB_USERNAME`: İstifadəçi adı
- `DB_PASSWORD`: Şifrə
- `DB_DATABASE`: Baza adı

### Redis (BullMQ üçün)
E-poçt növbəsi (queue) və fon işləri üçün Redis serveri tələb olunur:
- `REDIS_URL`: `redis://username:password@host:port` formatında (və ya aşağıdakılar):
- `REDIS_HOST`: Redis ünvanı
- `REDIS_PORT`: Port (adətən `6379`)

### JWT & Mail
- `JWT_SECRET`: Güclü bir gizli açar
- `BREVO_API_KEY`: Brevo (Sendinblue) API açarı (E-mail göndərmək üçün)
- `MAIL_FROM`: Göndərən e-mail ünvanı

---

## 2. Production-da Bazaya Qoşulma (Database Module)

Production mühitində bazaya qoşularkən `api/src/database/database.module.ts` faylında bəzi dəyişikliklər edilməlidir:

### SSL Aktivləşdirilməsi
Əgər Supabase, Render və ya digər cloud provayderlərdən istifadə edirsinizsə, SSL tələb oluna bilər. Aşağıdakı kodu aktivləşdirin:

```typescript
// api/src/database/database.module.ts

ssl: configService.get<string>('DB_HOST') !== 'localhost'
  ? { rejectUnauthorized: false }
  : false,
```

### Connection Pooling
Yüksək trafikli mühitlərdə bazaya qoşulma limitini tənzimləmək üçün `extra` parametrlərini aktivləşdirin:

```typescript
extra: {
  max: 10, // Max bağlantı sayı
  connectionTimeoutMillis: 10000,
},
```

### Təhlükəsizlik Xəbərdarlığı
- **`synchronize: true`**: Development mərhələsində faydalıdır (entity-ə görə DB strukturunu avtomatik yaradır), lakin production-da mütləq `false` edilməlidir ki, məlumat itkisi baş verməsin.
- **`dropSchema: true`**: BU PARAMETRƏ TOXUNMAYIN! Aktiv edilərsə, hər restartda bütün bazanı silir.

---

## 3. E-mail və Növbə (Mail Module)

Sistem Redis-dən istifadə edərək e-mailləri fon rejimində göndərir.
- `api/src/mail/mail.module.ts` faylında `REDIS_URL` dəyişəni varsa, sistem avtomatik olaraq ona üstünlük verəcək.
- Əgər xüsusi Redis host/port istifadə edirsinizsə, fayldakı `local redis` şərhini (comment) açın.

---

## 4. Fayl Yükləmələri (Storage)

Hal-hazırda sənədlər lokal `api/uploads` qovluğunda saxlanılır. Production-da:
1. `uploads` qovluğunun yazma icazəsi (write permissions) olduğundan əmin olun.

---

## 5. Build və Run

Sistemi build edib işə salmaq üçün:

```bash
# API Build
cd api
pnpm install
pnpm build
pnpm start:prod

# Client Build
cd client
pnpm install
pnpm build
```

Production-da sistemi idarə etmək üçün **PM2** və ya oxşar proses menecerindən istifadə etmək tövsiyə olunur.

---

## 6. Client (Frontend) Konfiqurasiyası

Frontend proqramı API ilə əlaqə qurmaq üçün `client/src/features/utils/apiConfig.ts` faylındakı `API_BASE_URL` dəyişənindən istifadə edir.

Production-a çıxarkən:
1. Lokal IP-ni (`http://192.168.100.194:3000`) real server ünvanı ilə əvəzləyin.
2. Mümkünsə, bu dəyişəni `.env` faylından oxuyacaq şəkildə nizamlayın (Vite üçün `import.meta.env.VITE_API_URL`).

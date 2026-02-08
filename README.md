# CheckIn — Poultry Barn Management (MVP)

## تشغيل سريع (Docker)
1) انسخ ملف البيئة:
```bash
cp .env.example .env
```

2) شغل النظام:
```bash
docker compose up --build
```

3) افتح المتصفح:
- http://localhost:3000

### بيانات الأدمن الافتراضية
- Email: `admin@checkin.local`
- Password: `Admin@12345`

> تقدر تغيّرهم من `.env`

---

## الأدوار (Roles)
- **ADMIN**: كل شيء + إدارة المستخدمين + تبديل اللغة عربي/إنجليزي
- **MANAGER**: إعدادات + Dashboard + إدخال يومية + قراءات حساسات
- **WORKER**: Dashboard + إدخال يومية + قراءات حساسات (بدون ظهور التكاليف)

---

## الصفحات
- `/login` تسجيل الدخول
- `/onboarding` إعدادات العنبر والدورة (ADMIN/MANAGER)
- `/dashboard` لوحة المتابعة
- `/daily` إدخال يومية
- `/sensors` إدخال قراءات حساسات يدوي
- `/users` إدارة المستخدمين (ADMIN فقط)

---

## ملاحظات
- الحساسات حالياً **إدخال يدوي**. 
- بعد دورتين يمكن إضافة تكامل IoT (MQTT) بسهولة عبر API جديدة.


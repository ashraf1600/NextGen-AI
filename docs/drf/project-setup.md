---
title: Project Setup
---

# Section 2: Project Setup — Blog API

এই chapter এ আমরা আমাদের সম্পূর্ণ ডকুমেন্টেশনের একমাত্র প্রজেক্ট — **Blog API** — এর initial setup করব। এই একই প্রজেক্টের উপর ভিত্তি করে বাকি সব chapter (Models, Serializer, ViewSet, Authentication, ইত্যাদি) তৈরি হবে, তাই এই chapter টা মনোযোগ দিয়ে বোঝা এবং হাতে-কলমে অনুসরণ করা জরুরি।

---

## এই Chapter এ যা যা থাকবে

1. Python ও Virtual Environment সেটআপ
2. Django ইনস্টল করা
3. Project তৈরি করা
4. App তৈরি করা
5. Django REST Framework ইনস্টল করা
6. Settings কনফিগার করা
7. URLs সেটআপ করা
8. Database সেটআপ করা
9. Server চালানো
10. পূর্ণ Folder Structure ব্যাখ্যা
11. সব প্রয়োজনীয় কমান্ডের সারসংক্ষেপ চিট-শিট

---

## What — আমরা কী বানাচ্ছি?

আমরা একটা **Blog API** বানাব, যেখানে থাকবে:

- User Authentication (JWT সহ)
- Post, Category, Tag, Comment
- Like, Bookmark
- Profile, Image Upload
- Pagination, Search, Filtering, Ordering
- Permission System

এই chapter এ শুধু ভিত্তি (foundation) তৈরি হবে — Django project ও app বানানো, DRF যুক্ত করা, এবং সার্ভার চালু করা পর্যন্ত।

---

## Why — কেন এভাবে Setup করা হয়?

Django একটা **project-app** architecture অনুসরণ করে:

- **Project** — পুরো application এর কনফিগারেশন এবং সেটিংস ধরে রাখে (একটাই)
- **App** — নির্দিষ্ট একটা feature/module (একাধিক app থাকতে পারে)

আমাদের Blog API তে আমরা একটা project (`blogapi`) এর ভিতরে একটা মূল app (`blog`) রাখব, যেখানে Post, Comment, Category, Tag — সবকিছু থাকবে। এভাবে আলাদা করার ফলে কোড organized থাকে এবং ভবিষ্যতে নতুন feature (যেমন Notification app) যোগ করা সহজ হয়।

```
Project (blogapi)
   │
   └── App (blog)
          ├── models.py
          ├── serializers.py
          ├── views.py
          └── urls.py
```

---

## ধাপ ১: Python ভার্সন যাচাই

```bash
python --version
```

::: tip
DRF এর সাম্প্রতিক ভার্সনের জন্য Python 3.9 বা তার উপরে থাকা উচিত।
:::

---

## ধাপ ২: Virtual Environment তৈরি করা

Virtual Environment কেন দরকার? কারণ প্রতিটা প্রজেক্টের নিজস্ব প্যাকেজ ভার্সন থাকা উচিত — একটা প্রজেক্টের dependency আরেকটা প্রজেক্টের সাথে conflict করা উচিত না।

### macOS / Linux

```bash
python -m venv venv
source venv/bin/activate
```

### Windows PowerShell

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Activate হলে টার্মিনালে `(venv)` দেখা যাবে — এটাই নিশ্চিত করে তুমি সঠিক environment এ আছো।

---

## ধাপ ৩: Django এবং DRF ইনস্টল করা

```bash
pip install django djangorestframework
```

অতিরিক্ত প্রয়োজনীয় প্যাকেজ (আমাদের Blog API এর জন্য পরে লাগবে):

```bash
pip install djangorestframework-simplejwt
pip install django-filter
pip install Pillow
pip install django-cors-headers
```

| প্যাকেজ | কেন লাগবে |
|---|---|
| `djangorestframework` | মূল DRF ফ্রেমওয়ার্ক |
| `djangorestframework-simplejwt` | JWT Authentication এর জন্য |
| `django-filter` | Filtering ফিচারের জন্য |
| `Pillow` | Image Upload/Processing এর জন্য (ImageField ব্যবহার করতে বাধ্যতামূলক) |
| `django-cors-headers` | Frontend (React/Vue ইত্যাদি) থেকে API কল করার জন্য CORS handle করতে |

---

## ধাপ ৪: Django Project তৈরি করা

```bash
django-admin startproject blogapi .
```

::: warning
কমান্ডের শেষে `.` (dot) দিতে ভুলো না। এটা নিশ্চিত করে project ফাইলগুলো একটা অতিরিক্ত nested folder ছাড়াই সরাসরি current directory তে তৈরি হয়।
:::

এই কমান্ড চালানোর পর তৈরি হবে:

```
blogapi/
    __init__.py
    settings.py
    urls.py
    asgi.py
    wsgi.py
manage.py
```

---

## ধাপ ৫: App তৈরি করা

```bash
python manage.py startapp blog
```

এটা তৈরি করবে:

```
blog/
    migrations/
    __init__.py
    admin.py
    apps.py
    models.py
    tests.py
    views.py
```

---

## ধাপ ৬: `settings.py` কনফিগার করা

`blogapi/settings.py` ফাইলে `INSTALLED_APPS` এ আমাদের app এবং DRF যুক্ত করতে হবে।

```python
# blogapi/settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'django_filters',
    'corsheaders',

    # আমাদের নিজের app
    'blog',
]
```

### Middleware এ CORS যোগ করা

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # সবচেয়ে উপরে রাখতে হবে
    'django.middleware.security.SecurityMiddleware',
    # ... বাকি middleware অপরিবর্তিত থাকবে
]

CORS_ALLOW_ALL_ORIGINS = True  # শুধু development এর জন্য, production এ নির্দিষ্ট origin দিতে হবে
```

### প্রতিটা লাইন কেন প্রয়োজন

- `'rest_framework'` — DRF এর সব ফিচার (Serializer, View, ইত্যাদি) সক্রিয় করে
- `'rest_framework_simplejwt'` — JWT token generate/validate করার জন্য
- `'django_filters'` — API তে filtering সুবিধা যোগ করে
- `'corsheaders'` + middleware — Frontend থেকে API কল allow করে
- `'blog'` — আমাদের নিজের app, যেখানে সব model/logic থাকবে

---

## ধাপ ৭: `urls.py` সেটআপ করা

```python
# blogapi/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('blog.urls')),  # blog app এর urls যুক্ত করা
]
```

এখন `blog` app এর ভিতরে একটা `urls.py` ফাইল বানাতে হবে (এখনো খালি রাখব, পরের chapter এ endpoint যোগ করব):

```python
# blog/urls.py

from django.urls import path

urlpatterns = [
    # এখানে পরের chapter গুলোতে endpoint যুক্ত হবে
]
```

---

## ধাপ ৮: Database সেটআপ (Migration)

Django ডিফল্ট ভাবে SQLite ব্যবহার করে, যেটা development এর জন্য যথেষ্ট। কোনো আলাদা configuration ছাড়াই কাজ শুরু করা যায়।

```bash
python manage.py makemigrations
python manage.py migrate
```

| কমান্ড | কাজ |
|---|---|
| `makemigrations` | Model এর পরিবর্তন থেকে migration ফাইল তৈরি করে |
| `migrate` | সেই migration গুলো actual database এ প্রয়োগ করে |

---

## ধাপ ৯: Superuser তৈরি করা (Admin Panel এর জন্য)

```bash
python manage.py createsuperuser
```

এটা তোমাকে username, email, password চাইবে — এই তথ্য দিয়ে পরে `/admin/` panel এ লগইন করা যাবে।

---

## ধাপ ১০: Server চালানো

```bash
python manage.py runserver
```

ব্রাউজারে যাও: `http://127.0.0.1:8000/` — যদি Django এর ডিফল্ট welcome page দেখা যায়, তাহলে সেটআপ সফল হয়েছে।

---

## সম্পূর্ণ Folder Structure

```
blogapi_project/
│
├── venv/                      ← virtual environment (git এ commit হবে না)
│
├── blogapi/                    ← মূল project folder (settings/config)
│   ├── __init__.py
│   ├── settings.py             ← সব configuration এখানে
│   ├── urls.py                  ← root URL router
│   ├── asgi.py
│   └── wsgi.py
│
├── blog/                        ← আমাদের app (মূল business logic)
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py                 ← Admin panel এ model register করা হয়
│   ├── apps.py
│   ├── models.py                ← Post, Comment, Category ইত্যাদি (পরের chapter)
│   ├── serializers.py           ← এখনো তৈরি করিনি (পরের chapter)
│   ├── views.py
│   ├── urls.py
│   └── tests.py
│
├── manage.py                    ← Django এর কমান্ড-লাইন ইউটিলিটি
└── requirements.txt              ← সব প্যাকেজের তালিকা (নিচে দেখো)
```

### প্রতিটা ফাইল কেন প্রয়োজন

| ফাইল | ভূমিকা |
|---|---|
| `manage.py` | Django এর সব কমান্ড (`runserver`, `migrate`, ইত্যাদি) এই ফাইলের মাধ্যমে চলে |
| `settings.py` | Database, installed app, middleware, DRF config — সবকিছুর কেন্দ্রবিন্দু |
| `urls.py` (project level) | পুরো প্রজেক্টের route কে বিভিন্ন app এ ভাগ করে দেয় |
| `models.py` | Database এর টেবিল Python class আকারে define করা হয় এখানে |
| `admin.py` | কোন কোন model Django Admin panel এ দেখা যাবে তা নির্ধারণ করে |

---

## `requirements.txt` তৈরি করা

প্রজেক্ট শেয়ার করার সময় বা deploy করার সময় অন্য কেউ যেন সহজে একই প্যাকেজ ইনস্টল করতে পারে, তার জন্য:

```bash
pip freeze > requirements.txt
```

অন্য কেউ প্রজেক্ট setup করতে চাইলে:

```bash
pip install -r requirements.txt
```

---

## সব Common Command — এক নজরে (Cheat Sheet)

| কমান্ড | কাজ |
|---|---|
| `python -m venv venv` | Virtual environment তৈরি |
| `pip install django djangorestframework` | Django ও DRF ইনস্টল |
| `django-admin startproject blogapi .` | নতুন project তৈরি |
| `python manage.py startapp blog` | নতুন app তৈরি |
| `python manage.py makemigrations` | Migration ফাইল তৈরি |
| `python manage.py migrate` | Migration database এ প্রয়োগ |
| `python manage.py createsuperuser` | Admin user তৈরি |
| `python manage.py runserver` | Development server চালু |
| `python manage.py runserver 8080` | নির্দিষ্ট port এ server চালু |
| `python manage.py shell` | Django shell খোলা (ORM নিয়ে experiment করতে) |
| `python manage.py showmigrations` | কোন কোন migration আছে তা দেখা |
| `python manage.py sqlmigrate blog 0001` | Migration এর SQL query দেখা |
| `pip freeze > requirements.txt` | ইনস্টল করা প্যাকেজের তালিকা সংরক্ষণ |
| `pip install -r requirements.txt` | তালিকা থেকে প্যাকেজ ইনস্টল |

---

## Common Mistakes

- **`django-admin startproject blogapi .` এ dot ভুলে যাওয়া** — এতে একটা অপ্রয়োজনীয় nested folder তৈরি হয়ে যায়
- **Virtual environment activate না করে প্যাকেজ ইনস্টল করা** — এতে প্যাকেজ system-wide ইনস্টল হয়ে যায়, প্রজেক্ট isolated থাকে না
- **`INSTALLED_APPS` এ `'rest_framework'` যোগ করতে ভুলে যাওয়া** — এতে DRF এর কোনো ফিচারই কাজ করবে না
- **Migration না চালিয়ে সরাসরি server চালানো** — Database টেবিল না থাকায় error আসবে

---

## Best Practices

- সবসময় virtual environment ব্যবহার করো, কখনো global ভাবে প্যাকেজ ইনস্টল করবে না
- `requirements.txt` নিয়মিত আপডেট রাখো
- `.gitignore` এ `venv/`, `__pycache__/`, `*.pyc`, `db.sqlite3` যোগ করো
- Production এ SQLite এর বদলে PostgreSQL ব্যবহার করা উচিত (এটা পরে Deployment chapter এ আলোচনা হবে)

---

## Interview Questions

**প্রশ্ন: Django Project আর App এর মধ্যে পার্থক্য কী?**
> Project হলো পুরো application এর কনফিগারেশন ধারণকারী একটা container, যেখানে একাধিক App থাকতে পারে। App হলো একটা নির্দিষ্ট feature/module, যেটা reusable এবং স্বনির্ভর।

**প্রশ্ন: `makemigrations` আর `migrate` এর পার্থক্য কী?**
> `makemigrations` model এর পরিবর্তন থেকে migration ফাইল (instruction) তৈরি করে, কিন্তু database এ কিছু প্রয়োগ করে না। `migrate` সেই migration ফাইল গুলো actual database তে প্রয়োগ করে।

**প্রশ্ন: `INSTALLED_APPS` এ app যোগ না করলে কী হয়?**
> Django সেই app এর model, admin registration, বা কোনো ফিচার চিনতেই পারবে না — migration এও সেই app এর model অন্তর্ভুক্ত হবে না।

---

## Summary

- আমরা `venv` দিয়ে isolated environment বানিয়েছি
- `django-admin startproject` দিয়ে project এবং `startapp` দিয়ে app তৈরি করেছি
- `settings.py` তে DRF, JWT, filter, CORS প্যাকেজ যুক্ত করেছি
- `urls.py` তে root route কে app এর route এর সাথে সংযুক্ত করেছি
- Migration চালিয়ে database প্রস্তুত করেছি এবং server সফলভাবে চালিয়েছি
- এই ভিত্তির উপরেই পরবর্তী chapter (**Models**) এ আমরা Post, Comment, Category, Tag, Profile — এসব model বানাব


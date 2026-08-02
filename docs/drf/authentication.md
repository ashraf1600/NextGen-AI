---
title: Authentication
---

# Section 10: Authentication

এতদিন আমরা `request.user` ব্যবহার করেছি (যেমন `perform_create` এ `author=self.request.user`), কিন্তু কখনো ব্যাখ্যা করিনি — DRF কীভাবে জানে **কে** request পাঠাচ্ছে। এই chapter এ আমরা দেখব **Authentication** কীভাবে কাজ করে, এবং কীভাবে **JWT (JSON Web Token)** দিয়ে আমাদের Blog API secure করা যায়।

---

## Why — কেন Authentication দরকার?

Authentication ছাড়া, যেকেউ যেকোনো নাম দিয়ে Post তৈরি করতে পারবে, অন্যের Post ডিলিট করতে পারবে — কোনো নিয়ন্ত্রণ থাকবে না। Authentication নিশ্চিত করে **"এই request টা আসলে কে পাঠাচ্ছে"**, এবং পরবর্তী chapter এ শেখা **Permission** নিশ্চিত করে **"এই ব্যক্তি এই কাজ করার অনুমতি রাখে কিনা"**।

::: tip
**Authentication** আর **Authorization/Permission** এক জিনিস না — Authentication হলো পরিচয় যাচাই ("তুমি কে?"), Permission হলো অনুমতি যাচাই ("তুমি কি এই কাজ করতে পারবে?")। এই দুইটা আলাদা ধাপ, আলাদা chapter এ আলোচনা করা হচ্ছে।
:::

---

## Authentication এর প্রকারভেদ

| পদ্ধতি | কীভাবে কাজ করে | কখন উপযুক্ত |
|---|---|---|
| **Session Authentication** | Server-side session + cookie ব্যবহার করে | Django Admin, browser-based traditional web app |
| **Token Authentication** | একটা static token, প্রতি request এ header এ পাঠাতে হয় | সাধারণ API, ছোট প্রজেক্ট |
| **JWT (JSON Web Token)** | Self-contained, stateless token, expiry সহ | Modern API, mobile app, SPA (React/Vue) — **সবচেয়ে জনপ্রিয়** |

```mermaid
flowchart LR
    A[Client Login করে] --> B{কোন Authentication?}
    B -->|Session| C[Server session store করে<br/>+ cookie পাঠায়]
    B -->|Token| D[একটা static token দেয়<br/>expiry নেই]
    B -->|JWT| E[Access + Refresh token দেয়<br/>expiry সহ, stateless]
```

---

## Session vs Token vs JWT — বিস্তারিত তুলনা

| বৈশিষ্ট্য | Session | Token | JWT |
|---|---|---|---|
| Server এ state রাখে? | হ্যাঁ (session store) | হ্যাঁ (database এ token) | না (stateless) |
| Scaling এ সুবিধা | কম (session store shared করতে হয়) | মাঝারি | বেশি (কোনো server-side lookup লাগে না) |
| Expiry | Session timeout | সাধারণত নেই (ম্যানুয়াল ইনভ্যালিডেট করতে হয়) | Built-in expiry (access + refresh) |
| Mobile app এ উপযুক্ততা | কম (cookie-based) | মাঝারি | বেশি (header-based, stateless) |

::: tip
এই কারণেই আধুনিক API (বিশেষত React/Vue frontend বা mobile app এর সাথে ব্যবহৃত API) এ **JWT** সবচেয়ে বেশি ব্যবহৃত হয় — এটা stateless, তাই একাধিক server এ scale করা সহজ, এবং built-in expiry থাকায় নিরাপত্তা ভালো।
:::

---

## JWT (JSON Web Token) কীভাবে কাজ করে

```mermaid
sequenceDiagram
    participant Client
    participant Server

    Client->>Server: Login (username + password)
    Server-->>Client: Access Token + Refresh Token
    Note over Client: Token localStorage/memory এ সংরক্ষণ

    Client->>Server: Protected Request<br/>Header: Authorization Bearer Access-Token
    Server->>Server: Token validate করা (কোনো DB lookup ছাড়াই)
    Server-->>Client: Response (যদি token valid হয়)

    Note over Client,Server: Access Token expire হলে...
    Client->>Server: Refresh Token পাঠিয়ে নতুন Access Token চাওয়া
    Server-->>Client: নতুন Access Token
```

### Access Token vs Refresh Token

| Token | মেয়াদ | কাজ |
|---|---|---|
| **Access Token** | ছোট (সাধারণত ৫-৬০ মিনিট) | প্রতিটা protected request এ পাঠানো হয়, পরিচয় প্রমাণ করে |
| **Refresh Token** | দীর্ঘ (সাধারণত কয়েক দিন) | Access Token expire হলে, নতুন Access Token পাওয়ার জন্য ব্যবহার হয় |

### কেন দুইটা আলাদা Token?

Access Token এর মেয়াদ কম রাখা হয় যাতে token চুরি হলেও ক্ষতি সীমিত থাকে। কিন্তু user কে বারবার login করতে বললে বিরক্তিকর হয়ে যায় — তাই দীর্ঘমেয়াদী Refresh Token দিয়ে, user login না করেই নতুন Access Token নিতে পারে, যতক্ষণ Refresh Token বৈধ থাকে।

---

## Setup: Simple JWT ইনস্টল করা

```bash
pip install djangorestframework-simplejwt
```

```python
# blogapi/settings.py

INSTALLED_APPS = [
    # ...
    'rest_framework_simplejwt',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}
```

### লাইন ব্যাখ্যা

- `DEFAULT_AUTHENTICATION_CLASSES` — এটা global ভাবে বলে দেয় পুরো প্রজেক্টে ডিফল্টভাবে JWT দিয়ে authentication হবে
- `ACCESS_TOKEN_LIFETIME` — Access token কতক্ষণ বৈধ থাকবে
- `ROTATE_REFRESH_TOKENS` — `True` করলে প্রতিবার refresh করার সময় নতুন Refresh Token ও দেওয়া হয় (নিরাপত্তা বাড়ায়)

---

## URL Setup — Login, Refresh Endpoint

```python
# blogapi/urls.py

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # ...
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

- `TokenObtainPairView` — এটাই **Login** endpoint, username/password নিয়ে Access + Refresh token ফেরত দেয়
- `TokenRefreshView` — Refresh token নিয়ে নতুন Access token ফেরত দেয়

---

## Login (Token Obtain) — Request/Response

### Request

```
POST /api/token/
Content-Type: application/json

{
    "username": "rahim",
    "password": "pass1234"
}
```

### Response

```json
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Protected Endpoint অ্যাক্সেস করা

Login এ পাওয়া `access` token এখন প্রতিটা protected request এর সাথে পাঠাতে হবে।

### Request

```
GET /api/posts/
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

::: warning
`Authorization` header এ অবশ্যই `Bearer ` শব্দটা (space সহ) token এর আগে থাকতে হবে — এটা ভুলে গেলে DRF token টা চিনতে পারবে না এবং `401 Unauthorized` error দেবে।
:::

---

## Refresh — নতুন Access Token নেওয়া

### Request

```
POST /api/token/refresh/
Content-Type: application/json

{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Response

```json
{
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Logout — JWT তে কীভাবে কাজ করে

যেহেতু JWT **stateless** (server কোনো token মনে রাখে না), সাধারণ logout শুধু **client side এ token মুছে ফেলা** দিয়েই হয়ে যায় — কোনো server call এর দরকার নেই।

```javascript
// Frontend এ logout (ধারণাগত উদাহরণ)
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
```

### কিন্তু যদি সত্যিকারের Token Invalidate করতে চাও

কখনো কখনো একটা নির্দিষ্ট Refresh Token কে server-side এ ব্লক করে দেওয়া দরকার হয় (যেমন device চুরি হলে) — এর জন্য **Blacklist** ফিচার ব্যবহার করা হয়।

```python
INSTALLED_APPS = [
    # ...
    'rest_framework_simplejwt.token_blacklist',
]
```

```python
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response

class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "সফলভাবে লগআউট হয়েছে।"}, status=205)
        except Exception:
            return Response(status=400)
```

এখানে `token.blacklist()` সেই নির্দিষ্ট Refresh Token কে একটা blacklist database এ যোগ করে দেয় — এরপর সেই token দিয়ে আর নতুন Access Token পাওয়া যাবে না।

---

## Custom User Serializer দিয়ে Registration

Login/Token endpoint তো Simple JWT দিয়ে সহজে পাওয়া গেল, কিন্তু নতুন User registration আমাদের নিজেদেরই বানাতে হবে।

```python
# blog/serializers.py

from django.contrib.auth.models import User
from rest_framework import serializers

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user
```

```python
# blog/views.py
from rest_framework.generics import CreateAPIView
from .serializers import UserRegisterSerializer

class RegisterView(CreateAPIView):
    serializer_class = UserRegisterSerializer
```

### লাইন ব্যাখ্যা

- `create()` override করা হয়েছে — কারণ ডিফল্ট `ModelSerializer.create()` সরাসরি `User.objects.create(**validated_data)` কল করত, যেটা password কে plain text এ save করে ফেলত (গুরুতর নিরাপত্তা সমস্যা)
- `User.objects.create_user()` ব্যবহার করা হচ্ছে, যেটা automatic ভাবে password hash করে

::: danger
কখনোই `User.objects.create()` দিয়ে password সরাসরি save করবে না — সবসময় `create_user()` ব্যবহার করো, যেটা password hashing সামলায়।
:::

---

## সম্পূর্ণ Authentication Flow Diagram

```mermaid
flowchart TD
    A[User Registration] -->|POST /api/register/| B[User তৈরি, password hashed]
    B --> C[Login]
    C -->|POST /api/token/| D[Access + Refresh Token পাওয়া]
    D --> E[Protected API Call]
    E -->|Authorization: Bearer access-token| F{Token বৈধ?}
    F -->|হ্যাঁ| G[Request সম্পন্ন হয়]
    F -->|না, Expired| H[Refresh Token দিয়ে নতুন Access Token নেওয়া]
    H --> E
    G --> I[Logout — token client থেকে মুছে ফেলা]
```

---

## Common Mistakes

- `Authorization` header এ `Bearer` শব্দ ভুলে যাওয়া
- Password field এ `write_only=True` না দিয়ে Serializer বানানো
- `create_user()` এর বদলে `create()` ব্যবহার করে password hash না হওয়া
- Access Token কে খুব দীর্ঘ সময়ের জন্য valid রাখা (নিরাপত্তা ঝুঁকি বাড়ায়)

---

## Best Practices

- Access Token ছোট মেয়াদের রাখো (৫-৩০ মিনিট), Refresh Token দীর্ঘ মেয়াদের (৭-৩০ দিন)
- Production এ `ROTATE_REFRESH_TOKENS=True` এবং blacklist ব্যবহার করো
- Token localStorage এর বদলে httpOnly cookie তে রাখা বেশি নিরাপদ (XSS attack থেকে সুরক্ষা), যদিও এটা frontend architecture এর উপর নির্ভর করে
- Registration serializer এ সবসময় `create_user()` ব্যবহার করো

---

## Interview Questions

**প্রশ্ন: JWT কেন "stateless"?**
> কারণ token নিজেই সব প্রয়োজনীয় তথ্য (user identity, expiry) বহন করে, এবং server কে কোনো database এ token খুঁজে যাচাই করতে হয় না — শুধু token এর signature verify করলেই যথেষ্ট।

**প্রশ্ন: Access Token আর Refresh Token কেন আলাদা?**
> Access Token কম মেয়াদের রেখে নিরাপত্তা ঝুঁকি কমানো হয় (চুরি হলেও দ্রুত অকার্যকর হয়ে যায়), আর Refresh Token দীর্ঘ মেয়াদের রেখে user experience ভালো রাখা হয় (বারবার login করা লাগে না)।

**প্রশ্ন: JWT তে "Logout" আসলে কী করে?**
> সাধারণভাবে, শুধু client side এ token মুছে ফেলা হয় (কারণ JWT stateless)। সত্যিকারের server-side invalidation দরকার হলে, Blacklist ফিচার ব্যবহার করে নির্দিষ্ট token কে ব্লক করতে হয়।

---

## Summary

- **Session, Token, JWT** — তিন ধরনের authentication পদ্ধতি, আধুনিক API তে **JWT** সবচেয়ে বেশি ব্যবহৃত
- **Access Token** (ছোট মেয়াদ) এবং **Refresh Token** (দীর্ঘ মেয়াদ) — দুইটা আলাদা কাজ করে
- `djangorestframework-simplejwt` দিয়ে `TokenObtainPairView` (Login) এবং `TokenRefreshView` সহজে সেটআপ করা যায়
- Protected endpoint এ `Authorization: Bearer <token>` header পাঠাতে হয়
- Registration এ সবসময় `create_user()` ব্যবহার করা জরুরি, password hashing এর জন্য
- Logout মূলত client-side কাজ, তবে **Blacklist** দিয়ে server-side ও করা যায়

পরের chapter — **Section 11: Permissions** — এ আমরা দেখব, user login করা থাকলেও তার **কী কী করার অনুমতি** আছে সেটা কীভাবে নিয়ন্ত্রণ করতে হয়।

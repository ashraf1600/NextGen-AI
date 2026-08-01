---
title: Installation
---

# Installation — LangChain সেটআপ

এই পেজে আমরা ধাপে ধাপে দেখব কীভাবে LangChain এর জন্য প্রয়োজনীয় পুরো environment সেটআপ করতে হয়, যাতে যেকোনো কোড উদাহরণ সরাসরি চালানো যায়।

## প্রয়োজনীয় জিনিসপত্র (Prerequisites)

- Python 3.9 বা তার উপরের ভার্সন
- `pip` (অথবা চাইলে `uv` / `poetry`)
- অন্তত একটা LLM provider এর API key (OpenAI, Anthropic, Google — যেকোনো একটা)

Python ভার্সন চেক করার জন্য:

```bash
python --version
```

যদি Python ইনস্টল করা না থাকে, [python.org](https://www.python.org/downloads/) থেকে ডাউনলোড করে নাও। ইনস্টল করার সময় অবশ্যই "Add Python to PATH" অপশনটা টিক দিতে হবে (Windows এ), নাহলে টার্মিনাল থেকে `python` কমান্ড কাজ করবে না।

---

## ধাপ ১: Virtual Environment তৈরি করা

প্রতিটা প্রজেক্টের জন্য আলাদা virtual environment ব্যবহার করা উচিত — এতে করে একটা প্রজেক্টের প্যাকেজের সাথে আরেকটা প্রজেক্টের প্যাকেজের কনফ্লিক্ট হয় না।

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

::: warning PowerShell এ Execution Policy সমস্যা
যদি `Activate.ps1` চালাতে গিয়ে "cannot be loaded because running scripts is disabled" এই ধরনের error আসে, তাহলে PowerShell এ (Administrator মোডে) এই কমান্ড চালাও:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
তারপর আবার Activate কমান্ড চালাও।
:::

Virtual environment activate হলে টার্মিনালের শুরুতে `(venv)` লেখা দেখা যাবে — এটাই নিশ্চিত করে যে তুমি সঠিক environment এ আছো।

---

## ধাপ ২: LangChain এর Core প্যাকেজ ইনস্টল করা

```bash
pip install langchain langchain-core
```

- `langchain` — উচ্চ-স্তরের chain, agent, retrieval logic
- `langchain-core` — মূল abstraction যেমন `Runnable`, prompt, message, output parser

এরপর যে provider ব্যবহার করবে তার জন্য আলাদা প্যাকেজ লাগবে — কারণ LangChain ইচ্ছাকৃতভাবে সব provider কে একসাথে bundle করে না, যাতে অপ্রয়োজনীয় dependency ইনস্টল না হয়।

### OpenAI ব্যবহার করলে

```bash
pip install langchain-openai
```

### Anthropic (Claude) ব্যবহার করলে

```bash
pip install langchain-anthropic
```

### Google Gemini ব্যবহার করলে

```bash
pip install langchain-google-genai
```

তুমি চাইলে একাধিক provider প্যাকেজ পাশাপাশি ইনস্টল করে রাখতে পারো — এতে পরে provider পরিবর্তন করা সহজ হয়ে যায়, কোড আবার নতুন করে লিখতে হয় না।

---

## ধাপ ৩: API Key সেটআপ করা

**API key কখনো সরাসরি কোডে হার্ডকোড করবে না।** এর বদলে environment variable ব্যবহার করতে হয়।

### `.env` ফাইল তৈরি করা

প্রজেক্টের root ফোল্ডারে `.env` নামে একটা ফাইল বানাও:

```bash
OPENAI_API_KEY=তোমার-আসল-key-এখানে-বসাও
ANTHROPIC_API_KEY=তোমার-আসল-key-এখানে-বসাও
GOOGLE_API_KEY=তোমার-আসল-key-এখানে-বসাও
```

### `.env` ফাইল Python এ লোড করা

```bash
pip install python-dotenv
```

```python
from dotenv import load_dotenv
load_dotenv()
```

এই দুই লাইন কোডের একদম শুরুতে রাখলে, `.env` ফাইলের সব variable automatic ভাবে environment এ লোড হয়ে যাবে, এবং LangChain নিজে থেকেই key গুলো খুঁজে নিতে পারবে।

::: danger গুরুত্বপূর্ণ
`.env` ফাইলটা তোমার `.gitignore` এ যোগ করে দাও এখনই। এটা ভুলে গেলে GitHub এ push করার সময় তোমার API key সবার সামনে চলে যাবে, যেটা অনেক বড় security সমস্যা।

`.gitignore` ফাইলে যোগ করো:
```
.env
```
:::

---

## ধাপ ৪: Setup যাচাই করা

সবকিছু ঠিকমতো কাজ করছে কিনা যাচাই করার জন্য এই ছোট script চালাও:

```python
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

model = ChatOpenAI(model="gpt-4o")
response = model.invoke("এক শব্দে হ্যালো বলো।")
print(response.content)
```

যদি error ছাড়া একটা response print হয়, তাহলে বুঝবে তোমার environment সঠিকভাবে সেটআপ হয়ে গেছে।

---

## Optional: প্রয়োজন অনুযায়ী পরে ইনস্টল করবে

সব প্যাকেজ একসাথে এখনই ইনস্টল করার দরকার নেই। নিচেরগুলো সেই সেই topic এ পৌঁছালে তখন ইনস্টল করলেই চলবে:

| প্যাকেজ | কখন লাগবে |
|---|---|
| `langchain-community` | Vector store, document loader, community tool ব্যবহার করার সময় |
| `langchain-chroma` / `langchain-pinecone` | নির্দিষ্ট vector database ব্যবহার করার সময় |
| `langgraph` | Agent workflow বানানোর সময় |
| `langsmith` | Chain এর debugging ও tracing করার সময় |
| `langserve` | Chain কে REST API হিসেবে deploy করার সময় |

---

## সাধারণ সমস্যা ও সমাধান (Common Setup Issues)

- **`ModuleNotFoundError`** — সম্ভবত `langchain` ইনস্টল করেছো কিন্তু provider-specific প্যাকেজ (যেমন `langchain-openai`) ইনস্টল করতে ভুলে গেছো।
- **`AuthenticationError`** — চেক করো `.env` ফাইল `load_dotenv()` দিয়ে model বানানোর *আগে* লোড হচ্ছে কিনা, এবং variable নাম ঠিক আছে কিনা (`OPENAI_API_KEY` — case-sensitive, বানানে সামান্য ভুল হলেও কাজ করবে না)।
- **Version conflict** — LangChain এর প্যাকেজ খুব দ্রুত আপডেট হয়। কোনো অপ্রত্যাশিত error পেলে এই কমান্ড দিয়ে সব আপডেট করে নাও:
  ```bash
  pip install --upgrade langchain langchain-core
  ```
- **PowerShell এ venv activate না হওয়া** — উপরে দেওয়া Execution Policy সমাধান ব্যবহার করো।

---

## সংক্ষেপে চেকলিস্ট

- [ ] Python 3.9+ ইনস্টল আছে
- [ ] Virtual environment তৈরি ও activate করা হয়েছে
- [ ] `langchain` ও `langchain-core` ইনস্টল করা হয়েছে
- [ ] প্রয়োজনীয় provider প্যাকেজ (openai/anthropic/google) ইনস্টল করা হয়েছে
- [ ] `.env` ফাইলে API key বসানো হয়েছে
- [ ] `.env` ফাইল `.gitignore` এ যোগ করা হয়েছে
- [ ] Verification script চালিয়ে response পাওয়া গেছে

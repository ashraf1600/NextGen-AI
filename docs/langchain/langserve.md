---
title: LangServe
---

# LangServe

এতদিন আমরা chain বানিয়েছি এবং সেটা Python script/notebook এ চালিয়ে দেখেছি। কিন্তু বাস্তব application এ, এই chain টাকে একটা web application, mobile app, বা অন্য কোনো সিস্টেম থেকে ব্যবহার করতে হয় — এর জন্য দরকার একটা **API**। **LangServe** এই কাজটাই সহজ করে দেয় — এটা যেকোনো LangChain chain কে কয়েক লাইনে একটা REST API হিসেবে deploy করে দেয়।

---

## LangServe কী সমস্যার সমাধান করে?

সাধারণত একটা chain কে API বানাতে হলে নিজেকে করতে হয়:
- একটা web framework (FastAPI/Flask) সেটআপ করা
- Request/response handling লেখা
- Streaming সাপোর্ট আলাদাভাবে implement করা
- Input validation লেখা

LangServe এই সবকিছু একসাথে, স্বয়ংক্রিয়ভাবে করে দেয় — একটা chain কে একটা function এ wrap করে দিলেই সেটা full-featured API হয়ে যায়।

```
নিজে থেকে API বানানো:                LangServe দিয়ে:

chain বানানো                          chain বানানো
   │                                      │
   ▼                                      ▼
FastAPI route লেখা                  add_routes(app, chain, path="/chat")
   │                                      │
   ▼                                      ▼
Request/response handling             ব্যস, API রেডি —
   │                                  streaming, input validation,
   ▼                                  playground UI — সব automatic
Streaming ম্যানুয়ালি implement
   │
   ▼
API রেডি (অনেক বেশি কোড লেগেছে)
```

---

## Setup ও ব্যবহার

```bash
pip install "langserve[all]"
```

### একটা Chain কে API বানানো

```python
from fastapi import FastAPI
from langserve import add_routes
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

app = FastAPI(title="আমার LangChain API")

prompt = ChatPromptTemplate.from_template("{topic} নিয়ে একটা লাইন লেখো।")
model = ChatOpenAI(model="gpt-4o")
parser = StrOutputParser()

chain = prompt | model | parser

add_routes(app, chain, path="/generate")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

এই সাধারণ কোডটুকু চালালেই তোমার chain টা একটা পূর্ণাঙ্গ, production-ready API হয়ে যায়।

---

## Automatic ভাবে যা যা পাওয়া যায়

`add_routes()` কল করার সাথে সাথে এই সবকিছু automatic ভাবে তৈরি হয়ে যায়:

| Endpoint | কাজ |
|---|---|
| `POST /generate/invoke` | সাধারণ single request/response |
| `POST /generate/stream` | Streaming response (token-by-token) |
| `POST /generate/batch` | একাধিক input একসাথে পাঠানো |
| `GET /generate/playground` | একটা built-in interactive UI, ব্রাউজারে সরাসরি টেস্ট করার জন্য |

### Client থেকে API কল করা

```python
from langserve import RemoteRunnable

remote_chain = RemoteRunnable("http://localhost:8000/generate")
result = remote_chain.invoke({"topic": "নদী"})
print(result)
```

`RemoteRunnable` দিয়ে remote API কে ঠিক local chain এর মতোই ব্যবহার করা যায় — `.invoke()`, `.stream()`, `.batch()` — সবকিছু কাজ করে, ঠিক যেমনটা local chain এ কাজ করত।

---

## Playground — বিল্ট-ইন Testing UI

LangServe স্বয়ংক্রিয়ভাবে `/generate/playground` নামে একটা ওয়েব ইন্টারফেস তৈরি করে দেয়, যেখানে ব্রাউজার থেকে সরাসরি chain টা টেস্ট করা যায় — কোনো আলাদা frontend বানানো ছাড়াই। এটা development এবং demo দেওয়ার জন্য খুবই সুবিধাজনক।

---

## কখন LangServe ব্যবহার করবে

- একটা chain কে **অন্য application/team** এর কাছে API হিসেবে expose করতে হলে
- দ্রুত একটা **working prototype/demo** বানাতে হলে, বিস্তারিত backend না লিখে
- Frontend (React, mobile app) থেকে সরাসরি LangChain logic ব্যবহার করতে হলে

::: tip
ছোট প্রজেক্ট বা প্রোটোটাইপে LangServe খুবই দ্রুত এবং সুবিধাজনক। তবে খুব বড়, জটিল production system এ (যেখানে authentication, rate limiting, custom middleware — এসবের প্রয়োজন) নিজের FastAPI/Django backend এর ভিতরে chain কে integrate করাও একটা common approach — LangServe সেক্ষেত্রে একটা ভালো starting point হিসেবে কাজ করতে পারে।
:::

---

## সংক্ষেপে

- LangServe যেকোনো LangChain chain কে কয়েক লাইন কোডে একটা **REST API** তে পরিণত করে
- `add_routes()` দিয়ে automatic ভাবে **invoke, stream, batch** endpoint এবং একটা **playground UI** তৈরি হয়ে যায়
- `RemoteRunnable` দিয়ে client সাইড থেকে remote chain কে local chain এর মতোই ব্যবহার করা যায়
- দ্রুত prototype/demo বানানো এবং chain কে API হিসেবে expose করার জন্য আদর্শ টুল

---
title: Structured Output
---

# Structured Output

সাধারণত LLM কে প্রশ্ন করলে সে একটা conversational, free-form text এ উত্তর দেয়। কিন্তু যখন সেই output আরেকটা সিস্টেম (database, API, automated workflow) এ ব্যবহার করতে হয়, তখন raw text যথেষ্ট না — আমাদের দরকার হয় **predictable, machine-readable format**। এই পেজে আমরা দেখব Structured Output কী, কেন দরকার, এবং LangChain দিয়ে কীভাবে implement করতে হয়।

---

## Structured Output কী?

সাধারণ (Unstructured) output মানে model স্বাভাবিক ভাষায় উত্তর দেয়:

```
প্রশ্ন: "একটা resume থেকে নাম আর অভিজ্ঞতা বের করো: রহিম, ৫ বছর অভিজ্ঞতা"
Model এর সাধারণ উত্তর: "নামটি হলো রহিম এবং তার ৫ বছরের অভিজ্ঞতা রয়েছে।"
```

এই উত্তর মানুষ পড়তে পারে, কিন্তু কোনো প্রোগ্রাম সরাসরি এটা parse করে ব্যবহার করতে পারবে না — কারণ format প্রতিবার একটু একটু ভিন্ন হতে পারে।

Structured Output মানে model কে বাধ্য করা একটা **নির্দিষ্ট, পূর্বনির্ধারিত schema** অনুযায়ী উত্তর দিতে:

```json
{
  "name": "রহিম",
  "experience_years": 5
}
```

এই output সরাসরি একটা প্রোগ্রামের variable এ বসিয়ে দেওয়া যায় — কোনো text parsing/guessing লাগে না।

---

## কেন Structured Output দরকার?

### ১. Data Extraction

Resume, invoice, email, ফর্ম — এই ধরনের document থেকে নির্দিষ্ট field (নাম, তারিখ, পরিমাণ) বের করে সরাসরি database এ সংরক্ষণ করতে হলে, output অবশ্যই একটা fixed structure এ আসতে হবে।

```python
# উদাহরণ: resume থেকে data বের করা
{
  "candidate_name": "রহিম উদ্দিন",
  "years_of_experience": 5,
  "skills": ["Python", "Django", "SQL"]
}
```

### ২. API তৈরি করা

মনে করো তুমি একটা sentiment analysis API বানাচ্ছো, যেটা product review থেকে sentiment বের করবে। API এর response সবসময় একই structure এ আসা দরকার, যাতে frontend সেটা reliably handle করতে পারে:

```json
{
  "sentiment": "positive",
  "confidence": 0.92
}
```

যদি model কখনো `"sentiment": "positive"` আবার কখনো `"এটা একটা ভালো রিভিউ"` — এভাবে ভিন্ন ভিন্ন format এ উত্তর দেয়, তাহলে API ভেঙে পড়বে।

### ৩. AI Agent এবং Tool ব্যবহার

Agent যখন calculator বা অন্য কোনো external tool call করে, তখন tool কে জানাতে হয় ঠিক কোন parameter দিয়ে call করতে হবে। এটাও এক ধরনের structured output — model কে বলতে হয় ঠিক কোন function, কী argument দিয়ে call করা দরকার, এবং এটা একটা নির্দিষ্ট JSON structure এ আসতে হয় যাতে code সেটা execute করতে পারে।

---

## Structured Output পাওয়ার উপায়

LangChain এ মূলত তিনটা পদ্ধতিতে schema define করা যায়, এবং একটা function দিয়ে সেটা model এ apply করা হয়।

### `with_structured_output` — মূল টুল

এটাই মূল method যেটা দিয়ে যেকোনো schema (TypedDict, Pydantic, বা JSON Schema) কে model এর সাথে যুক্ত করে দেওয়া হয়, যাতে model বাধ্য হয়ে সেই format এ উত্তর দেয়।

```python
structured_model = model.with_structured_output(SchemaClass)
result = structured_model.invoke("তোমার ইনপুট এখানে")
```

এই একই pattern তিনটা পদ্ধতির জন্যই কাজ করে — শুধু `SchemaClass` এর জায়গায় ভিন্ন ভিন্ন জিনিস বসবে।

---

## পদ্ধতি ১: TypedDict

`TypedDict` হলো Python এর built-in সবচেয়ে সহজ পদ্ধতি — শুধু key-value pair এর structure বলে দেওয়া, কোনো runtime validation ছাড়াই।

```python
from typing import TypedDict, Annotated
from langchain_openai import ChatOpenAI

class ReviewAnalysis(TypedDict):
    sentiment: Annotated[str, "রিভিউটা positive, negative, নাকি neutral"]
    summary: Annotated[str, "রিভিউর সংক্ষিপ্ত সারাংশ"]

model = ChatOpenAI(model="gpt-4o")
structured_model = model.with_structured_output(ReviewAnalysis)

result = structured_model.invoke("প্রোডাক্টটা খুবই ভালো, কিন্তু ডেলিভারি দেরি হয়েছিল।")
print(result)
# {'sentiment': 'neutral', 'summary': 'প্রোডাক্ট ভালো তবে ডেলিভারি দেরি'}
```

### TypedDict এর সীমাবদ্ধতা

- এটা শুধু **type hint** — কোনো runtime এ actual validation করে না
- যদি model ভুল type এর data দেয় (যেমন `sentiment` এর জায়গায় সংখ্যা), TypedDict নিজে থেকে সেটা ধরতে পারবে না
- ছোট, দ্রুত prototype বানানোর জন্য উপযুক্ত, কিন্তু production এ risky

---

## পদ্ধতি ২: Pydantic (সবচেয়ে recommended)

Pydantic হলো data validation এর জন্য Python এর সবচেয়ে জনপ্রিয় library, এবং এটাই structured output এর জন্য **recommended standard**, কারণ এটা শুধু structure বলে না, বরং প্রতিটা field এর type ও constraint সত্যিকারের validate করে।

```python
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI

class ReviewAnalysis(BaseModel):
    sentiment: str = Field(description="রিভিউটা positive, negative, নাকি neutral")
    confidence: float = Field(description="০ থেকে ১ এর মধ্যে confidence score", ge=0, le=1)
    summary: str = Field(description="রিভিউর সংক্ষিপ্ত সারাংশ")

model = ChatOpenAI(model="gpt-4o")
structured_model = model.with_structured_output(ReviewAnalysis)

result = structured_model.invoke("প্রোডাক্টটা খুবই ভালো, কিন্তু ডেলিভারি দেরি হয়েছিল।")
print(result)
# ReviewAnalysis(sentiment='neutral', confidence=0.75, summary='প্রোডাক্ট ভালো তবে ডেলিভারি দেরি')

print(result.sentiment)  # সরাসরি attribute হিসেবে access করা যায়
```

### Pydantic কেন ভালো

- **Type validation** — `confidence` যদি float না হয়ে string আসে, Pydantic automatic error দেয়
- **Constraint সাপোর্ট** — যেমন `ge=0, le=1` দিয়ে বলা যায় মান অবশ্যই ০ আর ১ এর মধ্যে হতে হবে
- **`Field(description=...)`** ব্যবহার করে প্রতিটা field এর জন্য আলাদা নির্দেশনা দেওয়া যায়, যেটা model কে সঠিক মান বসাতে সাহায্য করে
- Nested structure (একটার ভিতরে আরেকটা model) সাপোর্ট করে — জটিল data structure এর জন্য উপযুক্ত

### Nested Pydantic উদাহরণ

```python
from typing import List

class Skill(BaseModel):
    name: str
    years: int

class Candidate(BaseModel):
    name: str = Field(description="প্রার্থীর নাম")
    skills: List[Skill] = Field(description="প্রার্থীর দক্ষতার তালিকা")

structured_model = model.with_structured_output(Candidate)
result = structured_model.invoke(
    "রহিম উদ্দিন — Python এ ৩ বছর, Django তে ২ বছর অভিজ্ঞতা।"
)
```

---

## পদ্ধতি ৩: JSON Schema

যখন তোমার schema শুধু Python এ না রেখে অন্য ভাষা/সিস্টেমের সাথে share করতে হবে (cross-language compatibility), তখন raw JSON Schema ব্যবহার করা যায়।

```python
json_schema = {
    "title": "ReviewAnalysis",
    "type": "object",
    "properties": {
        "sentiment": {"type": "string", "description": "positive, negative, বা neutral"},
        "confidence": {"type": "number", "description": "০ থেকে ১ এর মধ্যে"}
    },
    "required": ["sentiment", "confidence"]
}

structured_model = model.with_structured_output(json_schema)
result = structured_model.invoke("প্রোডাক্টটা চমৎকার!")
```

---

## কখন কোনটা ব্যবহার করবে

| পদ্ধতি | কখন ব্যবহার করবে |
|---|---|
| **TypedDict** | দ্রুত prototype, ছোট experiment — validation জরুরি না |
| **Pydantic** | Production application — সবচেয়ে বেশি সুপারিশকৃত, robust validation দরকার হলে |
| **JSON Schema** | Python এর বাইরের সিস্টেমের সাথে schema share করতে হলে, বা cross-language project এ |

---

## গুরুত্বপূর্ণ বিষয়গুলো

### JSON Mode vs Function Calling

Structured output পাওয়ার পেছনে LLM provider সাধারণত দুইটা মেকানিজম ব্যবহার করে:

- **JSON Mode** — model কে সাধারণভাবে বলা হয় "শুধু valid JSON রিটার্ন করো," সাধারণ data extraction এর জন্য ব্যবহার হয়
- **Function Calling** — মূলত AI agent এর tool ব্যবহারের জন্য ডিজাইন করা, যেখানে model কে বলা হয় ঠিক কোন function কল করতে হবে, কোন argument দিয়ে

::: warning
সব LLM provider সমানভাবে দুইটা মেকানিজমই সাপোর্ট করে না — কোন provider কোনটা কীভাবে সাপোর্ট করে সেটা model অনুযায়ী ভিন্ন হতে পারে। কোনো নতুন provider ব্যবহার করার আগে তাদের documentation চেক করে নেওয়া ভালো, `with_structured_output` internally কোন মেকানিজম ব্যবহার করছে সেটা provider ভেদে automatic ঠিক হয়ে যায়।
:::

### সংক্ষেপে মনে রাখার মতো পয়েন্ট

- Structured output মানুষের জন্য নয়, **মেশিনের সাথে communication** এর জন্য
- Data extraction, API response, এবং agent tool-calling — এই তিন জায়গায় এটা প্রায় অপরিহার্য
- Production এ সবসময় **Pydantic** কে default choice হিসেবে ধরে নেওয়া ভালো, যদি না বিশেষ কোনো কারণে TypedDict বা JSON Schema লাগে
- `with_structured_output()` — এই একটা function দিয়েই তিন ধরনের schema-ই apply করা যায়, model কে বাধ্য করে নির্দিষ্ট format এ উত্তর দিতে

---

## সংক্ষেপে

- **Unstructured output** মানুষের পড়ার জন্য উপযুক্ত, কিন্তু সিস্টেমে সরাসরি ব্যবহারযোগ্য না
- **Structured output** predictable, parseable format দেয় — যেমন JSON
- তিনটা মূল পদ্ধতি: **TypedDict** (সহজ, validation নেই), **Pydantic** (recommended, robust), **JSON Schema** (cross-language)
- **`with_structured_output()`** — LangChain এর মূল টুল যেটা দিয়ে যেকোনো schema model এর সাথে যুক্ত করা হয়
- **JSON Mode vs Function Calling** — দুটো ভিন্ন মেকানিজম, provider অনুযায়ী compatibility ভিন্ন হতে পারে

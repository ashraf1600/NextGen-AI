---
title: Projects
---

# Projects — হাতে-কলমে শেখা

এতদিন আমরা LangChain এর প্রতিটা component আলাদা আলাদাভাবে শিখেছি — Models, Prompts, Chains, Indexes, Memory, Agents, এবং সহায়ক টুল যেমন Callbacks, LangSmith, LangServe। এই পেজে আমরা সেই জ্ঞান একত্র করে কয়েকটা সম্পূর্ণ, বাস্তব প্রজেক্ট বানানোর দিকনির্দেশনা দেখব — যাতে প্রতিটা টুকরো জ্ঞান একসাথে কীভাবে কাজ করে সেটা প্রত্যক্ষভাবে অনুশীলন করা যায়।

---

## প্রজেক্ট ১: PDF-ভিত্তিক RAG চ্যাটবট

**লক্ষ্য:** নিজের PDF document আপলোড করে, সেটার উপর প্রশ্ন করা যাবে এমন একটা chatbot বানানো।

### কোন কোন Component লাগবে

| Component | ব্যবহার |
|---|---|
| Document Loader (`PyPDFLoader`) | PDF থেকে content আনা |
| Text Splitter (`RecursiveCharacterTextSplitter`) | Content কে chunk এ ভাগ করা |
| Embedding + VectorStore (`Chroma`) | Chunk সংরক্ষণ করা |
| Retriever | প্রশ্নের সাথে relevant chunk খোঁজা |
| Memory (`ChatMessageHistory`) | Multi-turn কথোপকথন মনে রাখা |
| LangServe | API হিসেবে deploy করা |

### বাস্তবায়নের ধাপ

1. `PyPDFLoader` দিয়ে PDF লোড করো
2. `RecursiveCharacterTextSplitter` দিয়ে chunk এ ভাগ করো (`chunk_size=500`, `chunk_overlap=50`)
3. `Chroma` তে embed করে সংরক্ষণ করো
4. `RunnableWithMessageHistory` দিয়ে retriever + prompt + model কে chain করো, যাতে আগের প্রশ্নের প্রসঙ্গ মনে থাকে
5. `LangServe` দিয়ে `/chat` endpoint হিসেবে deploy করো

::: tip
এই প্রজেক্টটা এই ডকুমেন্টেশনের **RAG** পেজে যে সম্পূর্ণ কোড দেওয়া আছে, তার উপর ভিত্তি করেই বানানো যায় — শুধু Memory যুক্ত করে multi-turn করে নিলেই হবে।
:::

---

## প্রজেক্ট ২: Tool-Calling Weather + Search Agent

**লক্ষ্য:** এমন একটা agent বানানো যেটা প্রয়োজন অনুযায়ী ওয়েব সার্চ করবে অথবা আবহাওয়ার তথ্য নিয়ে আসবে, এবং দুটো তথ্য একসাথে মিলিয়ে বুদ্ধিদীপ্ত উত্তর দেবে।

### কোন কোন Component লাগবে

| Component | ব্যবহার |
|---|---|
| Custom Tool (`@tool`) | Weather API কল করা |
| Built-in Tool (`DuckDuckGoSearchRun`) | সাধারণ প্রশ্নের জন্য ওয়েব সার্চ |
| ReAct Agent + AgentExecutor | Reasoning loop চালানো |
| Callbacks | প্রতিটা ধাপ log করা |

### বাস্তবায়নের ধাপ

1. `get_weather` কাস্টম টুল বানাও (Weather API ব্যবহার করে)
2. `DuckDuckGoSearchRun` টুল যোগ করো
3. `create_react_agent` দিয়ে agent বানাও, দুটো টুল-ই দাও
4. `AgentExecutor` এ `max_iterations=5` সেট করো
5. একটা custom `BaseCallbackHandler` যোগ করো, যাতে প্রতিটা Thought/Action log হয়

**উদাহরণ প্রশ্ন:** *"ঢাকার আজকের আবহাওয়া কেমন, এবং এই আবহাওয়ায় ঢাকায় ঘোরার জন্য কোন জায়গা ভালো হবে?"* — এতে agent কে দুটো ভিন্ন Tool ব্যবহার করে তথ্য একত্র করতে হবে।

---

## প্রজেক্ট ৩: LangServe দিয়ে Deploy করা Multi-Chain API

**লক্ষ্য:** একাধিক ভিন্ন ভিন্ন chain (যেমন — summarizer, translator, sentiment analyzer) কে একটাই API এর ভিতরে আলাদা endpoint হিসেবে deploy করা।

### কোন কোন Component লাগবে

| Component | ব্যবহার |
|---|---|
| Sequential Chain | Summarizer (রিপোর্ট → সারাংশ) |
| Parallel Chain | একইসাথে অনুবাদ + sentiment analysis |
| Structured Output (Pydantic) | Sentiment কে JSON আকারে রিটার্ন করা |
| LangServe | তিনটা আলাদা endpoint এ deploy করা |
| LangSmith | Production এ প্রতিটা call monitor করা |

### বাস্তবায়নের ধাপ

```python
from fastapi import FastAPI
from langserve import add_routes

app = FastAPI()

add_routes(app, summarizer_chain, path="/summarize")
add_routes(app, translator_chain, path="/translate")
add_routes(app, sentiment_chain, path="/sentiment")
```

এভাবে একটাই FastAPI app এর ভিতরে একাধিক chain কে আলাদা আলাদা route হিসেবে serve করা যায় — বাস্তব production system এ এভাবেই একাধিক feature একসাথে deploy করা হয়।

---

## প্রজেক্টগুলো করার সুপারিশকৃত ক্রম

```
১. PDF RAG চ্যাটবট       ← Indexes, Retriever, Memory অনুশীলনের জন্য
        │
        ▼
২. Tool-Calling Agent      ← Tools, Agent, ReAct অনুশীলনের জন্য
        │
        ▼
৩. Multi-Chain API          ← Chains, Structured Output, LangServe, LangSmith
                                সব একসাথে ব্যবহার করার জন্য
```

প্রতিটা প্রজেক্ট আগেরটার উপর ভিত্তি করে জটিলতা বাড়ায় — প্রথমটা শুধু RAG, দ্বিতীয়টা Agent যোগ করে, তৃতীয়টা পুরো production pipeline (multiple chains + deployment + monitoring) একসাথে অনুশীলন করায়।

---

## সংক্ষেপে

- **প্রজেক্ট ১ (RAG Chatbot)** — Document Loader, Text Splitter, VectorStore, Retriever, Memory একসাথে ব্যবহার
- **প্রজেক্ট ২ (Tool-Calling Agent)** — Custom Tool, Built-in Tool, ReAct Agent, Callback একসাথে ব্যবহার
- **প্রজেক্ট ৩ (Multi-Chain API)** — একাধিক chain type, Structured Output, LangServe deployment, LangSmith monitoring
- এই তিনটা প্রজেক্ট সম্পন্ন করলে LangChain এর প্রায় প্রতিটা core concept হাতে-কলমে অনুশীলন করা হয়ে যাবে

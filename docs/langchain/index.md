---
title: Introduction
---
# LangChain কী এবং কেন প্রয়োজন

## ভূমিকা (Intro)

LLM (Large Language Model) যেমন GPT, Claude, Gemini — এগুলো দিয়ে সরাসরি API call করে একটা chatbot বানানো তুলনামূলক সহজ। কিন্তু বাস্তব দুনিয়ার production-grade AI application বানাতে গেলে শুধু একটা API call যথেষ্ট না। দরকার হয়:

- আলাদা আলাদা data source থেকে তথ্য টেনে আনা
- Conversation history মনে রাখা
- External tool/API call করানো
- একাধিক ধাপে (multi-step) কাজ করানো

এই পুরো ecosystem-টাকে organize করার জন্যই **LangChain** এর জন্ম। এই ডকুমেন্টেশনে আমরা ধাপে ধাপে দেখব — LangChain আসলে কী, কেন দরকার, একটা app কীভাবে কাজ করে ভিতরে ভিতরে, এর সুবিধা কী, কী কী বানানো যায়, আর বাজারে এর বিকল্প কী কী আছে।

---

## What is LangChain? — LangChain কী?

**LangChain একটা framework**, যেটা LLM-ভিত্তিক application বানানোর কাজটা সহজ করে দেয়। এটা নিজে কোনো LLM না — বরং LLM-কে ঘিরে থাকা সবকিছু (prompt, memory, tool, data retrieval) organize করার জন্য একটা layer।

সহজ ভাষায় বললে — তুমি যদি সরাসরি OpenAI/Anthropic এর SDK ব্যবহার করো, তাহলে প্রতিটা ছোট কাজ (prompt বানানো, output parse করা, memory রাখা) তোমাকে নিজে code লিখে করতে হবে। LangChain এই কাজগুলোর জন্য আগে থেকেই তৈরি, reusable building block দেয়।

### সরাসরি API call (LangChain ছাড়া)

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "বাংলাদেশের রাজধানী কী?"}]
)

print(response.choices[0].message.content)
```

এটা কাজ করবে, কিন্তু এখানে প্রতিটা জিনিস — prompt formatting, message history রাখা, output structure করা — সব manually করতে হচ্ছে।

### একই কাজ LangChain দিয়ে

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_template("{question}")
model = ChatOpenAI(model="gpt-4o")
parser = StrOutputParser()

chain = prompt | model | parser

result = chain.invoke({"question": "বাংলাদেশের রাজধানী কী?"})
print(result)
```

এখানে `prompt`, `model`, `parser` — প্রতিটা আলাদা, reusable component। পরে RAG, memory, বা tool যোগ করতে হলে শুধু নতুন component চেইনে জুড়ে দিলেই হবে — পুরো logic নতুন করে লিখতে হবে না।

---

## Why do we need LangChain? — কেন LangChain দরকার?

সরাসরি API call দিয়ে ছোট প্রজেক্ট চলে যায়, কিন্তু বাস্তব application এ নিচের সমস্যাগুলো আসে:

### সমস্যা ১: নিজের ডেটার সাথে কথা বলানো (RAG)

LLM শুধু তার training data জানে। তোমার company-র internal document, PDF, বা database নিয়ে প্রশ্ন করলে LLM জানবে না। এর জন্য দরকার:

- Document লোড করা
- ছোট ছোট অংশে ভাগ করা (chunking)
- Vector store এ embed করে রাখা
- প্রশ্ন এলে relevant অংশ খুঁজে বের করে LLM কে context হিসেবে দেওয়া

```python
# LangChain ছাড়া এই পুরো pipeline নিজে লিখতে হবে:
# document loading → chunking → embedding → vector search → prompt injection
# প্রতিটা ধাপে বাগ হওয়ার সম্ভাবনা, আর কোড অনেক লম্বা হয়ে যাবে
```

LangChain এ এই পুরো pipeline pre-built abstraction দিয়ে করা যায় (Retriever, Vector Store — এগুলো নিয়ে পরের chapter এ বিস্তারিত থাকবে)।

### সমস্যা ২: Memory না থাকা

প্রতিটা API call independent — আগের conversation মনে থাকে না। নিজে থেকে message history পাঠাতে হয়, আর সেটা manage করা জটিল হয়ে যায় conversation বড় হলে।

### সমস্যা ৩: Tool ব্যবহার করানো

LLM নিজে ইন্টারনেট থেকে data আনতে পারে না, calculator চালাতে পারে না। একে বাইরের tool এর সাথে যুক্ত করে দিতে হয় — এবং কোন tool কখন call হবে, তার output আবার LLM কে ফেরত দেওয়া — এই লজিক নিজে লেখা কষ্টসাধ্য।

### সমস্যা ৪: Provider পরিবর্তন করা কঠিন

আজ OpenAI ব্যবহার করছো, কাল হয়তো Anthropic এ যেতে চাও — সরাসরি SDK ব্যবহার করলে পুরো integration কোড নতুন করে লিখতে হয়। LangChain এ শুধু একটা লাইন বদলালেই হয়।

**সংক্ষেপে — LangChain দরকার কারণ এটা এই সব repeated সমস্যার জন্য standard, reusable সমাধান দেয়, ফলে তুমি বারবার একই চাকা নতুন করে বানাও না।**

---

## High Level Discussion of App — একটা App কীভাবে কাজ করে

একটা সাধারণ LangChain-ভিত্তিক application এর ভিতরে সাধারণত এই ধাপগুলো থাকে:

```
User Input
   ↓
Prompt Template (প্রশ্নটা format করা হয়)
   ↓
[যদি দরকার হয়] Retriever → নিজের ডেটা থেকে relevant তথ্য খোঁজা
   ↓
Chat Model → LLM কে পাঠানো
   ↓
[যদি দরকার হয়] Tool Calling → বাইরের API/function চালানো
   ↓
Output Parser → response কে structured format এ আনা
   ↓
Final Response → ইউজারকে দেখানো
```

### উদাহরণ: একটা সহজ RAG chatbot এর flow

```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# ১. Vector store থেকে retriever বানানো (ধরে নিচ্ছি ডেটা আগে থেকেই embed করা আছে)
vectorstore = Chroma(persist_directory="./db", embedding_function=OpenAIEmbeddings())
retriever = vectorstore.as_retriever()

# ২. Prompt বানানো
prompt = ChatPromptTemplate.from_template(
    "নিচের context ব্যবহার করে প্রশ্নের উত্তর দাও:\n\n{context}\n\nপ্রশ্ন: {question}"
)

# ৩. Model ও Parser
model = ChatOpenAI(model="gpt-4o")
parser = StrOutputParser()

# ৪. পুরো chain একসাথে জোড়া
rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | parser
)

answer = rag_chain.invoke("আমাদের কোম্পানির ছুটির নীতি কী?")
print(answer)
```

এই একটা ছোট example এ দেখা যাচ্ছে — retrieval, prompt, model, parser — সবকিছু একসাথে chain হয়ে কাজ করছে, প্রতিটা অংশ আলাদাভাবে test/replace করা যায়।

---

## Benefits of LangChain — সুবিধাসমূহ

| সুবিধা                                | ব্যাখ্যা                                                                             |
| ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Reusable Components**               | Prompt, retriever, parser — সব আলাদা, বারবার ব্যবহারযোগ্য          |
| **Provider-Agnostic**                 | OpenAI থেকে Anthropic এ যেতে এক লাইন বদলালেই হয়                    |
| **Built-in Streaming/Batching/Async** | `Runnable` interface এর কারণে সব chain এ ফ্রি পাওয়া যায়          |
| **RAG Pipeline Ready-Made**           | Document loader, splitter, vector store integration আগে থেকেই আছে                 |
| **Agent ও Tool Calling Support**     | Tool কল করার জটিল logic নিজে লিখতে হয় না                            |
| **বড় Community ও Ecosystem**     | প্রায় সব vector database, LLM provider, tool এর জন্য ready integration আছে |
| **Debugging Support (LangSmith)**     | Chain এর প্রতিটা ধাপ trace করে দেখা যায় কোথায় সমস্যা    |

---

## What can you build with LangChain? — কী কী বানানো যায়

- **RAG-ভিত্তিক Chatbot** — নিজের document/PDF/database নিয়ে প্রশ্ন-উত্তর করা সিস্টেম
- **Customer Support Agent** — যেটা ticket দেখে, FAQ থেকে উত্তর খোঁজে, প্রয়োজনে human কে escalate করে
- **Code Assistant** — repository পড়ে প্রশ্নের উত্তর দেয়, code generate করে
- **Data Analysis Agent** — natural language প্রশ্ন থেকে SQL/pandas query বানিয়ে চালায়
- **Multi-Agent Research Tool** — একাধিক agent একসাথে কাজ করে তথ্য খুঁজে, যাচাই করে, রিপোর্ট বানায়
- **Content Generation Pipeline** — টপিক দিলে research → outline → draft — ধাপে ধাপে content বানানো
- **Voice/Chat Assistant Integration** — যেকোনো app এর সাথে conversational AI যুক্ত করা

---

## Alternatives to LangChain — বিকল্পসমূহ

LangChain-ই একমাত্র option না। প্রজেক্টের ধরন অনুযায়ী নিচের বিকল্পগুলোও বিবেচনা করা যায়:

| Framework                                     | কোথায় ভালো                                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **LlamaIndex**                          | RAG-কেন্দ্রিক application এ বেশি optimized, data indexing এ শক্তিশালী          |
| **LangGraph**                           | জটিল, cyclic multi-agent workflow — যেখানে agent বারবার একে অপরকে call করে |
| **Haystack**                            | Enterprise-grade search ও RAG pipeline এর জন্য জনপ্রিয়                                 |
| **Semantic Kernel (Microsoft)**         | .NET/C# ecosystem এ কাজ করলে ভালো fit                                                      |
| **সরাসরি SDK (OpenAI/Anthropic)** | খুব ছোট, single-call application এ framework এর overhead লাগবে না                      |
| **CrewAI / AutoGen**                    | Role-based multi-agent system দ্রুত বানানোর জন্য                                       |

::: tip কোনটা বেছে নেবে?

- ছোট, single-purpose app → সরাসরি SDK
- RAG-heavy application → LlamaIndex অথবা LangChain
- জটিল multi-agent workflow → LangGraph
- দ্রুত prototype বানাতে চাইলে → LangChain (কারণ ecosystem সবচেয়ে বড়, resource/tutorial বেশি পাওয়া যায়)
  :::

---


---

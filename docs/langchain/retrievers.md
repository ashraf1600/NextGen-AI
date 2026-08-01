---
title: Retrievers
---

# Retrievers

Vector Store এ আমরা chunk গুলো embedding আকারে সংরক্ষণ করেছি। এখন user যখন প্রশ্ন করবে, তখন সেই প্রশ্নের সাথে সবচেয়ে relevant chunk খুঁজে বের করে আনার কাজটা করে **Retriever**। এটাই RAG pipeline এর শেষ ধাপ, যেটা সরাসরি user এর প্রশ্নের সাথে যুক্ত হয়ে কাজ করে।

---

## Retriever কী?

Retriever হলো এমন একটা function/component, যেটা user এর query নেয় এবং data source থেকে সবচেয়ে relevant document ফিরিয়ে আনে। এটাকে একধরনের **বিশেষায়িত সার্চ ইঞ্জিন** হিসেবে ভাবা যায়, যেটা user এর প্রশ্ন এবং data source এর মাঝখানে interface হিসেবে কাজ করে।

```
User Query
    │
    ▼
[ Retriever ]  ← ব্রিজ/সার্চ-ইঞ্জিন হিসেবে কাজ করে
    │
    ▼
Data Source (Vector Store, Wikipedia, ইত্যাদি)
    │
    ▼
সবচেয়ে relevant Document(s)
```

---

## Retriever এর শ্রেণীবিভাগ

Retriever কে দুইভাবে ভাগ করা যায়:

| শ্রেণীবিভাগ | ভিত্তি | উদাহরণ |
|---|---|---|
| **Data Source অনুযায়ী** | কোথা থেকে ডেটা আনা হচ্ছে | Wikipedia Retriever, Vector Store Retriever |
| **Search Strategy অনুযায়ী** | কীভাবে relevant ডেটা খোঁজা হচ্ছে | MMR, Multi-Query, Contextual Compression |

এই পেজে আমরা দুই ধরনের উদাহরণই দেখব।

---

## ১. Wikipedia Retriever

সরাসরি Wikipedia থেকে article খুঁজে বের করে আনে, মূলত keyword matching ব্যবহার করে। এটা কোনো নিজের vector store সেটআপ ছাড়াই দ্রুত বাইরের জ্ঞানভান্ডার থেকে তথ্য আনার জন্য উপযোগী।

```python
from langchain_community.retrievers import WikipediaRetriever

retriever = WikipediaRetriever(lang="bn", top_k_results=2)

documents = retriever.invoke("বাংলাদেশের মুক্তিযুদ্ধ")

for doc in documents:
    print(doc.page_content[:200])
    print(doc.metadata)
```

- `lang="bn"` — বাংলা ভাষার Wikipedia থেকে খোঁজে
- `top_k_results` — সর্বোচ্চ কয়টা article রিটার্ন করবে

---

## ২. Vector Store Retriever

আগের পেজে আমরা যে Vector Store বানিয়েছি, সেটাকেই সরাসরি একটা Retriever হিসেবে ব্যবহার করা যায় — এটাই RAG pipeline এ সবচেয়ে বেশি ব্যবহৃত পদ্ধতি। এটা semantic search ব্যবহার করে সবচেয়ে relevant document embedding খুঁজে বের করে।

```python
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma(persist_directory="./chroma_db", embedding_function=embedding_model)

retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

documents = retriever.invoke("বাংলাদেশের রাজধানী কোথায়?")
```

`.as_retriever()` মেথড যেকোনো VectorStore কে একটা standard `Retriever` interface এ রূপান্তর করে দেয় — এরপর এটাকে সরাসরি LCEL chain এ (`|` দিয়ে) ব্যবহার করা যায়, ঠিক যেমন আমরা RAG chain এর উদাহরণে আগে দেখেছি।

---

## ৩. Maximum Marginal Relevance (MMR)

সমস্যা: শুধু pure similarity search করলে অনেক সময় একই ধরনের, একে অপরের পুনরাবৃত্তি (redundant) এমন কয়েকটা chunk চলে আসে — যেগুলো সবই প্রায় একই তথ্য বলছে।

**MMR** এই সমস্যা সমাধান করে — এটা relevance এবং diversity এর মধ্যে ভারসাম্য বজায় রাখে, যাতে ফলাফলে একই তথ্যের পুনরাবৃত্তি কম হয় এবং বিভিন্ন দিক থেকে relevant তথ্য পাওয়া যায়।

```
Pure Similarity Search:
[Chunk A: বাংলাদেশের রাজধানী ঢাকা]
[Chunk B: ঢাকা বাংলাদেশের রাজধানী শহর]     ← প্রায় একই তথ্য (redundant)
[Chunk C: ঢাকা দেশের রাজধানী হিসেবে পরিচিত] ← আবারও একই তথ্য

MMR সহ Search:
[Chunk A: বাংলাদেশের রাজধানী ঢাকা]
[Chunk D: ঢাকার জনসংখ্যা প্রায় ২ কোটি]      ← ভিন্ন কিন্তু সম্পর্কিত তথ্য
[Chunk E: ঢাকা বাংলাদেশের প্রধান বাণিজ্যিক কেন্দ্র]  ← আবারও ভিন্ন দিক
```

```python
retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 3, "fetch_k": 10, "lambda_mult": 0.5}
)
```

- `fetch_k` — প্রথমে কতগুলো candidate document আনবে (এরপর তার মধ্য থেকে diversity বিবেচনা করে সেরা `k` টা বাছাই করবে)
- `lambda_mult` — relevance এবং diversity এর মধ্যে ভারসাম্য নিয়ন্ত্রণ করে (১ এর কাছাকাছি মানে শুধু relevance এর উপর জোর, ০ এর কাছাকাছি মানে diversity এর উপর বেশি জোর)

---

## ৪. Multi-Query Retriever

সমস্যা: User এর প্রশ্নের ভাষা অনেক সময় অস্পষ্ট (ambiguous) বা এমনভাবে লেখা যা vector search এ সরাসরি ভালো ফলাফল নাও আনতে পারে।

**Multi-Query Retriever** এই সমস্যার সমাধান করে — এটা একটা LLM ব্যবহার করে user এর মূল প্রশ্নকে কয়েকটা ভিন্ন ভিন্ন ভাবে rephrase করে, তারপর প্রতিটা ভার্সন দিয়ে আলাদাভাবে search চালিয়ে ফলাফল একত্র করে।

```
মূল প্রশ্ন: "কীভাবে মেশিন লার্নিং শিখব?"

LLM দিয়ে generate হওয়া ভিন্ন ভিন্ন ভার্সন:
1. "মেশিন লার্নিং শেখার সহজ উপায় কী?"
2. "একজন beginner হিসেবে ML শেখার রোডম্যাপ কী হওয়া উচিত?"
3. "মেশিন লার্নিং এর জন্য কী কী দক্ষতা প্রয়োজন?"

প্রতিটা ভার্সন দিয়ে আলাদা search → সব ফলাফল একত্র করে দেওয়া হয়
```

```python
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o")

multi_query_retriever = MultiQueryRetriever.from_llm(
    retriever=vectorstore.as_retriever(),
    llm=llm
)

documents = multi_query_retriever.invoke("কীভাবে মেশিন লার্নিং শিখব?")
```

এটা বিশেষভাবে কাজে লাগে যখন একই প্রশ্ন ভিন্ন ভিন্ন শব্দে জিজ্ঞাসা করা হলে ভিন্ন ভিন্ন relevant chunk খুঁজে পাওয়ার সম্ভাবনা থাকে — একটা মাত্র query দিয়ে সেসব miss হয়ে যেতে পারত।

---

## ৫. Contextual Compression Retriever

সমস্যা: Retrieve করা document অনেক সময় দীর্ঘ, এবং তার মধ্যে শুধু ছোট একটা অংশ user এর প্রশ্নের সাথে সরাসরি প্রাসঙ্গিক — বাকি অংশ অপ্রয়োজনীয় "noise" হিসেবে থেকে যায়, যেটা LLM এর context window অহেতুক ভরে ফেলে।

**Contextual Compression Retriever** পুরো document retrieve করার পর, সেখান থেকে শুধু query এর সাথে সরাসরি প্রাসঙ্গিক অংশটুকু বের করে রাখে, বাকিটা ফেলে দেয়।

```
সাধারণ Retrieval:
[পুরো ৫০০ শব্দের Document — যার মধ্যে মাত্র ২০ শব্দ প্রশ্নের সাথে relevant]

Contextual Compression এর পর:
[শুধু সেই ২০ শব্দের প্রাসঙ্গিক অংশ]
```

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o")
compressor = LLMChainExtractor.from_llm(llm)

compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=vectorstore.as_retriever()
)

documents = compression_retriever.invoke("বাংলাদেশের রাজধানীর জনসংখ্যা কত?")
```

এটা LLM ব্যবহার করে প্রতিটা retrieved document কে "পড়ে" এবং শুধু প্রশ্নের সাথে সরাসরি সম্পর্কিত অংশটুকু বের করে আনে — ফলে পরের ধাপে (final answer generation) LLM কে কম, কিন্তু বেশি focused context দেওয়া যায়।

---

## Retriever গুলোর তুলনা

| Retriever | সমাধান করে | কখন ব্যবহার করবে |
|---|---|---|
| **Wikipedia Retriever** | বাইরের সাধারণ জ্ঞানভান্ডার থেকে তথ্য | নিজের vector store ছাড়াই দ্রুত general knowledge দরকার হলে |
| **Vector Store Retriever** | Semantic search | সবচেয়ে সাধারণ ও মৌলিক RAG ব্যবহারের ক্ষেত্রে |
| **MMR** | Redundant/পুনরাবৃত্তিমূলক ফলাফল | বৈচিত্র্যময় (diverse) তথ্য দরকার হলে, শুধু একই কথা বারবার না চাইলে |
| **Multi-Query** | অস্পষ্ট/ভিন্নভাবে লেখা প্রশ্ন | User এর প্রশ্নের ভাষা বৈচিত্র্যময় বা অস্পষ্ট হলে |
| **Contextual Compression** | অপ্রয়োজনীয় তথ্য (noise) | Retrieved document বড় হলে, শুধু প্রাসঙ্গিক অংশ দরকার হলে |

---

## সঠিক Retriever বেছে নেওয়া কেন গুরুত্বপূর্ণ

RAG application এর সামগ্রিক accuracy এবং performance অনেকখানি নির্ভর করে সঠিক Retriever বেছে নেওয়ার উপর। শুধু basic Vector Store Retriever দিয়ে অনেক ক্ষেত্রে ভালো ফলাফল পাওয়া যায়, কিন্তু যখন redundancy, query ambiguity, বা প্রাসঙ্গিকতার সমস্যা দেখা দেয়, তখন উপরের advanced retriever গুলো (MMR, Multi-Query, Contextual Compression) ব্যবহার করে ফলাফলের মান উল্লেখযোগ্যভাবে উন্নত করা যায়।

---

## সংক্ষেপে

- Retriever হলো user query আর data source এর মাঝের সার্চ-ইঞ্জিন — যেটা সবচেয়ে relevant document খুঁজে বের করে
- **Data source** অনুযায়ী (Wikipedia, Vector Store) এবং **search strategy** অনুযায়ী (MMR, Multi-Query, Compression) — দুইভাবে শ্রেণীবিভাগ করা যায়
- **Vector Store Retriever** সবচেয়ে সাধারণ পদ্ধতি — `.as_retriever()` দিয়ে যেকোনো vectorstore কে retriever বানানো যায়
- **MMR** পুনরাবৃত্তি কমিয়ে বৈচিত্র্যময় ফলাফল দেয়
- **Multi-Query** LLM দিয়ে একই প্রশ্নের একাধিক ভার্সন বানিয়ে search এর ব্যাপকতা বাড়ায়
- **Contextual Compression** শুধু প্রাসঙ্গিক অংশটুকু রেখে বাকি noise বাদ দেয়
- সঠিক retriever নির্বাচন RAG application এর accuracy বাড়ানোর জন্য অত্যন্ত গুরুত্বপূর্ণ

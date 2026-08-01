---
title: Vector Stores
---

# Vector Stores

Text Splitter দিয়ে আমরা বড় document কে ছোট chunk এ ভাগ করেছি। এখন প্রশ্ন হলো — এই chunk গুলো কোথায় এবং কীভাবে সংরক্ষণ করব, যাতে পরে user এর প্রশ্নের সাথে সবচেয়ে relevant chunk দ্রুত খুঁজে বের করা যায়? এই কাজটাই করে **Vector Store**।

---

## কেন Vector Store দরকার?

### ঐতিহ্যবাহী (Traditional) Database এর সমস্যা

মনে করো তুমি একটা movie recommendation সিস্টেম বানাচ্ছো, যেখানে user এর প্রিয় movie এর সাথে **কাহিনীর ধরন (plot) এ মিল** আছে এমন movie খুঁজে বের করতে হবে — শুধু keyword match না।

```
Traditional Database (SQL) এর সীমাবদ্ধতা:

Query: "একটা মহাকাশ ভ্রমণের সাইন্স ফিকশন movie যেখানে বাবা-মেয়ের সম্পর্ক আছে"

SQL এ এই ধরনের প্রশ্নের জন্য কোনো সরাসরি "WHERE" clause নেই —
কারণ এটা keyword match না, এটা অর্থগত (semantic) মিল
```

Traditional database (SQL) শুধু exact match বা keyword-based search এ ভালো — কিন্তু "এই দুইটা জিনিসের **অর্থ** কতটা কাছাকাছি" — এই প্রশ্নের উত্তর দিতে পারে না।

### Embedding — সমাধানের চাবিকাঠি

**Embedding** হলো টেক্সটকে একটা সংখ্যার array (vector) এ রূপান্তর করার পদ্ধতি, যেখানে **অর্থগতভাবে কাছাকাছি টেক্সট গুলো vector space এ কাছাকাছি অবস্থানে থাকে**।

```
Vector Space এ ধারণাগতভাবে:

  "মহাকাশযান"           "রকেট"
        •  ← কাছাকাছি →   •
                                   
                                        "রান্নার রেসিপি"
                                              •  ← অনেক দূরে
```

এই ধারণার মাধ্যমেই "সাইন্স ফিকশন movie" আর "মহাকাশ movie" — দুইটা ভিন্ন শব্দ হলেও, তাদের embedding vector একে অপরের কাছাকাছি হবে, কারণ অর্থগতভাবে তারা সম্পর্কিত।

---

## Vector Store কী?

Vector Store হলো এমন একটা system যেটা:

1. **ডেটা সংরক্ষণ করে** — প্রতিটা chunk এর embedding vector এবং তার সাথে সম্পর্কিত মূল টেক্সট/metadata
2. **Similarity Search করে** — একটা query vector দিলে, সংরক্ষিত vector গুলোর মধ্যে থেকে সবচেয়ে কাছাকাছি (similar) vector গুলো খুঁজে বের করে
3. **Efficient Indexing ব্যবহার করে** — লক্ষ লক্ষ high-dimensional vector এর মধ্যে থেকে দ্রুত খোঁজার জন্য বিশেষ কৌশল (যেমন clustering, approximate nearest neighbor) ব্যবহার করে

```
Vector Store এর কাজ:

  User Query
      │
      ▼
  Embedding Model  → query কে vector এ রূপান্তর
      │
      ▼
  Vector Store এর মধ্যে Similarity Search
      │
      ▼
  সবচেয়ে কাছাকাছি (similar) chunk গুলো রিটার্ন
```

### Indexing কেন গুরুত্বপূর্ণ

যদি লক্ষ লক্ষ vector থাকে, তাহলে প্রতিটা query তে সব vector এর সাথে এক এক করে তুলনা করা (brute-force) খুবই ধীরগতির হবে। তাই Vector Store বিশেষ indexing কৌশল ব্যবহার করে (যেমন clustering-based বা graph-based nearest neighbor algorithm), যাতে পুরোটা না ঘেঁটেও দ্রুত সবচেয়ে কাছাকাছি vector গুলো খুঁজে বের করা যায় — এটাই লক্ষ লক্ষ vector এর মধ্যেও দ্রুত search সম্ভব করে তোলে।

---

## Vector Store vs Vector Database — পার্থক্য কী?

দুইটা term প্রায়ই একে অপরের বদলে ব্যবহার করা হয়, কিন্তু কিছুটা পার্থক্য আছে:

| বৈশিষ্ট্য | Vector Store | Vector Database |
|---|---|---|
| **স্কেল** | সাধারণত ছোট থেকে মাঝারি স্কেলের জন্য উপযুক্ত | বড়, enterprise-level স্কেলের জন্য ডিজাইন করা |
| **Architecture** | সাধারণত single-node, lightweight | Distributed architecture সাপোর্ট করে |
| **Data Guarantee** | সাধারণত basic | ACID guarantee সহ (enterprise-grade reliability) |
| **Security** | সীমিত | Enterprise-level security ফিচার |
| **উদাহরণ** | Chroma, FAISS (lightweight ব্যবহারে) | Pinecone, Weaviate, Milvus (managed/distributed) |

::: tip
এই পার্থক্যটা অনেকটা "একটা সাধারণ library" আর "একটা পূর্ণাঙ্গ production database" এর মধ্যে পার্থক্যের মতো। ছোট প্রজেক্ট বা প্রোটোটাইপ এর জন্য Vector Store যথেষ্ট, কিন্তু বড়, বহু-ব্যবহারকারীর production system এ Vector Database এর enterprise ফিচার প্রয়োজন হতে পারে।
:::

---

## LangChain এ Vector Store

LangChain এর সবচেয়ে বড় সুবিধা হলো — এটা সব ধরনের vector store (Chroma, Pinecone, FAISS, Weaviate ইত্যাদি) এর জন্য একটা **standardized interface** দেয়। ফলে একটা provider থেকে আরেকটাতে যেতে হলে code এর গঠন প্রায় একই থাকে, শুধু import ও constructor বদলায় — ঠিক যেমনটা আমরা Chat Model এর ক্ষেত্রে দেখেছি।

---

## Chroma Vector Store — Hands-on কোড

**Chroma** একটা lightweight, ব্যবহার করা সহজ open-source vector store — শেখা এবং ছোট প্রজেক্টের জন্য খুবই জনপ্রিয়।

```bash
pip install langchain-chroma
```

### Vector Store তৈরি করা এবং Document যোগ করা

```python
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document

embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")

documents = [
    Document(page_content="ঢাকা বাংলাদেশের রাজধানী।", metadata={"category": "ভূগোল"}),
    Document(page_content="পদ্মা সেতু একটি বিখ্যাত স্থাপনা।", metadata={"category": "অবকাঠামো"}),
    Document(page_content="পাইথন একটি জনপ্রিয় প্রোগ্রামিং ভাষা।", metadata={"category": "প্রযুক্তি"}),
]

vectorstore = Chroma.from_documents(
    documents=documents,
    embedding=embedding_model,
    persist_directory="./chroma_db"
)
```

`persist_directory` দিলে data ডিস্কে সংরক্ষিত থাকে — প্রোগ্রাম বন্ধ করে আবার চালু করলেও ডেটা হারিয়ে যাবে না।

### Similarity Search — Score সহ

```python
results = vectorstore.similarity_search_with_score(
    "বাংলাদেশের রাজধানী কোথায়?",
    k=2  # সবচেয়ে relevant ২টা document
)

for doc, score in results:
    print(f"Content: {doc.page_content}")
    print(f"Score: {score}\n")
```

`score` দেখায় query আর result কতটা কাছাকাছি — সাধারণত এটা distance metric (কম score মানে বেশি কাছাকাছি, ব্যবহৃত metric অনুযায়ী ভিন্ন হতে পারে)।

### CRUD Operations — Update ও Delete

```python
# নতুন Document যোগ করা
vectorstore.add_documents([
    Document(page_content="কক্সবাজার বিশ্বের দীর্ঘতম সমুদ্র সৈকত।", metadata={"category": "ভূগোল"})
])

# ID দিয়ে Document আপডেট করা
vectorstore.update_document(
    document_id="doc_1",
    document=Document(page_content="ঢাকা বাংলাদেশের রাজধানী এবং সবচেয়ে জনবহুল শহর।")
)

# Document মুছে ফেলা
vectorstore.delete(ids=["doc_1"])
```

### Metadata Filtering — নির্দিষ্ট শ্রেণীর মধ্যে খোঁজা

```python
results = vectorstore.similarity_search(
    "বাংলাদেশ সম্পর্কে কিছু বলো",
    k=3,
    filter={"category": "ভূগোল"}  # শুধু 'ভূগোল' category এর মধ্যে খুঁজবে
)
```

`filter` প্যারামিটার দিয়ে similarity search কে নির্দিষ্ট metadata শর্তে সীমাবদ্ধ করা যায় — যেমন শুধু নির্দিষ্ট category, তারিখ, বা source এর মধ্যে খোঁজা। এটা বড় dataset এ খুবই কাজে লাগে যখন শুধু একটা নির্দিষ্ট অংশে সার্চ সীমাবদ্ধ রাখতে হয়।

---

## অন্যান্য জনপ্রিয় Vector Store (LangChain এ ব্যবহারযোগ্য)

| Vector Store | বৈশিষ্ট্য |
|---|---|
| **Chroma** | Lightweight, open-source, শেখা/ছোট প্রজেক্টের জন্য চমৎকার |
| **FAISS** | Facebook এর তৈরি, দ্রুত, in-memory, GPU সাপোর্ট আছে |
| **Pinecone** | Fully-managed, cloud-based, production-grade distributed vector database |
| **Weaviate** | Open-source, distributed, GraphQL API সহ enterprise-grade |

Provider পরিবর্তন করতে LangChain এ শুধু import আর constructor বদলাতে হয় — বাকি `similarity_search`, `add_documents` ইত্যাদি method একই থাকে।

---

## সংক্ষেপে

- Traditional database keyword match এ ভালো, কিন্তু **অর্থগত (semantic) মিল** বুঝতে পারে না — এখানেই Vector Store এর প্রয়োজন
- **Embedding** টেক্সটকে vector এ রূপান্তর করে, যেখানে অর্থগতভাবে কাছাকাছি টেক্সট vector space এ কাছাকাছি থাকে
- Vector Store ৩টা মূল কাজ করে: **সংরক্ষণ**, **similarity search**, এবং **efficient indexing**
- **Vector Store vs Vector Database** — মূলত স্কেল, architecture, এবং enterprise ফিচারের পার্থক্য
- LangChain সব provider এর জন্য **standardized interface** দেয় — Chroma থেকে Pinecone এ যেতে code এর কাঠামো প্রায় একই থাকে
- **Chroma** দিয়ে হাতে-কলমে দেখা হয়েছে: document যোগ করা, similarity search (score সহ), update/delete, এবং metadata filtering

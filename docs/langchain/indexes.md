---
title: Indexes
---

# Indexes — LangChain এর ৪র্থ Core Component

LLM শুধু তার training data জানে — তোমার নিজের document, PDF, বা company-র internal data সম্পর্কে কিছুই জানে না। **Indexes** component এই সমস্যার সমাধান করে — এটা LLM কে তোমার নিজের ডেটার সাথে সংযুক্ত করে, যাতে model সেই ডেটার উপর ভিত্তি করে উত্তর দিতে পারে। এটাই RAG (Retrieval-Augmented Generation) এর মূল ভিত্তি।

## Indexes এর ৪টা Sub-Component

```
                    ┌───────────┐
                    │  Indexes  │
                    └─────┬─────┘
          ┌───────────────┼───────────────┬───────────────┐
          ▼               ▼               ▼               ▼
  ┌───────────────┐ ┌─────────────┐ ┌──────────────┐ ┌────────────┐
  │Document Loaders│ │Text Splitters│ │ VectorStores │ │ Retrievers │
  └───────────────┘ └─────────────┘ └──────────────┘ └────────────┘
```

এই চারটা component একসাথে মিলে একটা সম্পূর্ণ pipeline তৈরি করে — raw document থেকে শুরু করে, শেষে relevant তথ্য খুঁজে বের করা পর্যন্ত।

---

## প্রতিটা Component এক নজরে

### ১. Document Loaders

তোমার raw data (PDF, website, Word file, database, CSV — যেকোনো source) থেকে content নিয়ে এসে LangChain এর ব্যবহারযোগ্য `Document` object এ রূপান্তর করে। এটাই pipeline এর প্রথম ধাপ — data কোথা থেকে আসছে সেটা নির্ধারণ করে।

### ২. Text Splitters

Document Loader থেকে পাওয়া content সাধারণত অনেক বড় হয় — একটা পুরো PDF বা ওয়েবপেজ। এত বড় টেক্সট সরাসরি LLM এ পাঠানো যায় না (context window সীমিত), এবং সরাসরি পাঠালে relevant অংশ খুঁজে বের করাও কঠিন হয়ে যায়। Text Splitter এই বড় content কে ছোট ছোট, অর্থপূর্ণ chunk এ ভাগ করে দেয়।

### ৩. VectorStores

প্রতিটা chunk কে embedding (সংখ্যার array/vector) এ রূপান্তর করে সংরক্ষণ করা হয় VectorStore এ। এই সংরক্ষণ পদ্ধতি এমনভাবে করা হয় যাতে পরে **অর্থগত মিল (semantic similarity)** অনুযায়ী দ্রুত খোঁজা যায় — শুধু keyword match না, বরং একই অর্থ বহনকারী ভিন্ন শব্দের টেক্সটও খুঁজে বের করা যায়।

### ৪. Retrievers

User এর প্রশ্ন এলে, Retriever সেই প্রশ্নের সাথে সবচেয়ে relevant chunk গুলো VectorStore থেকে খুঁজে বের করে নিয়ে আসে — যেটা পরে prompt এর সাথে জুড়ে LLM কে পাঠানো হয়।

---

## পুরো Pipeline একসাথে — কীভাবে কাজ করে

```
[PDF/Website/Database]
         │
         ▼
  Document Loader          ← raw content নিয়ে আসে
         │
         ▼
  Text Splitter            ← ছোট ছোট chunk এ ভাগ করে
         │
         ▼
  Embedding Model           ← প্রতিটা chunk কে vector এ রূপান্তর করে
         │
         ▼
  VectorStore                ← vector গুলো সংরক্ষণ করে রাখে
         │
         │  (User এর প্রশ্ন আসার পর)
         ▼
  Retriever                  ← প্রশ্নের সাথে relevant chunk খুঁজে বের করে
         │
         ▼
  Prompt + LLM               ← relevant chunk + প্রশ্ন একসাথে পাঠিয়ে উত্তর তৈরি
```

প্রথম চারটা ধাপ (Loader → Splitter → Embedding → VectorStore) সাধারণত **একবার** করে করা হয় (ডেটা তৈরির সময়), আর Retriever ধাপটা **প্রতিটা user প্রশ্নের জন্য** নতুন করে চলে।

---

## কেন এই চারটা আলাদা component হিসেবে ভাগ করা হয়েছে

| কারণ | ব্যাখ্যা |
|---|---|
| **Modularity** | প্রতিটা ধাপ আলাদা হওয়ায় শুধু একটা অংশ (যেমন VectorStore) বদলানো যায়, বাকি pipeline অক্ষত থাকে |
| **বিভিন্ন Source সাপোর্ট** | Document Loader আলাদা হওয়ায় PDF, website, database — যেকোনো source থেকে একই পরবর্তী pipeline ব্যবহার করা যায় |
| **Provider পরিবর্তন সহজ** | Chroma থেকে Pinecone এ যেতে চাইলে শুধু VectorStore অংশ বদলালেই হয় |
| **টেস্ট করা সহজ** | প্রতিটা ধাপ আলাদাভাবে টেস্ট/ডিবাগ করা যায় — সমস্যা কোথায় হচ্ছে সহজে বোঝা যায় |

---

## সংক্ষেপে

- **Indexes** LLM কে তোমার নিজের ডেটার সাথে সংযুক্ত করে — এটাই RAG এর ভিত্তি
- চারটা sub-component: **Document Loaders** (data আনা), **Text Splitters** (ভাগ করা), **VectorStores** (সংরক্ষণ ও semantic search), **Retrievers** (relevant অংশ খুঁজে বের করা)
- প্রথম তিনটা ধাপ সাধারণত একবার সেটআপ করা হয়, Retriever প্রতিটা query তে নতুন করে চলে
- প্রতিটা component আলাদা রাখার ফলে flexibility এবং maintainability অনেক বেড়ে যায়

## পরবর্তী ধাপ

এরপরের পেজগুলোতে আমরা প্রতিটা sub-component আলাদাভাবে বিস্তারিত কোড উদাহরণ সহ দেখব — শুরু হবে **Document Loaders** দিয়ে।

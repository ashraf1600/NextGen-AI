---
title: Document Loaders
---

# Document Loaders

RAG (Retrieval-Augmented Generation) application বানানোর প্রথম ধাপ হলো তোমার external, private, বা up-to-date data কে LLM এর জন্য ব্যবহারযোগ্য format এ নিয়ে আসা — মডেলকে re-train না করেই। এই কাজটাই করে **Document Loader**।

---

## RAG কী এবং কেন দরকার?

LLM শুধু তার training data পর্যন্ত সীমাবদ্ধ — সেটা fixed, এবং সেখানে তোমার company-র internal document, ব্যক্তিগত নোট, বা সাম্প্রতিক তথ্য থাকে না। প্রতিবার নতুন ডেটা যোগ করতে model কে পুরোপুরি re-train করা ব্যয়বহুল এবং সময়সাপেক্ষ।

**RAG** এই সমস্যার সমাধান দেয় — model কে re-train না করেই, প্রশ্নের সময় relevant তথ্য খুঁজে বের করে prompt এর সাথে জুড়ে দেওয়া হয়। এভাবে model তার নিজের training data এর বাইরে গিয়েও, তোমার দেওয়া তথ্যের ভিত্তিতে সঠিক উত্তর দিতে পারে।

---

## RAG এর মূল Component গুলো

RAG pipeline এ কয়েকটা ধাপ থাকে — Document Loader হলো এর প্রথম এবং ভিত্তি ধাপ। বাকি ধাপ (Text Splitter, Vector Database, Retriever) আসবে পরবর্তী পেজগুলোতে।

```
[Raw Data: PDF/Web/CSV/টেক্সট ফাইল]
              │
              ▼
      Document Loader          ← এই পেজের বিষয়
              │
              ▼
   standardized Document object
```

---

## Document Loader কী কাজ করে?

Document Loader তোমার বিভিন্ন উৎসের raw data (PDF, website, text file, CSV, ইত্যাদি) কে LangChain এর একটা **standardized `Document` object** এ রূপান্তর করে। এই object এ দুইটা মূল অংশ থাকে:

```python
Document(
    page_content="এখানে আসল টেক্সট কনটেন্ট থাকে...",
    metadata={"source": "file.pdf", "page": 1}
)
```

- **`page_content`** — actual টেক্সট কনটেন্ট
- **`metadata`** — অতিরিক্ত তথ্য (কোন ফাইল থেকে এসেছে, কোন page, কবে তৈরি হয়েছে ইত্যাদি)

সব ধরনের loader — যতই ভিন্ন source থেকে data আনুক না কেন — সবসময় এই একই standardized format রিটার্ন করে। এই কারণেই পরের ধাপগুলো (Splitter, VectorStore) সব ধরনের data নিয়ে একইভাবে কাজ করতে পারে, source যেটাই হোক না কেন।

---

## ১. TextLoader — সবচেয়ে সহজ Loader

সাধারণ `.txt` ফাইল থেকে content লোড করার জন্য।

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("notes.txt", encoding="utf-8")
documents = loader.load()

print(documents[0].page_content)
print(documents[0].metadata)
```

::: tip
বাংলা টেক্সট ফাইল লোড করার সময় `encoding="utf-8"` অবশ্যই দিতে হবে, নাহলে বাংলা অক্ষর ঠিকমতো পড়া নাও যেতে পারে।
:::

---

## ২. PyPDFLoader — PDF থেকে Content বের করা

PDF ফাইল থেকে টেক্সট বের করার জন্য সবচেয়ে বহুল ব্যবহৃত loader। এটা প্রতিটা page কে আলাদা `Document` object হিসেবে রিটার্ন করে।

```bash
pip install pypdf
```

```python
from langchain_community.document_loaders import PyPDFLoader

loader = PyPDFLoader("research-paper.pdf")
documents = loader.load()

print(f"মোট পেজ সংখ্যা: {len(documents)}")
print(documents[0].page_content)  # প্রথম পেজের কনটেন্ট
print(documents[0].metadata)      # {'source': 'research-paper.pdf', 'page': 0}
```

প্রতিটা page আলাদা `Document` হওয়ায়, পরে metadata দেখে বলা যায় কোন তথ্য PDF এর ঠিক কোন page থেকে এসেছে — এটা RAG application এ source citation দেখানোর জন্য খুব কাজে লাগে।

### PyPDFLoader এর সীমাবদ্ধতা (Limitations)

- **Scanned PDF** (ছবি আকারে থাকা PDF) থেকে টেক্সট বের করতে পারে না — সেক্ষেত্রে OCR-based loader দরকার হয়
- **জটিল layout** (multi-column, table-heavy PDF) থেকে টেক্সট বের করার সময় কখনো কখনো word order এলোমেলো হয়ে যেতে পারে
- **Image/chart** এর মধ্যে থাকা টেক্সট বের করতে পারে না
- বড় PDF এর ক্ষেত্রে প্রতিটা page আলাদা Document হওয়ায়, একটা paragraph যদি দুই page জুড়ে থাকে, সেটা ভেঙে যেতে পারে

---

## ৩. DirectoryLoader — একসাথে অনেক ফাইল Load করা

একটা নির্দিষ্ট folder এর ভিতরে থাকা সব ফাইল একসাথে bulk এ load করার জন্য।

```python
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader

loader = DirectoryLoader(
    "./documents",
    glob="**/*.pdf",
    loader_cls=PyPDFLoader
)

documents = loader.load()
print(f"মোট ফাইল থেকে লোড হওয়া Document সংখ্যা: {len(documents)}")
```

- `glob="**/*.pdf"` — শুধু `.pdf` extension এর ফাইল load করবে, subfolder সহ
- `loader_cls` — কোন loader ব্যবহার করে প্রতিটা ফাইল পড়া হবে সেটা নির্দিষ্ট করে দেওয়া হয়

---

## Load vs Lazy Load

### `.load()` — Eager Loading

```python
documents = loader.load()
```

`.load()` সব document একসাথে memory তে নিয়ে আসে এবং একটা list রিটার্ন করে। ছোট বা মাঝারি dataset এর জন্য এটা সহজ এবং যথেষ্ট।

### `.lazy_load()` — Generator-based Loading

```python
for document in loader.lazy_load():
    process(document)  # একটা একটা করে প্রসেস হয়
```

`.lazy_load()` একটা Python generator রিটার্ন করে — অর্থাৎ, সব document একসাথে memory তে load না করে, একটা একটা করে on-demand ভাবে দেয়। এটা তখন জরুরি হয়ে পড়ে যখন dataset অনেক বড় (হাজার হাজার ফাইল) এবং সব একসাথে memory তে রাখলে RAM শেষ হয়ে যেতে পারে।

| পদ্ধতি | কখন ব্যবহার করবে |
|---|---|
| `.load()` | ছোট/মাঝারি dataset, memory নিয়ে চিন্তা নেই |
| `.lazy_load()` | বড় dataset, memory-efficient stream processing দরকার |

---

## ৪. WebBaseLoader — ওয়েবপেজ থেকে Content আনা

ওয়েবপেজের URL দিয়ে সেখানকার টেক্সট কনটেন্ট বের করার জন্য — এটা ভিতরে `BeautifulSoup` ব্যবহার করে HTML parse করে।

```bash
pip install beautifulsoup4
```

```python
from langchain_community.document_loaders import WebBaseLoader

loader = WebBaseLoader("https://example.com/article")
documents = loader.load()

print(documents[0].page_content)
```

::: warning
`WebBaseLoader` সব ওয়েবসাইটে সমানভাবে কাজ নাও করতে পারে — যেসব সাইট heavily JavaScript দিয়ে content render করে (client-side rendering), সেখানে HTML সরাসরি ফেচ করলে খালি বা অসম্পূর্ণ content আসতে পারে। এমন ক্ষেত্রে JavaScript-aware scraping tool দরকার হতে পারে।
:::

---

## ৫. CSVLoader — Tabular Data লোড করা

CSV ফাইল থেকে ডেটা লোড করার জন্য — এখানে প্রতিটা **row কে একটা আলাদা Document** হিসেবে ধরা হয়।

```python
from langchain_community.document_loaders import CSVLoader

loader = CSVLoader(file_path="products.csv", encoding="utf-8")
documents = loader.load()

print(documents[0].page_content)
# উদাহরণ: "name: শার্ট\nprice: ৫০০\ncategory: পোশাক"
print(documents[0].metadata)
# {'source': 'products.csv', 'row': 0}
```

প্রতিটা row আলাদা Document হওয়ায়, পরে RAG এ প্রশ্ন করলে নির্দিষ্ট product/row সংক্রান্ত তথ্য সরাসরি খুঁজে পাওয়া সহজ হয়।

---

## অন্যান্য Document Loader

উপরের পাঁচটা সবচেয়ে বেশি ব্যবহৃত loader, তবে LangChain community তে আরও অনেক ধরনের loader পাওয়া যায়:

| Loader | কাজ |
|---|---|
| `UnstructuredWordDocumentLoader` | `.docx` ফাইল থেকে content আনা |
| `NotionDBLoader` | Notion ডেটাবেস থেকে ডেটা আনা |
| `WikipediaLoader` | সরাসরি Wikipedia থেকে আর্টিকেল আনা |
| `S3FileLoader` | AWS S3 bucket থেকে ফাইল লোড করা |
| `SlackDirectoryLoader` | Slack export থেকে conversation লোড করা |

এই তালিকা আরও বড় — নির্দিষ্ট প্রয়োজনে LangChain এর community loader documentation দেখে সঠিক loader বেছে নেওয়া যায়।

---

## Custom Document Loader বানানো

যদি built-in কোনো loader তোমার প্রয়োজন মেটাতে না পারে (যেমন খুবই নির্দিষ্ট, custom data format), তাহলে নিজেই `BaseLoader` class থেকে inherit করে নিজের loader বানানো যায়।

```python
from langchain_core.document_loaders import BaseLoader
from langchain_core.documents import Document

class MyCustomLoader(BaseLoader):
    def __init__(self, file_path: str):
        self.file_path = file_path

    def load(self):
        with open(self.file_path, "r", encoding="utf-8") as f:
            content = f.read()
        return [Document(page_content=content, metadata={"source": self.file_path})]

loader = MyCustomLoader("my-special-format.txt")
documents = loader.load()
```

`BaseLoader` থেকে inherit করলে LangChain এর বাকি ecosystem (Text Splitter, VectorStore ইত্যাদি) এর সাথে এই custom loader ঠিক built-in loader এর মতোই কাজ করবে, যেহেতু একই standardized `Document` object রিটার্ন করছে।

---

## সংক্ষেপে

- Document Loader raw data কে standardized `Document` object (`page_content` + `metadata`) এ রূপান্তর করে
- **TextLoader** — সাধারণ টেক্সট ফাইলের জন্য
- **PyPDFLoader** — PDF থেকে page-by-page টেক্সট বের করার জন্য, তবে scanned/জটিল layout এ সীমাবদ্ধতা আছে
- **DirectoryLoader** — একসাথে একাধিক ফাইল bulk এ লোড করার জন্য
- **`.load()` vs `.lazy_load()`** — memory তে সব একসাথে নাকি generator আকারে ধীরে ধীরে
- **WebBaseLoader** — ওয়েবপেজ থেকে টেক্সট আনার জন্য, তবে JS-heavy সাইটে সীমাবদ্ধতা আছে
- **CSVLoader** — প্রতিটা row কে আলাদা Document হিসেবে লোড করে
- প্রয়োজন হলে **`BaseLoader`** থেকে inherit করে নিজের custom loader বানানো যায়

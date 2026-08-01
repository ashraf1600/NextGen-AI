---
title: Retrieval Augmented Generation (RAG)
---

# RAG — Retrieval Augmented Generation

এতক্ষণ আমরা Indexes এর প্রতিটা sub-component (Document Loader, Text Splitter, VectorStore, Retriever) আলাদা আলাদাভাবে দেখেছি। এই পেজে আমরা সবকিছু একসাথে জোড়া দিয়ে দেখব — এই পুরো প্যাটার্নটাই **RAG** নামে পরিচিত, এবং এটাই বর্তমানে সবচেয়ে জনপ্রিয় LLM application architecture।

---

## RAG কী?

**RAG (Retrieval Augmented Generation)** একটা পদ্ধতি, যেখানে LLM কে উত্তর দেওয়ার আগে প্রাসঙ্গিক তথ্য **retrieve (খুঁজে বের)** করে দেওয়া হয়, যাতে model শুধু তার training data এর উপর নির্ভর না করে, তোমার দেওয়া বাস্তব, up-to-date, বা private ডেটার ভিত্তিতে উত্তর দিতে পারে।

নাম থেকেই এর কাজ বোঝা যায়:
- **Retrieval** — প্রাসঙ্গিক তথ্য খুঁজে বের করা
- **Augmented** — সেই তথ্য দিয়ে prompt কে সমৃদ্ধ করা
- **Generation** — সেই সমৃদ্ধ prompt দিয়ে LLM কে উত্তর তৈরি করানো

---

## কেন RAG দরকার?

### সমস্যা: LLM এর সীমাবদ্ধতা

| সমস্যা | ব্যাখ্যা |
|---|---|
| **Knowledge Cutoff** | LLM শুধু তার training data পর্যন্ত জানে — তার পরের কোনো ঘটনা/তথ্য জানে না |
| **Private Data** | Company-র internal document, ব্যক্তিগত নোট — এসব কখনোই LLM এর training data তে ছিল না |
| **Hallucination** | LLM যখন কিছু জানে না, তখন প্রায়ই আত্মবিশ্বাসের সাথে ভুল তথ্য বানিয়ে বলে দেয় |
| **Re-training এর খরচ** | নতুন তথ্য যোগ করতে model কে পুরোপুরি re-train করা অত্যন্ত ব্যয়বহুল এবং সময়সাপেক্ষ |

### সমাধান: RAG

RAG এই সমস্যাগুলোর একটা কার্যকর সমাধান দেয় — model কে re-train না করেই, প্রশ্নের সময় relevant তথ্য "ধার" করে দেওয়া হয়। এতে:

- LLM তার knowledge cutoff এর বাইরের তথ্যও ব্যবহার করতে পারে
- Private/internal ডেটা নিয়ে নিরাপদে কাজ করা যায় (ডেটা LLM কে re-train করতে পাঠাতে হয় না)
- Hallucination উল্লেখযোগ্যভাবে কমে যায়, কারণ model কে "অনুমান" করতে হয় না — সত্যিকারের তথ্য সামনে দেওয়া হয়
- নতুন তথ্য যোগ করা সহজ — শুধু data source আপডেট করলেই হয়, model পরিবর্তনের দরকার নেই

---

## RAG কীভাবে কাজ করে — সম্পূর্ণ Pipeline

RAG এর কাজ দুইটা ধাপে ভাগ করা যায়: **Indexing (একবার হয়)** এবং **Retrieval + Generation (প্রতিটা প্রশ্নে হয়)**।

```
═══════════════════ ধাপ ১: Indexing (একবার করা হয়) ═══════════════════

[Raw Data: PDF/Website/Database]
              │
              ▼
      Document Loader           ← raw content নিয়ে আসা
              │
              ▼
       Text Splitter             ← ছোট chunk এ ভাগ করা
              │
              ▼
      Embedding Model             ← প্রতিটা chunk কে vector এ রূপান্তর
              │
              ▼
        Vector Store                ← vector গুলো সংরক্ষণ করে রাখা


═══════════════ ধাপ ২: Retrieval + Generation (প্রতি প্রশ্নে হয়) ═══════════════

           User Question
                 │
                 ▼
         Embedding Model            ← প্রশ্নকেও vector এ রূপান্তর
                 │
                 ▼
            Retriever                ← Vector Store থেকে relevant chunk খোঁজা
                 │
                 ▼
     Prompt (Context + Question)     ← retrieved chunk + প্রশ্ন একসাথে
                 │
                 ▼
               LLM                    ← সমৃদ্ধ prompt দিয়ে উত্তর তৈরি
                 │
                 ▼
          চূড়ান্ত উত্তর
```

---

## সম্পূর্ণ কোড উদাহরণ

চলো, উপরের পুরো pipeline টা একসাথে কোড দিয়ে বাস্তবায়ন করি।

### ধাপ ১: Indexing (একবার সেটআপ)

```python
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

# ১. Document লোড করা
loader = PyPDFLoader("company-handbook.pdf")
documents = loader.load()

# ২. ছোট chunk এ ভাগ করা
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(documents)

# ৩. Embedding তৈরি করে Vector Store এ সংরক্ষণ
embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embedding_model,
    persist_directory="./chroma_db"
)

print(f"মোট {len(chunks)} টা chunk ইনডেক্স করা হয়েছে।")
```

### ধাপ ২: Retriever ও RAG Chain তৈরি

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
model = ChatOpenAI(model="gpt-4o")
parser = StrOutputParser()

prompt = ChatPromptTemplate.from_template(
    """নিচের context ব্যবহার করে প্রশ্নের উত্তর দাও। 
যদি context এ উত্তর না থাকে, বলো "আমি জানি না।"

Context:
{context}

প্রশ্ন: {question}
"""
)

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | model
    | parser
)
```

### ধাপ ৩: প্রশ্ন করা

```python
answer = rag_chain.invoke("কোম্পানির ছুটির নীতি কী?")
print(answer)
```

---

## Prompt এ Context কীভাবে বসানো হয়

`format_docs` function retrieve করা প্রতিটা document এর `page_content` একসাথে জোড়া দেয়, যাতে সেটা prompt এর `{context}` variable এ বসানো যায়। এভাবেই retrieved chunk গুলো আসলে LLM এর কাছে পৌঁছায় — LLM নিজে থেকে vector store এ query করে না, বরং আমরা আগে থেকেই relevant তথ্য খুঁজে prompt এর মধ্যে "গুঁজে" দিচ্ছি।

```
prompt এ যা যায়:

Context:
"কোম্পানির নীতি অনুযায়ী প্রতি কর্মচারী বছরে ২০ দিন ছুটি পাবেন..."
"জরুরি ছুটির জন্য HR বিভাগে আবেদন করতে হবে..."

প্রশ্ন: কোম্পানির ছুটির নীতি কী?
```

---

## RAG এর সুবিধা — সংক্ষেপে

| সুবিধা | ব্যাখ্যা |
|---|---|
| **Up-to-date তথ্য** | Data source আপডেট করলেই নতুন তথ্য পাওয়া যায়, model re-train লাগে না |
| **Private ডেটা নিরাপদে ব্যবহার** | Internal document LLM কে training এ পাঠাতে হয় না |
| **কম Hallucination** | Model কে সত্যিকারের তথ্য দেওয়া হয়, অনুমান করতে হয় না |
| **Source Citation সম্ভব** | Metadata থাকায় কোন document থেকে উত্তর এসেছে সেটা দেখানো যায় |
| **সাশ্রয়ী** | Re-training এর তুলনায় অনেক কম খরচে নতুন জ্ঞান যোগ করা যায় |

---

## RAG এর সীমাবদ্ধতা

- **Retrieval quality এর উপর নির্ভরশীল** — Retriever যদি ভুল/অপ্রাসঙ্গিক chunk খুঁজে আনে, উত্তরও ভুল হবে (Text Splitter ও Retriever সঠিকভাবে বেছে নেওয়া তাই অত্যন্ত গুরুত্বপূর্ণ)
- **Context window সীমাবদ্ধতা** — একসাথে অনেক বেশি chunk পাঠালে সেটা model এর input limit ছাড়িয়ে যেতে পারে
- **Latency বৃদ্ধি** — সরাসরি LLM call করার চেয়ে ধীর, কারণ retrieval ধাপটা অতিরিক্ত সময় নেয়
- **জটিল প্রশ্নে সীমাবদ্ধতা** — একাধিক ধাপে reasoning দরকার এমন প্রশ্নে (multi-hop question) সাধারণ RAG প্রায়ই যথেষ্ট নয়, advanced technique (যেমন Multi-Query Retriever) দরকার হতে পারে

---

## সংক্ষেপে

- **RAG** মানে LLM কে উত্তর দেওয়ার আগে relevant তথ্য retrieve করে prompt এ যুক্ত করে দেওয়া
- এটা LLM এর knowledge cutoff, private data, এবং hallucination সমস্যার একটা কার্যকর সমাধান
- পুরো pipeline দুই ধাপে ভাগ করা যায়: **Indexing** (একবার — Loader → Splitter → Embedding → VectorStore) এবং **Retrieval + Generation** (প্রতি প্রশ্নে — Retriever → Prompt → LLM)
- LangChain এ পুরো RAG pipeline একটা LCEL chain দিয়ে সংক্ষিপ্তভাবে লেখা যায়
- RAG সাশ্রয়ী ও নির্ভরযোগ্য হলেও, এর গুণমান সরাসরি নির্ভর করে Retriever এবং Text Splitter এর মান কতটা ভালো তার উপর

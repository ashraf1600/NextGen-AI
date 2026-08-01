---
title: Models
---

Models হলো তোমার code আর actual AI provider (OpenAI, Anthropic, Google, Hugging Face) এর মাঝের common interface। এই পেজে আমরা দেখব model কত ধরনের হয়, কীভাবে সেটআপ করতে হয়, এবং কোড দিয়ে বিভিন্ন provider ব্যবহার করার practical উদাহরণ।

## Models কী?

LangChain এ দুই ধরনের model আছে:

| ধরন | Input → Output | ব্যবহার |
| --- | --- | --- |
| **Language Models** | Text ইনপুট → Text আউটপুট | Chat, generation, summarization |
| **Embedding Models** | Text ইনপুট → Vector (সংখ্যার array) আউটপুট | Semantic search, RAG |

এই দুইটা সম্পূর্ণ ভিন্ন কাজ করে — একটা টেক্সট তৈরি করে, আরেকটা টেক্সট কে সংখ্যায় রূপান্তর করে যাতে অর্থগত মিল (semantic similarity) খোঁজা যায়। এই পেজে আমরা দুইটাই বিস্তারিতভাবে দেখব।

---

## Language Models: LLM vs Chat Models

Language Model দুই ধরনের হতে পারে:

- **LLM (সাধারণ Text Completion Model)** — একটা text prompt দিলে সরাসরি text generate করে, কোনো conversation structure থাকে না।
- **Chat Models** — multi-turn conversation handle করার জন্য বানানো, role-based message (system/human/AI) সাপোর্ট করে, এবং conversation history মনে রাখতে পারে (তুমি history পাঠালে)।

::: tip
বর্তমানে প্রায় সব production application **Chat Models** ব্যবহার করে, কারণ modern LLM provider (OpenAI, Anthropic, Google) সবাই chat-style interface কেই primary API হিসেবে রাখে। এই ডকুমেন্টেশনেও আমরা মূলত Chat Models ব্যবহার করব।
:::

---

## Setup — প্রয়োজনীয় প্যাকেজ ইনস্টল

Provider অনুযায়ী আলাদা প্যাকেজ লাগবে:

```bash
pip install langchain-openai langchain-anthropic langchain-google-genai
```

`.env` ফাইলে সংশ্লিষ্ট API key রাখো:

```bash
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here
GOOGLE_API_KEY=your-key-here
```

> এই setup [Installation](/langchain/installation) পেজে আগেই বিস্তারিত করা আছে।

---

## Code Demo: OpenAI (GPT)

```python
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

model = ChatOpenAI(model="gpt-4o", temperature=0.7)

response = model.invoke("বাংলাদেশের জাতীয় ফুল কী?")
print(response.content)
```

## Code Demo: Anthropic (Claude)

```python
from langchain_anthropic import ChatAnthropic

model = ChatAnthropic(model="claude-sonnet-4-6", temperature=0.7)

response = model.invoke("বাংলাদেশের জাতীয় ফুল কী?")
print(response.content)
```

## Code Demo: Google (Gemini)

```python
from langchain_google_genai import ChatGoogleGenerativeAI

model = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0.7)

response = model.invoke("বাংলাদেশের জাতীয় ফুল কী?")
print(response.content)
```

### লক্ষ্য করো

তিনটা provider এর code structure প্রায় হুবহু একই — শুধু import আর class name পরিবর্তন হয়েছে। এটাই LangChain এর সবচেয়ে বড় সুবিধা — provider বদলাতে পুরো application রিরাইট করতে হয় না।

### `temperature` প্যারামিটার

`temperature` নিয়ন্ত্রণ করে model এর output কতটা creative/random হবে:

- **০ এর কাছাকাছি** → deterministic, একই প্রশ্নে প্রায় একই উত্তর (factual task এর জন্য ভালো)
- **১ এর কাছাকাছি বা বেশি** → বেশি creative, ভিন্ন ভিন্ন উত্তর (creative writing এর জন্য ভালো)

---

## Open Source Models — Hugging Face

সব সময় paid API ব্যবহার করা লাগবে এমন না। **Hugging Face** হলো open-source model এর সবচেয়ে বড় repository — এখান থেকে free এ model ব্যবহার করা যায় দুইভাবে:

### পদ্ধতি ১: Hugging Face Inference API (cloud এ চলবে)

```bash
pip install langchain-huggingface huggingface_hub
```

```python
from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace

llm = HuggingFaceEndpoint(
    repo_id="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    task="text-generation"
)

model = ChatHuggingFace(llm=llm)
response = model.invoke("বাংলাদেশের রাজধানী কী?")
print(response.content)
```

### পদ্ধতি ২: লোকালি ডাউনলোড করে চালানো (নিজের কম্পিউটারে)

```bash
pip install transformers torch
```

```python
from langchain_huggingface import HuggingFacePipeline, ChatHuggingFace

llm = HuggingFacePipeline.from_model_id(
    model_id="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    task="text-generation",
    pipeline_kwargs={"max_new_tokens": 100}
)

model = ChatHuggingFace(llm=llm)
response = model.invoke("বাংলাদেশের রাজধানী কী?")
print(response.content)
```

::: warning
লোকাল model চালাতে ভালো GPU/RAM লাগে — ছোট model (যেমন TinyLlama) সাধারণ কম্পিউটারেও চলে, কিন্তু বড় model (7B+) এর জন্য শক্তিশালী hardware প্রয়োজন।
:::

### কখন কোনটা বেছে নেবে

| পরিস্থিতি | পছন্দ |
| --- | --- |
| Production app, নির্ভরযোগ্য output দরকার | OpenAI / Anthropic / Google (paid API) |
| খরচ কমাতে চাও, privacy গুরুত্বপূর্ণ | Hugging Face (local বা inference API) |
| শুধু শেখা/experiment করছো | Hugging Face Inference API (free tier) |

---

## Embedding Models

Embedding Model টেক্সটকে সংখ্যার array (vector) এ রূপান্তর করে — যাতে দুইটা টেক্সট এর মধ্যে **অর্থগত মিল (semantic similarity)** গাণিতিকভাবে মাপা যায়। এটাই RAG এবং semantic search এর মূল ভিত্তি।

### OpenAI Embeddings দিয়ে উদাহরণ

```python
from langchain_openai import OpenAIEmbeddings

embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")

vector = embedding_model.embed_query("ল্যাংচেইন একটি চমৎকার ফ্রেমওয়ার্ক")
print(len(vector))  # যেমন: 1536 — এটাই vector এর dimension
```

### Hugging Face Sentence Transformers দিয়ে উদাহরণ (Open Source, Free)

```python
from langchain_huggingface import HuggingFaceEmbeddings

embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

vector = embedding_model.embed_query("ল্যাংচেইন একটি চমৎকার ফ্রেমওয়ার্ক")
print(len(vector))
```

### Document Similarity Search — বাস্তব উদাহরণ

কয়েকটা document এর মধ্যে থেকে user এর প্রশ্নের সাথে সবচেয়ে relevant document কীভাবে খুঁজে বের করা যায়:

```python
from langchain_openai import OpenAIEmbeddings
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")

documents = [
    "ঢাকা বাংলাদেশের রাজধানী।",
    "পদ্মা সেতু বাংলাদেশের একটি বিখ্যাত স্থাপনা।",
    "পাইথন একটি জনপ্রিয় প্রোগ্রামিং ভাষা।"
]

query = "বাংলাদেশের রাজধানী কোথায়?"

doc_vectors = embedding_model.embed_documents(documents)
query_vector = embedding_model.embed_query(query)

similarities = cosine_similarity([query_vector], doc_vectors)[0]

best_match_index = np.argmax(similarities)
print(f"সবচেয়ে relevant document: {documents[best_match_index]}")
print(f"Similarity score: {similarities[best_match_index]:.4f}")
```

এই একই logic ব্যবহার করেই RAG pipeline এ vector store থেকে relevant chunk খুঁজে বের করা হয় — শুধু document সংখ্যা বড় হয়ে যায় আর manual cosine similarity এর বদলে vector database ব্যবহার করা হয়।

---

## সংক্ষেপে

- **Language Models** টেক্সট generate করে — Chat Models এখন industry standard
- **Provider পরিবর্তন করা সহজ** — code structure প্রায় একই থাকে
- **Open source route** আছে Hugging Face দিয়ে — cost বাঁচাতে বা privacy এর জন্য
- **Embedding Models** টেক্সটকে vector এ রূপান্তর করে semantic search এর জন্য — এটাই RAG এর ভিত্তি

## পরবর্তী ধাপ

এরপর যাও [Prompt Templates](/langchain/prompt-templates) পেজে — model কে কীভাবে সঠিকভাবে prompt পাঠাতে হয় সেটা শিখতে।

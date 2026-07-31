---
title: Core Components Overview
---
# LangChain এর ৬টি Core Component

LangChain মূলত ৬টি core component নিয়ে গঠিত। প্রতিটা component কী কাজ করে এবং একটা আরেকটার সাথে কীভাবে যুক্ত — এটা বুঝলে বাকি পুরো ডকুমেন্টেশন (Prompt Templates, Chains, Memory, Agents ইত্যাদি) পড়া অনেক সহজ হয়ে যাবে, কারণ এরপরের প্রতিটা topic আসলে এই ৬টার একটার detail explanation।

এই পেজটা একদম **conceptual overview** — কোনো কোড নেই এখানে। প্রতিটা component নিয়ে আলাদা, বিস্তারিত পেজ পরে আসবে working code সহ।

## বড় ছবি (Big Picture)

![Core Components](public/images/langchain/Core_components.png)

```
Models      → AI-এর মূল মস্তিষ্ক (LLM এবং embedding model)
Prompts     → model কে কী পাঠাচ্ছো
Chains      → একাধিক ধাপ কীভাবে একসাথে যুক্ত হচ্ছে
Indexes     → model কীভাবে তোমার নিজের ডেটা access করবে
Memory      → আগের কথোপকথন কীভাবে মনে রাখবে
Agents      → model কীভাবে সিদ্ধান্ত নেয় কী action নিতে হবে
```

প্রতিটা LangChain application আসলে এই ৬টা জিনিসের কোনো না কোনো combination।

---

## ১. Models

Models হলো তোমার code আর actual AI provider (OpenAI, Anthropic, Google ইত্যাদি) এর মাঝের interface layer। LangChain এই interface-টা standardize করে দেয়, ফলে provider বদলালে পুরো application নতুন করে লিখতে হয় না।

এখানে দুই ধরনের model আছে:

| ধরন                     | Input → Output                        | কোথায় ব্যবহার হয়   |
| -------------------------- | -------------------------------------- | ------------------------------------ |
| **Language Models**  | Text ইনপুট → Text আউটপুট   | Chat, summarization, text generation |
| **Embedding Models** | Text ইনপুট → Vector আউটপুট | Semantic search, RAG retrieval       |

যেহেতু দুই ধরনের model-ই একই standard interface follow করে, `ChatOpenAI` দিয়ে লেখা code আর `ChatAnthropic` দিয়ে লেখা code প্রায় একই রকম দেখতে — শুধু import আর constructor বদলায়।

> বিস্তারিত পাবে [Chat Models](/langchain/chat-models) এবং [Embeddings](/langchain/embeddings) পেজে।

---

## ২. Prompts

LLM এর output কেমন হবে সেটা অনেকখানি নির্ভর করে input কীভাবে লেখা হচ্ছে তার উপর। Prompts component তোমাকে সেই input reliably বানানোর টুলস দেয় — যেন প্রতিবার raw string hardcode করতে না হয়।

মূল সুবিধাগুলো:

- **Dynamic template** — একটা reusable prompt structure এ variable বসানো
- **Role-based prompt** — system instruction আর user input আলাদা রাখা (chat model এর জন্য গুরুত্বপূর্ণ)
- **Few-shot prompting** — আসল প্রশ্ন করার আগে model কে কিছু example দেখিয়ে দেওয়া, যাতে সে pattern বুঝে নেয়

> বিস্তারিত পাবে [Prompt Templates](/langchain/prompt-templates) পেজে।

---

## ৩. Chains

Chains হলো এই framework-এর নামের উৎস — এটা একাধিক component কে এমনভাবে যুক্ত করে যে এক ধাপের output পরের ধাপের input হয়ে যায়। এটাই আলাদা আলাদা building block কে একটা কার্যকর pipeline এ পরিণত করে।

Chain তিনভাবে চলতে পারে:

- **Sequentially** — একটার পর একটা ধাপ
- **Parallel এ** — একসাথে একাধিক independent ধাপ চলে, শেষে merge হয়
- **Conditionally** — input অনুযায়ী আলাদা path বেছে নেয়

> বিস্তারিত পাবে [LCEL](/langchain/langchain-expression-language) এবং [Chains](/langchain/chains) পেজে।

---

## ৪. Indexes

Indexes তোমার application কে বাইরের ডেটার সাথে যুক্ত করে — PDF, website, internal database — যেকোনো কিছু যা model আগে থেকে জানে না। এটাই RAG (Retrieval-Augmented Generation) এর মূল ভিত্তি।

Indexes আসলে চারটা sub-tool একসাথে কাজ করে:

| Sub-component              | কাজ                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Document Loaders** | PDF, website, database থেকে raw content নিয়ে আসা                                                       |
| **Text Splitters**   | বড় document কে ছোট ছোট chunk এ ভাগ করা                                                           |
| **Vector Stores**    | chunk গুলোকে embedding হিসেবে সংরক্ষণ করা যাতে দ্রুত semantic search করা যায় |
| **Retrievers**       | নির্দিষ্ট query এর জন্য সবচেয়ে relevant chunk খুঁজে বের করা                       |

> বিস্তারিত পাবে [Vector Stores](/langchain/vector-stores), [Retrievers](/langchain/retrievers), এবং [RAG](/langchain/rag) পেজে।

---

## ৫. Memory

LLM API call by default stateless — প্রতিটা call independent, এবং তুমি আগের history নিজে থেকে পাঠিয়ে না দিলে model আগের কথা কিছুই মনে রাখবে না। Memory component এটাই manage করে।

সাধারণ পদ্ধতি:

- **Conversation Buffer Memory** — পুরো conversation history সংরক্ষণ করে প্রতি call এ পাঠানো
- **Summarization Memory** — conversation বড় হয়ে গেলে পুরোনো অংশ সংক্ষেপ (summary) করে context জায়গা বাঁচানো

> বিস্তারিত পাবে [Memory](/langchain/memory) পেজে।

---

## ৬. Agents

Agents সবচেয়ে advanced component — এটা model এর reasoning ক্ষমতাকে বাইরের tool (search, calculator, API, custom function) এর সাথে যুক্ত করে। শুধু text generate করার বদলে, agent নিজে সিদ্ধান্ত নেয় কাজটা সম্পন্ন করতে **কী কী action** নিতে হবে — প্রয়োজনে একাধিক ধাপে।

এটাই সেই পরিবর্তন — "শুধু প্রশ্নের উত্তর দেওয়া chatbot" থেকে "নিজে থেকে কাজ করতে পারা system" এ যাওয়া।

> বিস্তারিত পাবে [Tools](/langchain/tools), [Tool Calling](/langchain/tool-calling), এবং [Agents](/langchain/agents) পেজে।

---

## বাস্তব App এ এই ৬টা কীভাবে একসাথে কাজ করে

একটা সাধারণ RAG-ভিত্তিক chatbot প্রায় সবগুলো component ব্যবহার করে:

1. **Indexes** থেকে relevant তথ্যের chunk খুঁজে বের করা হয়
2. **Prompts** সেই chunk গুলো আর user এর প্রশ্ন একসাথে format করে
3. **Models** response generate করে
4. **Chains** ১-৩ নম্বর ধাপগুলো একসাথে জোড়ে
5. **Memory** conversation টা চলমান রাখে
6. **Agents** (যদি দরকার হয়) সিদ্ধান্ত নেয় উত্তর দেওয়ার আগে কোনো tool call লাগবে কিনা

এই ৬টা component মাথায় রেখে বাকি ডকুমেন্টেশন পড়লে প্রতিটা নতুন topic কেন আছে এবং পুরো ছবির কোথায় fit করছে — সেটা বুঝতে অনেক সহজ হবে।

## পরবর্তী ধাপ

এরপর যাও [Installation](/langchain/installation) পেজে environment সেটআপ করতে, তারপর sidebar এর order অনুযায়ী একটা একটা করে component শেখা শুরু করো।

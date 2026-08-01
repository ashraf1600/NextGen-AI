---
title: Memory
---

# Memory — LangChain এর ৫ম Core Component

LLM API call স্বাভাবিকভাবেই **stateless** — প্রতিটা call সম্পূর্ণ independent, model এর কোনো ধারণাই থাকে না আগে কী কথা হয়েছিল। **Memory** component এই সমস্যার সমাধান করে — এটা conversation কে "মনে রাখা" সম্ভব করে তোলে, যাতে একটা chatbot বা agent একাধিক turn জুড়ে প্রসঙ্গ (context) বজায় রাখতে পারে।

## Memory এর ৩টা মূল ধরন

```
                    ┌───────────┐
                    │  Memory   │
                    └─────┬─────┘
          ┌───────────────┼───────────────────┐
          ▼               ▼                   ▼
  ┌───────────────┐ ┌─────────────┐  ┌──────────────────┐
  │  Short Term    │ │  Long Term  │  │ ChatMessageHistory│
  └───────────────┘ └─────────────┘  └──────────────────┘
```

---

## কেন Memory দরকার?

```python
# Memory ছাড়া — প্রতিটা call independent
response1 = model.invoke("আমার নাম রহিম।")
response2 = model.invoke("আমার নাম কী?")
# model জানবে না — কারণ আগের turn এর কোনো ধারণাই তার নেই
```

Memory ছাড়া প্রতিটা `.invoke()` call একটা নতুন, সম্পূর্ণ আলাদা কথোপকথন হিসেবে গণ্য হয়। Multi-turn conversation বানাতে হলে — যেমন customer support bot, personal assistant — আগের কথোপকথন মনে রাখা অপরিহার্য।

---

## ১. Short Term Memory

Short Term Memory মানে **চলমান একটা single conversation session** এর মধ্যে কথোপকথন মনে রাখা। এটা সাধারণত সেই session শেষ হয়ে গেলে (browser বন্ধ করলে, বা program শেষ হলে) হারিয়ে যায় — persist করে না।

সহজ ভাষায়: এটা মানুষের "working memory" এর মতো — এই মুহূর্তের কথোপকথন মনে থাকে, কিন্তু আগামীকাল আবার নতুন session শুরু হলে কিছুই মনে থাকে না।

```python
from langchain_core.messages import HumanMessage, AIMessage

conversation_history = [
    HumanMessage(content="আমার নাম রহিম।"),
]

response = model.invoke(conversation_history)
conversation_history.append(AIMessage(content=response.content))

conversation_history.append(HumanMessage(content="আমার নাম কী?"))
response2 = model.invoke(conversation_history)
print(response2.content)  # "তোমার নাম রহিম।" — এবার মনে আছে
```

এখানে পুরো `conversation_history` list টাই প্রতিবার model এ পাঠানো হচ্ছে — এটাই সবচেয়ে সাধারণ Short Term Memory এর পদ্ধতি।

---

## ২. Long Term Memory

Long Term Memory মানে তথ্য **একটা single session এর বাইরেও** সংরক্ষিত থাকে — অর্থাৎ, user আজকে কথা বলল, কাল আবার ফিরে এলো, তাও আগের গুরুত্বপূর্ণ তথ্য (পছন্দ, ব্যক্তিগত বিবরণ, আগের সিদ্ধান্ত) মনে থাকে।

এটা সাধারণত কোনো external storage (database, vector store) এ সংরক্ষণ করে বাস্তবায়ন করা হয় — session শেষ হয়ে গেলেও ডেটা হারায় না।

```
Short Term Memory:              Long Term Memory:
┌─────────────────┐            ┌──────────────────────┐
│ শুধু এই session   │            │  Database/VectorStore  │
│ এর মধ্যে মনে থাকে │            │  এ persist করা থাকে   │
│ (RAM এ)          │            │  (session শেষ হলেও    │
└─────────────────┘            │   টিকে থাকে)          │
                                └──────────────────────┘
```

```python
# ধারণাগত উদাহরণ — user এর পছন্দ database এ সংরক্ষণ ও পুনরুদ্ধার
def save_user_preference(user_id, key, value):
    database.set(f"{user_id}:{key}", value)

def get_user_preferences(user_id):
    return database.get_all(f"{user_id}:*")

# পরবর্তী session এ, প্রথমেই আগের পছন্দ লোড করে নেওয়া হয়
preferences = get_user_preferences("user_123")
# {"পছন্দের ভাষা": "বাংলা", "আগ্রহ": "প্রযুক্তি"}
```

### কখন Long Term Memory দরকার

- Personal assistant যেটা user কে বারবার নতুন করে পরিচয় করাতে হয় না
- Customer support bot যেটা একজন user এর আগের সব ticket/complaint মনে রাখে
- Personalized recommendation system যেটা user এর দীর্ঘমেয়াদী পছন্দ মনে রাখে

---

## ৩. ChatMessageHistory

`ChatMessageHistory` হলো LangChain এর একটা নির্দিষ্ট class/abstraction, যেটা conversation এর message গুলো (Human/AI) structured ভাবে সংরক্ষণ ও পরিচালনা করার একটা standard পদ্ধতি দেয় — এটাই সাধারণত Short Term এবং Long Term — দুই ধরনের memory implement করার জন্য ভিত্তি হিসেবে ব্যবহৃত হয়।

```python
from langchain_core.chat_history import InMemoryChatMessageHistory

history = InMemoryChatMessageHistory()

history.add_user_message("আমার নাম রহিম।")
history.add_ai_message("সুপ্রভাত রহিম! কীভাবে সাহায্য করতে পারি?")
history.add_user_message("আমার নাম কী মনে আছে?")

print(history.messages)
# [HumanMessage(...), AIMessage(...), HumanMessage(...)]
```

### Chain এর সাথে যুক্ত করা — `RunnableWithMessageHistory`

`ChatMessageHistory` কে সরাসরি একটা chain এর সাথে যুক্ত করে automatic ভাবে history management করানো যায়:

```python
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import InMemoryChatMessageHistory

store = {}

def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

chain_with_history = RunnableWithMessageHistory(
    chain,  # তোমার prompt | model chain
    get_session_history,
    input_messages_key="question",
    history_messages_key="chat_history"
)

response = chain_with_history.invoke(
    {"question": "আমার নাম রহিম।"},
    config={"configurable": {"session_id": "user_123"}}
)
```

`session_id` দিয়ে প্রতিটা user/conversation আলাদা রাখা হয় — একজন user এর history আরেকজনের সাথে মিশে যায় না।

### Persistent Storage এর সাথে ChatMessageHistory

Production application এ `InMemoryChatMessageHistory` এর বদলে database-backed history ব্যবহার করা হয়, যাতে server restart হলেও data হারিয়ে না যায়:

```python
from langchain_community.chat_message_histories import RedisChatMessageHistory

def get_session_history(session_id: str):
    return RedisChatMessageHistory(session_id=session_id, url="redis://localhost:6379")
```

Redis ছাড়াও PostgreSQL, MongoDB, DynamoDB সহ আরও অনেক backend LangChain community তে সাপোর্ট করা হয় — যেটাই ব্যবহার করা হোক, `ChatMessageHistory` এর interface একই থাকে।

---

## তিনটার তুলনা

| ধরন | কোথায় সংরক্ষিত থাকে | কতক্ষণ টিকে থাকে | ব্যবহার |
|---|---|---|---|
| **Short Term Memory** | RAM/session এর মধ্যে | শুধু চলমান session | Single conversation এর মধ্যে প্রসঙ্গ ধরে রাখা |
| **Long Term Memory** | External storage (DB/VectorStore) | Session শেষ হয়ে গেলেও টিকে থাকে | Personalization, একাধিক session জুড়ে তথ্য মনে রাখা |
| **ChatMessageHistory** | নির্দিষ্ট backend অনুযায়ী (Memory/Redis/DB) | Backend অনুযায়ী নির্ভর করে | Short ও Long — দুই ধরনের memory implement করার standard পদ্ধতি |

---

## সংক্ষেপে

- LLM API call by default stateless — Memory component এটাকে stateful করে তোলে
- **Short Term Memory** — একটা session এর মধ্যেই সীমাবদ্ধ, session শেষে হারিয়ে যায়
- **Long Term Memory** — session এর বাইরেও টিকে থাকে, external storage এ persist করা হয়
- **ChatMessageHistory** — LangChain এর standard abstraction, যেটা দিয়ে উভয় ধরনের memory ব্যবহারিকভাবে implement করা হয়
- `RunnableWithMessageHistory` ব্যবহার করে যেকোনো chain এ automatic session-based history management যুক্ত করা যায়
- Production এ `InMemoryChatMessageHistory` এর বদলে Redis/DB-backed history ব্যবহার করা উচিত, যাতে data persist করে

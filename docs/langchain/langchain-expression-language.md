---
title: LangChain Expression Language (LCEL)
---

LCEL হলো `|` (pipe) সিম্বল ব্যবহার করে LangChain এর বিভিন্ন component কে একসাথে যুক্ত করার পদ্ধতি। এটা LangChain এর সবচেয়ে গুরুত্বপূর্ণ concept — কারণ প্রায় প্রতিটা বাস্তব application ভিতরে ভিতরে এই একই পদ্ধতিতে গঠিত।

## মূল ধারণা

দুইটা `Runnable` অবজেক্টকে `|` দিয়ে যুক্ত করলে, বাম পাশের output ডান পাশের input হয়ে যায় — ঠিক যেমন terminal এ command pipe করা হয়।

```python
chain = prompt | model | parser
```

এটা পড়তে হবে এভাবে: *"prompt নাও, সেটা model এ পাঠাও, তারপর model এর output parser এ পাঠাও।"*

---

## প্রথম Chain বানানো

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_template(
    "'{text}' এই বাক্যটা {language} ভাষায় অনুবাদ করো।"
)
model = ChatOpenAI(model="gpt-4o")
parser = StrOutputParser()

chain = prompt | model | parser

result = chain.invoke({"text": "শুভ সকাল", "language": "ইংরেজি"})
print(result)
```

লক্ষ্য করো — `prompt`, `model`, `parser` প্রতিটাই আলাদা, independent component। পরে চাইলে শুধু `parser` বদলে দিলেই output format বদলে যাবে, বাকি chain একই থাকবে। এভাবেই একটা component পরিবর্তন করলে বাকি chain এ হাত দেওয়া লাগে না।

---

## Chain চালানোর ৪টা পদ্ধতি

LCEL দিয়ে বানানো যেকোনো chain — ভেতরে যাই থাকুক না কেন — একই চারটা method সাপোর্ট করে:

| Method | কাজ |
| --- | --- |
| `.invoke(input)` | একবার চালিয়ে সম্পূর্ণ result রিটার্ন করে |
| `.stream(input)` | output ধীরে ধীরে token-by-token আকারে দেয় |
| `.batch([input1, input2])` | একাধিক input একসাথে parallel এ চালায় |
| `.ainvoke(input)` | `.invoke()` এর async ভার্সন |

### Streaming উদাহরণ

```python
for chunk in chain.stream({"text": "ধন্যবাদ", "language": "ফরাসি"}):
    print(chunk, end="", flush=True)
```

গুরুত্বপূর্ণ বিষয় হলো — streaming, batching এর জন্য তোমাকে **আলাদা কোনো কোড লিখতে হচ্ছে না**। প্রতিটা component `Runnable` ইন্টারফেস ইমপ্লিমেন্ট করে বলেই এই সুবিধাগুলো chain বানানোর সাথে সাথেই ফ্রি পেয়ে যাও।

---

## একসাথে একাধিক ধাপ চালানো — RunnableParallel

যখন একাধিক independent কাজ একসাথে চালিয়ে শেষে ফলাফল merge করতে হয়, তখন `RunnableParallel` ব্যবহার করা হয়।

```python
from langchain_core.runnables import RunnableParallel

parallel_chain = RunnableParallel(
    translation=prompt | model | parser,
    word_count=lambda x: len(x["text"].split())
)

result = parallel_chain.invoke({"text": "শুভ সকাল", "language": "বাংলা"})
# {'translation': '...', 'word_count': 2}
```

এখানে `translation` আর `word_count` দুটোই একসাথে চলছে, একটা আরেকটার জন্য অপেক্ষা করছে না।

---

## শর্তসাপেক্ষ লজিক — RunnableBranch

Chain এর ভিতরে "যদি এমন হয়, তাহলে এটা করো" ধরনের লজিকের জন্য:

```python
from langchain_core.runnables import RunnableBranch

branch = RunnableBranch(
    (lambda x: x["language"] == "বাংলা", bangla_chain),
    (lambda x: x["language"] == "ফরাসি", french_chain),
    default_chain  # কোনো শর্ত মিলল না হলে এটা চলবে
)
```

প্রতিটা condition (lambda function, chain) জোড়া আকারে দেওয়া হয় — প্রথম যে condition true হবে, সেই chain টা চলবে। কোনোটাই না মিললে সবশেষে দেওয়া `default_chain` চলে।

---

## Input ধরে রাখা — RunnablePassthrough

অনেক সময় একটা transform করা value এর পাশাপাশি original input ও পরের ধাপে পাঠাতে হয় — যেমন RAG pipeline এ, retrieved context এর পাশাপাশি user এর আসল প্রশ্নও prompt এ দরকার হয়।

```python
from langchain_core.runnables import RunnablePassthrough

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | parser
)
```

এখানে `question` অপরিবর্তিত অবস্থায় সরাসরি চলে যাচ্ছে, আর `context` retriever দিয়ে populate হচ্ছে — দুটো variable-ই পরের prompt ধাপে একসাথে পাওয়া যাচ্ছে।

---

## এটা কেন গুরুত্বপূর্ণ

LangChain এর আগের ভার্সনে `LLMChain`, `SequentialChain` এর মতো ক্লাস ব্যবহার করতে হতো, যেখানে subclassing আর অনেক boilerplate কোড লিখতে হতো। LCEL সেই পুরনো পদ্ধতি প্রতিস্থাপন করেছে — এখন chain মানেই সাধারণ Python অবজেক্ট, যেগুলো `|` অপারেটর দিয়ে যুক্ত করা হয়। ফলাফল:

- কোড পড়তে সহজ
- Debug করা সহজ
- প্রতিটা chain automatic ভাবে streaming, batching, async সাপোর্ট পায় — কোনো extra কাজ ছাড়াই

---

## সংক্ষেপে

- `|` অপারেটর দিয়ে component একসাথে যুক্ত করা হয় — বাম দিকের output ডান দিকের input হয়ে যায়
- প্রতিটা LCEL chain এ `.invoke()`, `.stream()`, `.batch()`, `.ainvoke()` — এই চারটা method একইভাবে কাজ করে
- `RunnableParallel` — একসাথে একাধিক ধাপ চালানোর জন্য
- `RunnableBranch` — শর্তসাপেক্ষ লজিকের জন্য
- `RunnablePassthrough` — original input পরের ধাপে অপরিবর্তিতভাবে পাঠানোর জন্য

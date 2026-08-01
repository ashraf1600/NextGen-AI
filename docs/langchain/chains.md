---
title: Chains
---

# Chains

Chain হলো LangChain এর নামের মূল উৎস। এটা একাধিক processing step — যেমন prompt design, model call, output parsing — কে একসাথে যুক্ত করে একটা automated pipeline বানায়। এই পেজে আমরা চার ধরনের chain দেখব: Simple, Sequential, Parallel, এবং Conditional।

---

## Chain কী এবং কেন দরকার?

একটা মাত্র LLM call দিয়ে সাধারণ কাজ চলে যায়, কিন্তু বাস্তব application এ প্রায়ই একাধিক ধাপ লাগে — prompt বানানো, model কে পাঠানো, তারপর output কে ব্যবহারযোগ্য format এ আনা। প্রতিবার এই ধাপগুলো আলাদাভাবে manual কোড লিখে করার বদলে, Chain এই পুরো প্রবাহটাকে একটা single, reusable pipeline এ পরিণত করে।

```
┌────────┐    ┌───────┐    ┌────────┐
│ Prompt │ -> │ Model │ -> │ Parser │
└────────┘    └───────┘    └────────┘
     এক ধাপের output → পরের ধাপের input
```

---

## ১. Simple Chain

সবচেয়ে সাধারণ chain — একটা prompt, একটা model, এবং একটা parser, `|` (pipe) অপারেটর দিয়ে যুক্ত।

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_template("{topic} নিয়ে একটা মজার তথ্য বলো।")
model = ChatOpenAI(model="gpt-4o")
parser = StrOutputParser()

chain = prompt | model | parser

result = chain.invoke({"topic": "মহাকাশ"})
print(result)
```

```
Diagram:

  {"topic": "মহাকাশ"}
          │
          ▼
     [ Prompt ]
          │
          ▼
     [  Model  ]
          │
          ▼
     [  Parser ]
          │
          ▼
   চূড়ান্ত টেক্সট output
```

এটাই সবকিছুর ভিত্তি — বাকি সব chain এই একই basic building block এর উপর ভিত্তি করেই তৈরি।

---

## ২. Sequential Chain

Sequential Chain মানে একাধিক ধাপ পরপর চলবে, যেখানে **এক ধাপের সম্পূর্ণ output পরের ধাপের input** হিসেবে ব্যবহৃত হবে। এটা তখন দরকার যখন একটা কাজ সরাসরি এক ধাপে করা কঠিন — যেমন প্রথমে একটা বিস্তারিত রিপোর্ট বানানো, তারপর সেই রিপোর্ট সংক্ষেপ করা।

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

model = ChatOpenAI(model="gpt-4o")
parser = StrOutputParser()

# ধাপ ১: বিস্তারিত রিপোর্ট বানানো
report_prompt = ChatPromptTemplate.from_template(
    "{topic} বিষয়ে একটা বিস্তারিত রিপোর্ট লেখো।"
)

# ধাপ ২: সেই রিপোর্ট সংক্ষেপ করা
summary_prompt = ChatPromptTemplate.from_template(
    "নিচের রিপোর্টটা ৩ লাইনে সংক্ষেপ করো:\n\n{report}"
)

sequential_chain = (
    report_prompt
    | model
    | parser
    | (lambda report: {"report": report})
    | summary_prompt
    | model
    | parser
)

result = sequential_chain.invoke({"topic": "নবায়নযোগ্য জ্বালানি"})
print(result)
```

```
Diagram:

  {"topic": "..."}
        │
        ▼
  [Report Prompt] -> [Model] -> [Parser]
        │
        ▼
  পূর্ণ রিপোর্ট (দীর্ঘ টেক্সট)
        │
        ▼
  [Summary Prompt] -> [Model] -> [Parser]
        │
        ▼
  সংক্ষিপ্ত ৩ লাইনের সারাংশ
```

লক্ষ্য করো — প্রথম chain এর সম্পূর্ণ output (`report`) দ্বিতীয় prompt এর input variable হিসেবে ব্যবহার হচ্ছে। মাঝখানে `lambda` দিয়ে output কে dictionary আকারে রূপান্তর করা হয়েছে, যাতে পরের `ChatPromptTemplate` সঠিকভাবে variable বসাতে পারে।

---

## ৩. Parallel Chain

Parallel Chain ব্যবহার করা হয় যখন একই source থেকে **একাধিক independent কাজ একসাথে** করতে হয় — একটা আরেকটার জন্য অপেক্ষা করে না। উদাহরণ: একই টেক্সট থেকে একসাথে নোট বানানো এবং কুইজ প্রশ্ন তৈরি করা।

```python
from langchain_core.runnables import RunnableParallel
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

model = ChatOpenAI(model="gpt-4o")
parser = StrOutputParser()

notes_prompt = ChatPromptTemplate.from_template(
    "নিচের টেক্সট থেকে সংক্ষিপ্ত নোট বানাও:\n\n{text}"
)
quiz_prompt = ChatPromptTemplate.from_template(
    "নিচের টেক্সট থেকে ৩টা কুইজ প্রশ্ন বানাও:\n\n{text}"
)

parallel_chain = RunnableParallel(
    notes=notes_prompt | model | parser,
    quiz=quiz_prompt | model | parser,
)

result = parallel_chain.invoke({"text": "সালোকসংশ্লেষণ প্রক্রিয়া নিয়ে একটা বিস্তারিত অনুচ্ছেদ..."})
print(result["notes"])
print(result["quiz"])
```

```
Diagram:

                {"text": "..."}
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
 [Notes Prompt] -> [Model]   [Quiz Prompt] -> [Model]
        │                           │
        └─────────────┬─────────────┘
                      ▼
          {"notes": "...", "quiz": "..."}
```

দুটো branch **একই সাথে** চলে (sequential না), এবং শেষে একটা single dictionary তে merge হয়ে যায় — প্রতিটা key এর সাথে তার নিজস্ব result যুক্ত থাকে।

---

## ৪. Conditional Chain

Conditional Chain হলো chain এর ভিতরে `if-else` এর মতো লজিক — যেখানে model এর output অনুযায়ী পরবর্তী পথ বদলে যায়। এটা `RunnableBranch` দিয়ে implement করা হয়। সাধারণ উদাহরণ: sentiment অনুযায়ী feedback কে ভিন্ন ভিন্ন response এ route করা।

```python
from langchain_core.runnables import RunnableBranch
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

model = ChatOpenAI(model="gpt-4o")
parser = StrOutputParser()

# ধাপ ১: sentiment বের করা
class Sentiment(BaseModel):
    sentiment: str = Field(description="'positive' অথবা 'negative'")

sentiment_prompt = ChatPromptTemplate.from_template(
    "এই ফিডব্যাকের sentiment বের করো: {feedback}"
)
sentiment_chain = sentiment_prompt | model.with_structured_output(Sentiment)

# ধাপ ২: sentiment অনুযায়ী আলাদা response
positive_prompt = ChatPromptTemplate.from_template(
    "একটা ধন্যবাদসূচক reply লেখো এই positive feedback এর জন্য: {feedback}"
)
negative_prompt = ChatPromptTemplate.from_template(
    "একটা সহানুভূতিশীল, সমস্যা সমাধানমুখী reply লেখো এই negative feedback এর জন্য: {feedback}"
)

branch_chain = RunnableBranch(
    (lambda x: x["sentiment"] == "positive", positive_prompt | model | parser),
    negative_prompt | model | parser  # default (else) branch
)

# ধাপ ৩: দুইটা chain যুক্ত করা
full_chain = sentiment_chain | (lambda result: {
    "sentiment": result.sentiment,
    "feedback": "প্রোডাক্টটা একদম চমৎকার, খুব দ্রুত ডেলিভারি পেয়েছি!"
}) | branch_chain

result = full_chain.invoke({"feedback": "প্রোডাক্টটা একদম চমৎকার, খুব দ্রুত ডেলিভারি পেয়েছি!"})
print(result)
```

```
Diagram:

           {"feedback": "..."}
                    │
                    ▼
         [Sentiment Detection Chain]
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
    sentiment ==        sentiment ==
    "positive"?          "negative"?
          │                   │
          ▼                   ▼
   [Positive Reply       [Negative Reply
      Prompt]                Prompt]
          │                   │
          └─────────┬─────────┘
                    ▼
              চূড়ান্ত response
```

`RunnableBranch` এ প্রতিটা condition একটা `(lambda, chain)` জোড়া হিসেবে দেওয়া হয় — যে condition প্রথম `True` হবে, সেই chain টাই চলবে। সবশেষে একটা default chain দেওয়া হয়, যেটা কোনো condition না মিললে চলে (এখানে `negative_prompt`)।

---

## চারটার তুলনা — কখন কোনটা ব্যবহার করবে

| Chain Type | কাঠামো | ব্যবহার |
|---|---|---|
| **Simple Chain** | একটাই সরল লাইন (prompt → model → parser) | একটা মাত্র ধাপে কাজ শেষ হলে |
| **Sequential Chain** | এক ধাপের output পরের ধাপের input | কাজ একাধিক ধাপে ভেঙে করা দরকার হলে (যেমন: রিপোর্ট → সারাংশ) |
| **Parallel Chain** | একই input থেকে একাধিক independent output | একই source থেকে ভিন্ন ভিন্ন কাজ একসাথে করতে হলে |
| **Conditional Chain** | Output অনুযায়ী ভিন্ন পথ বেছে নেওয়া | Logic অনুযায়ী রাউটিং দরকার হলে (if-else এর মতো) |

---

## সংক্ষেপে

- Chain একাধিক ধাপকে একসাথে যুক্ত করে একটা automated pipeline বানায়
- **Simple Chain** — মূল building block, বাকি সব এর উপর ভিত্তি করে তৈরি
- **Sequential Chain** — এক ধাপের output পরের ধাপে যায়, জটিল multi-step task এর জন্য
- **Parallel Chain** (`RunnableParallel`) — একসাথে একাধিক independent কাজ, দ্রুততর execution
- **Conditional Chain** (`RunnableBranch`) — output অনুযায়ী আলাদা পথে যাওয়া, if-else এর মতো লজিক
- এই patternগুলো ভালোভাবে বুঝলে পরে **Agent** বানানো অনেক সহজ হয়ে যাবে, কারণ agent আসলে এই একই building block গুলোরই আরও জটিল সংমিশ্রণ

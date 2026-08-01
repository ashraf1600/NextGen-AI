---
title: Runnables
---

# Runnables — LangChain এর Standardized Interface

এই পেজে আমরা দেখব **Runnable** কী, কেন এটার প্রয়োজন হলো, এবং LangChain এর ৫টা মূল Runnable Primitive (Sequence, Parallel, Passthrough, Lambda, Branch) কীভাবে কাজ করে। এই concept বুঝলে LCEL (`|` operator) কেন এভাবে কাজ করে সেটা পরিষ্কার হয়ে যাবে।

---

## Runnable কেন দরকার হলো?

### আগে সমস্যা কী ছিল

LangChain এর শুরুর দিকে, প্রতিটা component (LLM, Prompt Template, Parser) আলাদা আলাদা ভাবে বানানো হতো, এবং এদের মধ্যে সংযোগ করার জন্য কোনো standard পদ্ধতি ছিল না। ফলে:

- প্রতিটা নতুন component যুক্ত করতে custom, জটিল কোড লিখতে হতো
- একটা component এর output আরেকটার input এ ঠিকমতো বসানোর জন্য বারবার নতুন করে "glue code" লিখতে হতো
- Codebase ধীরে ধীরে ভারী (bloated) হয়ে যাচ্ছিল এবং নতুন কেউ শিখতে গেলে অনেক সময় লাগত (steep learning curve)

```
আগে:

  [LLM Class A]  --- custom glue code ---  [Prompt Class B]
        │                                         │
        └──── আরেকটা আলাদা glue code ────  [Parser Class C]

প্রতিটা সংযোগ আলাদাভাবে, ম্যানুয়ালি বানাতে হতো
```

### সমাধান: একটা Standard Interface

LangChain টিম উপলব্ধি করল — যদি প্রতিটা component (LLM, Prompt, Parser, Retriever — সবকিছু) একই **common interface** মেনে চলে, তাহলে এদেরকে Lego block এর মতো সহজে একসাথে জোড়া লাগানো যাবে, প্রতিবার নতুন glue code লেখা লাগবে না।

এই common interface টার নামই **Runnable**।

```
এখন:

  [Prompt]  →  [Model]  →  [Parser]
  সবাই Runnable interface মেনে চলে,
  তাই সরাসরি | দিয়ে জোড়া লাগানো যায়
```

---

## Runnable আসলে কী?

**Runnable হলো একটা standardized "unit of work"** — অর্থাৎ, এমন একটা জিনিস যেটা একটা input নেয় এবং একটা output রিটার্ন করে, এবং এই কাজটা করার জন্য একটা নির্দিষ্ট method সবসময় থাকে: `.invoke()`।

LangChain এ Prompt Template, Chat Model, Output Parser, Retriever — এই সবগুলোই আসলে ভিতরে ভিতরে `Runnable` ইন্টারফেস implement করে। এই কারণেই এদের সবাইকে একই পদ্ধতিতে (`|` দিয়ে) একসাথে যুক্ত করা যায়।

### সরল উদাহরণ: নিজে থেকে একটা Runnable বানানো

Concept টা ভালোভাবে বোঝার জন্য, চলো নিজেরাই ছোট করে একটা custom Runnable-সদৃশ class বানাই:

```python
class SimplePromptTemplate:
    def __init__(self, template):
        self.template = template

    def invoke(self, input_dict):
        return self.template.format(**input_dict)


class SimpleLLM:
    def invoke(self, prompt_text):
        # বাস্তবে এখানে একটা actual LLM call হতো
        return f"Model থেকে উত্তর: {prompt_text}"


class SimpleChain:
    def __init__(self, prompt, llm):
        self.prompt = prompt
        self.llm = llm

    def invoke(self, input_dict):
        prompt_text = self.prompt.invoke(input_dict)
        return self.llm.invoke(prompt_text)


prompt = SimplePromptTemplate("তুমি কি {topic} সম্পর্কে বলতে পারবে?")
llm = SimpleLLM()
chain = SimpleChain(prompt, llm)

result = chain.invoke({"topic": "মহাকাশ"})
print(result)
```

লক্ষ্য করো — প্রতিটা class এ একটা করে `.invoke()` method আছে। এই common method থাকার কারণেই `SimpleChain` এর ভিতরে `prompt` আর `llm` কে একইভাবে ব্যবহার করা গেছে, যদিও তারা সম্পূর্ণ আলাদা কাজ করছে। **এটাই Runnable এর মূল ধারণা** — একই interface (`.invoke()`), ভিন্ন ভিন্ন কাজ।

LangChain এর আসল `Runnable` ক্লাস এরচেয়ে অনেক বেশি ফিচার সমৃদ্ধ (streaming, batching, async ইত্যাদি সাপোর্ট করে), কিন্তু মূল ধারণাটা একই।

---

## Runnable এর দুই ধরনের Component

LangChain এ Runnable কে মোটাদাগে দুই category তে ভাগ করা যায়:

| Category | কাজ | উদাহরণ |
|---|---|---|
| **Task-Specific Runnable** | নির্দিষ্ট একটা কাজ করে | Prompt Template, Chat Model, Output Parser |
| **Runnable Primitive** | একাধিক Runnable কে কীভাবে একসাথে চালানো/সাজানো হবে, সেটা নিয়ন্ত্রণ করে | RunnableSequence, RunnableParallel, RunnableBranch |

সহজ ভাষায় — Task-Specific Runnable গুলো হলো ইট (brick), আর Runnable Primitive গুলো হলো সেই ইটগুলো কীভাবে গাঁথা হবে তার নিয়ম।

---

## Runnable Primitive গুলো বিস্তারিত

### ১. RunnableSequence

দুই বা ততোধিক Runnable কে **পরপর, ক্রমানুসারে** চালায় — এক ধাপের output পরের ধাপের input হয়।

```python
from langchain_core.runnables import RunnableSequence
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template("{topic} নিয়ে একটা লাইন লেখো।")
model = ChatOpenAI(model="gpt-4o")
parser = StrOutputParser()

chain = RunnableSequence(prompt, model, parser)
# এটাই আসলে prompt | model | parser এর সমতুল্য

result = chain.invoke({"topic": "নদী"})
```

```
Diagram:

  Input → [Prompt] → [Model] → [Parser] → Output
```

`RunnableSequence` টা explicit ভাবে লেখা হলো এখানে, কিন্তু বাস্তবে সবাই `|` operator (LCEL) ব্যবহার করে, কারণ সেটা অনেক সংক্ষিপ্ত ও পড়তে সহজ।

---

### ২. RunnableParallel

একই input একসাথে একাধিক Runnable এ পাঠায়, এবং সবগুলোর output একটা dictionary আকারে ফেরত দেয়।

```python
from langchain_core.runnables import RunnableParallel

parallel = RunnableParallel(
    translation=translation_chain,
    summary=summary_chain,
)

result = parallel.invoke({"text": "কিছু ইনপুট টেক্সট"})
# {"translation": "...", "summary": "..."}
```

```
Diagram:

                Input
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
   [Chain A]            [Chain B]
        │                   │
        └─────────┬─────────┘
                  ▼
     {"a_result": ..., "b_result": ...}
```

---

### ৩. RunnablePassthrough

Input যা আছে সেটা **অপরিবর্তিতভাবে** পরের ধাপে পাঠিয়ে দেয়। মূলত ব্যবহার হয় যখন কোনো original data, transform না করেই পরের কোনো ধাপে দরকার হয় — যেমন RAG pipeline এ, retrieved context এর পাশাপাশি user এর মূল প্রশ্নও সাথে রাখা লাগে।

```python
from langchain_core.runnables import RunnablePassthrough

chain = RunnableParallel(
    context=retriever,
    question=RunnablePassthrough(),
)

result = chain.invoke("বাংলাদেশের রাজধানী কী?")
# {"context": [...retrieved docs...], "question": "বাংলাদেশের রাজধানী কী?"}
```

---

### ৪. RunnableLambda

তোমার নিজের লেখা যেকোনো Python function কে Runnable হিসেবে wrap করে দেয় — যাতে chain এর ভিতরে custom logic/preprocessing বসানো যায়।

```python
from langchain_core.runnables import RunnableLambda

def word_count(text: str) -> int:
    return len(text.split())

count_runnable = RunnableLambda(word_count)

chain = prompt | model | parser | count_runnable

result = chain.invoke({"topic": "নদী"})
print(result)  # model এর উত্তরের শব্দসংখ্যা
```

```
Diagram:

  [Prompt] → [Model] → [Parser] → [RunnableLambda(word_count)]
                                          │
                                          ▼
                                   শব্দসংখ্যা (integer)
```

এটা খুবই কাজে লাগে যখন LangChain এর built-in কোনো component দিয়ে কাজটা করা যায় না, কিন্তু নিজের সাধারণ Python function দিয়ে সহজেই করা যায়।

---

### ৫. RunnableBranch

Chain এর ভিতরে `if-else` এর মতো লজিক তৈরি করে — output বা condition অনুযায়ী আলাদা path এ চলে যায়। উদাহরণ: রিপোর্ট বড় হলে সেটা সংক্ষেপ করা, ছোট হলে যেমন আছে তেমন রাখা।

```python
from langchain_core.runnables import RunnableBranch, RunnableLambda

def is_long(text: str) -> bool:
    return len(text.split()) > 100

branch = RunnableBranch(
    (lambda text: is_long(text), summarize_chain),
    RunnableLambda(lambda text: text)  # default: ছোট হলে যেমন আছে তেমন রাখা
)
```

```
Diagram:

              Report Text
                   │
                   ▼
           length > 100 words?
             │             │
           হ্যাঁ            না
             │             │
             ▼             ▼
     [Summarize Chain]  [যেমন আছে তেমন রাখা]
             │             │
             └──────┬──────┘
                    ▼
              চূড়ান্ত output
```

---

## LCEL — কেন `|` অপারেটর ব্যবহার করা হয়

উপরে আমরা `RunnableSequence(prompt, model, parser)` এভাবে explicit ভাবে লিখেছি, কিন্তু বাস্তবে সবাই এটা লেখে:

```python
chain = prompt | model | parser
```

এই `|` syntax টাকেই বলা হয় **LCEL (LangChain Expression Language)** — এটা `RunnableSequence` এর জন্য একটা declarative, সংক্ষিপ্ত shortcut। দুটোই একই জিনিস তৈরি করে, কিন্তু `|` লেখা অনেক বেশি readable এবং কম বয়লারপ্লেট।

::: tip
বর্তমানে LCEL মূলত sequential chain (`|`) এর জন্যই মূল syntax — parallel বা branch এর জন্য এখনো `RunnableParallel` / `RunnableBranch` কে explicit ভাবেই কল করতে হয়। ভবিষ্যতে LangChain এই দুটোর জন্যও আরও সংক্ষিপ্ত declarative syntax আনতে পারে, তবে আপাতত এই পদ্ধতিই standard।
:::

---

## সংক্ষেপে

- **Runnable** হলো LangChain এর standardized "unit of work" — সব component একই `.invoke()` interface মেনে চলে বলেই এদের Lego block এর মতো জোড়া লাগানো যায়
- Runnable আসার আগে প্রতিটা component সংযোগ করতে custom glue code লিখতে হতো — যা codebase কে জটিল করে তুলছিল
- **Task-Specific Runnable** (Prompt, Model, Parser) নির্দিষ্ট কাজ করে; **Runnable Primitive** (Sequence, Parallel, Branch) ঠিক করে এই কাজগুলো কীভাবে একসাথে সাজানো হবে
- ৫টা মূল Runnable Primitive: **Sequence** (পরপর), **Parallel** (একসাথে), **Passthrough** (অপরিবর্তিত রাখা), **Lambda** (custom function wrap করা), **Branch** (শর্তসাপেক্ষ লজিক)
- **LCEL** (`|` operator) হলো `RunnableSequence` লেখার একটা সংক্ষিপ্ত, readable পদ্ধতি

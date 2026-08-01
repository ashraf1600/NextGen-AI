---
title: Output Parsers
---

# Output Parsers

LLM সবসময় raw, unstructured text রিটার্ন করে। কিন্তু আমরা যখন সেই output কে database এ সংরক্ষণ করতে চাই, API response হিসেবে পাঠাতে চাই, বা অন্য কোনো system এ ব্যবহার করতে চাই — তখন সেই raw text কে একটা নির্দিষ্ট, নির্ভরযোগ্য structure এ রূপান্তর করতে হয়। এই কাজটাই করে **Output Parser**।

## Output Parser এর কাজ — এক নজরে

```
┌─────────────┐     ┌───────────────┐     ┌──────────────────┐
│   LLM এর     │ --> │ Output Parser  │ --> │  Structured Data  │
│  Raw Text    │     │  (রূপান্তর করে) │     │  (JSON/Object)    │
└─────────────┘     └───────────────┘     └──────────────────┘
```

LangChain এ চার ধরনের প্রধান Output Parser আছে — সহজ থেকে সবচেয়ে robust পর্যন্ত। এই পেজে আমরা চারটাই বিস্তারিত দেখব।

---

## ১. String Output Parser

সবচেয়ে সহজ parser। এটা শুধু model এর response object থেকে plain text (`.content`) বের করে আনে।

### সমস্যা: Parser ছাড়া

```python
response = model.invoke("বাংলাদেশের রাজধানী কী?")
print(response)
# AIMessage(content='ঢাকা', additional_kwargs={...}, response_metadata={...})
```

Model সরাসরি একটা পুরো `AIMessage` object রিটার্ন করে — শুধু text চাইলেও পুরো object এর সাথে ডিল করতে হয়, এবং `.content` বারবার manually লিখতে হয়।

### সমাধান: `StrOutputParser`

```python
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("{question}")
model = ChatOpenAI(model="gpt-4o")
parser = StrOutputParser()

chain = prompt | model | parser

result = chain.invoke({"question": "বাংলাদেশের রাজধানী কী?"})
print(result)
# ঢাকা
```

এখন `result` একটা সাধারণ Python string — আলাদাভাবে `.content` অ্যাক্সেস করা লাগছে না।

### কখন ব্যবহার করবে

`StrOutputParser` সবচেয়ে বেশি কাজে লাগে যখন তুমি **Chain** বানাচ্ছো এবং পরের ধাপে plain text দরকার — যেমন, একটা chain এর output আরেকটা chain এর input হিসেবে ব্যবহার করার সময়।

---

## ২. JSON Output Parser

যখন model কে সরাসরি JSON format এ উত্তর দিতে বাধ্য করতে হয়, তখন `JsonOutputParser` ব্যবহার করা হয়। এটা দ্রুত data extraction এর জন্য উপযুক্ত, যেখানে খুব কড়া schema validation এর প্রয়োজন নেই।

```python
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate

parser = JsonOutputParser()

prompt = ChatPromptTemplate.from_template(
    "এই টেক্সট থেকে নাম আর বয়স JSON আকারে বের করো, key হবে 'name' আর 'age': {text}\n{format_instructions}"
).partial(format_instructions=parser.get_format_instructions())

chain = prompt | model | parser

result = chain.invoke({"text": "রহিমের বয়স ২৯ বছর।"})
print(result)
# {'name': 'রহিম', 'age': 29}
```

### `get_format_instructions()` কী করে

এই method automatic ভাবে একটা instruction text তৈরি করে দেয়, যেটা prompt এ inject করা হয় — এটাই model কে বুঝিয়ে দেয় ঠিক কোন format এ JSON রিটার্ন করতে হবে। নিজে থেকে এই instruction লিখতে হয় না।

### সীমাবদ্ধতা

`JsonOutputParser` valid JSON রিটার্ন করতে চেষ্টা করে, কিন্তু এটা field এর **type validation** করে না — যেমন `age` যদি model ভুল করে string হিসেবে পাঠায় (`"29"` এর বদলে `"ঊনত্রিশ"`), parser সেটা ধরতে পারবে না।

---

## ৩. Structured Output Parser

`StructuredOutputParser` তোমাকে prompt এর মধ্যেই একটা নির্দিষ্ট schema define করতে দেয় — field name এবং প্রতিটা field এর description সহ — যাতে model সেই নির্দিষ্ট structure মেনে উত্তর দেয়।

```python
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from langchain_core.prompts import ChatPromptTemplate

response_schemas = [
    ResponseSchema(name="name", description="ব্যক্তির নাম"),
    ResponseSchema(name="profession", description="ব্যক্তির পেশা"),
]

parser = StructuredOutputParser.from_response_schemas(response_schemas)

prompt = ChatPromptTemplate.from_template(
    "এই টেক্সট থেকে তথ্য বের করো: {text}\n{format_instructions}"
).partial(format_instructions=parser.get_format_instructions())

chain = prompt | model | parser

result = chain.invoke({"text": "করিম একজন সফটওয়্যার ইঞ্জিনিয়ার।"})
print(result)
# {'name': 'করিম', 'profession': 'সফটওয়্যার ইঞ্জিনিয়ার'}
```

### `JsonOutputParser` থেকে পার্থক্য

`JsonOutputParser` তুমি নিজে prompt এ বলে দাও কী key দরকার, কিন্তু `StructuredOutputParser` এ schema টা আলাদা, formal ভাবে (`ResponseSchema` দিয়ে) define করা হয় — যেটা বড় প্রজেক্টে schema পরিষ্কার ও maintain করা সহজ করে দেয়।

### সীমাবদ্ধতা

এটাও `JsonOutputParser` এর মতোই — **কোনো প্রকৃত type validation নেই**। শুধু field name আর description বলা যায়, কিন্তু data type (integer, boolean ইত্যাদি) জোরপূর্বক নিশ্চিত করা যায় না।

---

## ৪. Pydantic Output Parser (সবচেয়ে Robust)

`PydanticOutputParser` হলো সবচেয়ে শক্তিশালী পদ্ধতি — এটা শুধু structure না, বরং **প্রকৃত type validation** ও নিশ্চিত করে, Pydantic এর ক্ষমতা ব্যবহার করে।

```python
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

class Person(BaseModel):
    name: str = Field(description="ব্যক্তির নাম")
    age: int = Field(description="ব্যক্তির বয়স, অবশ্যই একটা সংখ্যা (integer) হতে হবে")

parser = PydanticOutputParser(pydantic_object=Person)

prompt = ChatPromptTemplate.from_template(
    "এই টেক্সট থেকে তথ্য বের করো: {text}\n{format_instructions}"
).partial(format_instructions=parser.get_format_instructions())

chain = prompt | model | parser

result = chain.invoke({"text": "রহিমের বয়স ২৯ বছর।"})
print(result)
# Person(name='রহিম', age=29)

print(result.age)       # 29 — সরাসরি integer হিসেবে ব্যবহারযোগ্য
print(type(result.age)) # <class 'int'>
```

### কেন এটা সবচেয়ে ভালো পছন্দ

- **প্রকৃত টাইপ ভ্যালিডেশন** — `age` যদি সংখ্যা না হয়ে অন্য কিছু আসে, Pydantic error তুলবে, silently ভুল data পাস করবে না
- **`.name`, `.age` আকারে attribute access** — dictionary এর মতো `result["age"]` না লিখে সরাসরি `result.age` লেখা যায়, code পড়তে সহজ হয়
- **Nested schema সাপোর্ট** — জটিল, একের মধ্যে আরেকটা structure থাকা data সহজেই define করা যায়
- **Production application এ সবচেয়ে বেশি নির্ভরযোগ্য**, কারণ ভুল data structure পেলে সেটা সাথে সাথে ধরা পড়ে, পরে database/API তে গিয়ে সমস্যা হয় না

---

## চারটার তুলনা — এক নজরে

| Parser | Type Validation | জটিলতা | কখন ব্যবহার করবে |
|---|---|---|---|
| **StrOutputParser** | নেই | সবচেয়ে সহজ | শুধু plain text দরকার, বিশেষত chain এর মাঝে |
| **JsonOutputParser** | নেই | সহজ | দ্রুত data extraction, কড়া validation দরকার নেই |
| **StructuredOutputParser** | নেই | মাঝারি | Schema আলাদাভাবে সংগঠিত রাখতে চাইলে |
| **PydanticOutputParser** | আছে (পূর্ণ) | একটু বেশি setup | Production application, robust data validation প্রয়োজন হলে |

::: tip সাধারণ নিয়ম
Prototype/experiment এর জন্য `JsonOutputParser` দিয়ে শুরু করা যায়, কিন্তু production এ যাওয়ার সময় সবসময় `PydanticOutputParser` এ upgrade করা উচিত — বিশেষ করে যদি সেই data database এ যাচ্ছে বা কোনো critical decision এর ভিত্তি হচ্ছে।
:::

---

## Open Source vs OpenAI Model এ ব্যবহার

Output Parser এর concept এবং code একই থাকে, model provider যাই হোক না কেন — শুধু model instantiate করার লাইনটা বদলায়:

```python
# OpenAI দিয়ে
from langchain_openai import ChatOpenAI
model = ChatOpenAI(model="gpt-4o")

# Hugging Face (Open Source) দিয়ে
from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace
llm = HuggingFaceEndpoint(repo_id="TinyLlama/TinyLlama-1.1B-Chat-v1.0", task="text-generation")
model = ChatHuggingFace(llm=llm)

# বাকি chain একই থাকে
chain = prompt | model | parser
```

::: warning
ছোট open-source model (যেমন TinyLlama) মাঝে মাঝে সঠিক format মেনে output দিতে ব্যর্থ হতে পারে, কারণ এদের instruction-following ক্ষমতা বড় model (GPT-4o, Claude) এর তুলনায় কম। Open-source model দিয়ে structured output নিয়ে কাজ করার সময় error handling (যেমন retry logic) রাখা ভালো অভ্যাস।
:::

---

## সংক্ষেপে

- Output Parser LLM এর raw text কে structured, ব্যবহারযোগ্য data তে রূপান্তর করে
- **StrOutputParser** — শুধু plain text দরকার হলে
- **JsonOutputParser** — দ্রুত JSON extraction, validation ছাড়া
- **StructuredOutputParser** — formal schema define করা যায়, কিন্তু validation নেই
- **PydanticOutputParser** — সবচেয়ে robust, প্রকৃত type validation সহ, production এর জন্য সবচেয়ে সুপারিশকৃত
- Model provider (OpenAI/Open Source) যাই হোক, parser এর logic একই থাকে

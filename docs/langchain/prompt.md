---
title: Prompts
---
---

## Static vs Dynamic Prompt

### Static Prompt

Static prompt মানে হার্ডকোড করা একটা fixed string — সরাসরি লিখে দেওয়া, কোনো variable বা পরিবর্তনযোগ্য অংশ নেই।

```python
prompt = "বাংলাদেশের রাজধানী কী?"
response = model.invoke(prompt)
```

এটা ছোট, একবারের experiment এর জন্য ঠিক আছে। কিন্তু বাস্তব application এ সমস্যা হয়:

- প্রতিটা user এর জন্য আলাদা প্রশ্ন হলে string concatenation দিয়ে prompt বানাতে হয় — যেটা করতে গেলে ভুল হওয়ার সম্ভাবনা অনেক বেশি (missing quote, wrong variable বসানো, ইত্যাদি)
- Prompt এর structure যাচাই (validate) করার কোনো উপায় থাকে না
- একই ধরনের prompt বারবার আলাদাভাবে লিখতে হয়, reuse করা যায় না
- Prompt এর কোনো অংশ পরিবর্তন করতে হলে পুরো কোডের মধ্যে সেই string খুঁজে বের করে বদলাতে হয়

### Dynamic Prompt (Prompt Template)

Dynamic prompt মানে — একটা reusable template বানিয়ে রাখা, যেখানে placeholder (variable) থাকে, এবং runtime এ সেই জায়গায় প্রকৃত মান বসিয়ে দেওয়া হয়।

```python
from langchain_core.prompts import PromptTemplate

template = PromptTemplate.from_template(
    "{country} এর রাজধানী কী?"
)

prompt = template.invoke({"country": "বাংলাদেশ"})
print(prompt.text)
# বাংলাদেশ এর রাজধানী কী?
```

এখানে `template` একবার লিখলেই হয়ে গেল — এরপর যতবার ইচ্ছা, শুধু `country` এর মান বদলে বদলে ব্যবহার করা যাবে। কোনো manual string concatenation লাগছে না।

### কেন Prompt Template ব্যবহার করা উচিত

| সমস্যা (Static দিয়ে)                                            | সমাধান (Template দিয়ে)                                                       |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| User input সরাসরি string এ বসালে ভুল হওয়ার ঝুঁকি | Template নিজে থেকে variable properly বসায়                                  |
| Prompt এর structure validate করা যায় না                         | Template এ কোন variable লাগবে সেটা আগে থেকেই define করা থাকে |
| Reuse করা কঠিন                                                       | একই template বারবার ভিন্ন input দিয়ে ব্যবহারযোগ্য        |
| বড় application এ maintain করা কঠিন                              | Prompt সব জায়গায় একই structure মেনে চলে                            |

::: tip
`PromptTemplate` তৈরি করার সময় LangChain automatic ভাবে input variable গুলো detect করে ফেলে (`{country}` এখানে)। তুমি চাইলে `input_variables` প্যারামিটার দিয়ে manually ও নির্দিষ্ট করে দিতে পারো, যেটা validation এর জন্য ভালো অভ্যাস — যদি ভুল variable name পাঠাও, LangChain error দিয়ে জানিয়ে দেবে।
:::

```python
template = PromptTemplate(
    template="{country} এর রাজধানী কী?",
    input_variables=["country"],
    validate_template=True
)
```

---

## Messages — System, Human, AI

Chat model এর সাথে কাজ করার সময় শুধু একটা raw string পাঠালে চলে না — বরং কথোপকথনটা কয়েক ধরনের **role** সহ message আকারে গঠন করতে হয়, যাতে model বুঝতে পারে কে কী বলছে।

### তিন ধরনের Message

| Message Type            | ভূমিকা                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| **SystemMessage** | Model কে instruction দেয় — সে কীভাবে আচরণ করবে, তার persona/role কী |
| **HumanMessage**  | User এর তরফ থেকে পাঠানো actual input/প্রশ্ন                                 |
| **AIMessage**     | Model এর আগের response — conversation history রাখতে ব্যবহার হয়            |

```python
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

messages = [
    SystemMessage(content="তুমি একজন সহায়ক বাংলা শিক্ষক। সবসময় সহজ ভাষায় উত্তর দাও।"),
    HumanMessage(content="আকাশ কেন নীল দেখায়?"),
]

response = model.invoke(messages)
print(response.content)
```

Model এর response আসলে একটা `AIMessage` অবজেক্ট। পরবর্তী turn এ কথোপকথন চালিয়ে যেতে চাইলে, সেই response টা history তে যোগ করে আবার পাঠাতে হয়:

```python
messages.append(AIMessage(content=response.content))
messages.append(HumanMessage(content="আরও একটু বিস্তারিত বলো।"))

response2 = model.invoke(messages)
```

### কেন এই role-ভিত্তিক structure দরকার

- **SystemMessage** না দিলে model কোনো নির্দিষ্ট persona/context ছাড়াই generic উত্তর দেয়
- **HumanMessage vs AIMessage** আলাদা না করলে model বুঝতে পারবে না কোনটা user বলেছে আর কোনটা তার নিজের আগের উত্তর ছিল — ফলে conversation এর ধারাবাহিকতা নষ্ট হয়ে যায়
- এই structure ছাড়া multi-turn conversation বানানোই কার্যত অসম্ভব

---

## Chat Prompt Template

শুধু single string এর জন্য `PromptTemplate` যথেষ্ট, কিন্তু chat model এর জন্য system prompt এবং user input — দুটোই dynamic (variable-based) হওয়া দরকার হয় অনেক সময়। এর জন্য `ChatPromptTemplate` ব্যবহার করা হয়।

```python
from langchain_core.prompts import ChatPromptTemplate

chat_template = ChatPromptTemplate.from_messages([
    ("system", "তুমি একজন {domain} বিশেষজ্ঞ। {tone} স্বরে উত্তর দাও।"),
    ("human", "{question}")
])

prompt = chat_template.invoke({
    "domain": "চিকিৎসা",
    "tone": "সহজ ও বন্ধুত্বপূর্ণ",
    "question": "জ্বর হলে কী করা উচিত?"
})
```

এখানে system prompt এর `{domain}` আর `{tone}` — দুটোই পরিবর্তনযোগ্য, একইসাথে user এর `{question}` ও dynamic। একই template ব্যবহার করে ভিন্ন ভিন্ন domain/tone/question এর জন্য নতুন prompt বানানো যাচ্ছে, প্রতিবার নতুন করে লিখতে হচ্ছে না।

### `ChatPromptTemplate` এর আউটপুট আসলে কী

`chat_template.invoke(...)` কল করলে এটা raw string রিটার্ন করে না — বরং সঠিক `SystemMessage` ও `HumanMessage` অবজেক্টের একটা list রিটার্ন করে, যা সরাসরি chat model এ পাঠানো যায়।

```python
chain = chat_template | model
response = chain.invoke({
    "domain": "চিকিৎসা",
    "tone": "সহজ ও বন্ধুত্বপূর্ণ",
    "question": "জ্বর হলে কী করা উচিত?"
})
```

---

## Message Placeholder

কখনো কখনো পুরো conversation history-ই একটা variable হিসেবে template এ বসাতে হয় — যেমন customer support bot, যেটা আগের কথোপকথন মনে রেখে উত্তর দেয়। এর জন্য `MessagesPlaceholder` ব্যবহার করা হয়।

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

chat_template = ChatPromptTemplate.from_messages([
    ("system", "তুমি একজন সহায়ক কাস্টমার সাপোর্ট এজেন্ট।"),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{question}")
])

history = [
    HumanMessage(content="আমার অর্ডার এখনো আসেনি।"),
    AIMessage(content="দুঃখিত শুনে। আপনার অর্ডার আইডি বলবেন কি?"),
]

prompt = chat_template.invoke({
    "chat_history": history,
    "question": "অর্ডার আইডি #12345"
})
```

### কেন এটা গুরুত্বপূর্ণ

- `MessagesPlaceholder` একটা placeholder হিসেবে কাজ করে, যেখানে পুরো message history-র list বসানো যায় — একটার পর একটা আলাদা message আলাদাভাবে যোগ করা লাগে না
- এটাই দীর্ঘ conversation এর ক্ষেত্রে context ধরে রাখার প্রধান মেকানিজম — customer support bot, personal assistant — যেকোনো multi-turn application এ এটা অপরিহার্য
- `chat_history` এখানে dynamic — প্রতিটা user/session এর জন্য আলাদা history পাঠানো যায়, একই template ব্যবহার করে

---

## সংক্ষেপে

- **Static prompt** ছোট experiment এর জন্য ঠিক আছে, কিন্তু production এ **Prompt Template** ব্যবহার করা উচিত — reusability, validation, এবং কম ভুলের জন্য
- **SystemMessage, HumanMessage, AIMessage** — এই তিনটা role দিয়ে chat model কে conversation এর structure বোঝানো হয়
- **ChatPromptTemplate** system prompt এবং user input — দুটোকেই dynamic রাখতে দেয়, এবং সরাসরি message list রিটার্ন করে
- **MessagesPlaceholder** পুরো conversation history কে একটা variable হিসেবে template এ বসাতে ব্যবহার হয় — multi-turn, context-aware application বানানোর মূল হাতিয়ার

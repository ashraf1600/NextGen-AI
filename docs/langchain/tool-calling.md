---
title: Tool Calling
---

# Tool Calling

আগের পেজে আমরা দেখেছি Tool কী এবং কীভাবে বানাতে হয়। কিন্তু শুধু Tool বানালেই হয় না — LLM কে জানাতে হয় সেই Tool এর অস্তিত্ব আছে, LLM কে সিদ্ধান্ত নিতে হয় কখন সেটা ব্যবহার করতে হবে, আর তারপর কেউ একজনকে সেটা আসলে **execute** করতে হয়। এই পুরো প্রক্রিয়াটাই আমরা এই পেজে ধাপে ধাপে দেখব: **Tool Binding → Tool Calling → Tool Execution**।

---

## সমস্যাটা আবার মনে করিয়ে দেওয়া যাক

LLM reasoning এবং টেক্সট তৈরিতে দক্ষ, কিন্তু বাস্তব কাজ (API call, ডেটাবেস অ্যাক্সেস, গণনা) নিজে থেকে করতে পারে না। এই তিনটা ধাপ মিলেই LLM কে সেই ক্ষমতা দেয় — কিন্তু একটা গুরুত্বপূর্ণ বিষয় শুরুতেই বুঝে নেওয়া দরকার:

::: tip সবচেয়ে গুরুত্বপূর্ণ পয়েন্ট
**LLM নিজে কখনো Tool execute করে না।** LLM শুধু বলে দেয় "এই Tool টা, এই argument দিয়ে ব্যবহার করা দরকার" — বাস্তবে সেটা চালানোর দায়িত্ব প্রোগ্রামারের কোডের।
:::

---

## ধাপ ১: Tool Binding

Tool Binding মানে একটা Tool কে LLM এর সাথে "রেজিস্টার" করা — যাতে model জানতে পারে কী কী Tool তার জন্য available আছে, প্রতিটা Tool কী কাজ করে, এবং কী input format দরকার।

```python
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

@tool
def get_exchange_rate(base_currency: str, target_currency: str) -> float:
    """দুইটা মুদ্রার মধ্যে বিনিময় হার (exchange rate) রিটার্ন করে।"""
    # বাস্তবে এখানে একটা API call হবে
    return 110.5  # উদাহরণ হার

model = ChatOpenAI(model="gpt-4o")
model_with_tools = model.bind_tools([get_exchange_rate])
```

`.bind_tools()` কল করার পর, model এর কাছে Tool এর নাম, description (docstring থেকে আসে), এবং expected input schema — সবকিছুর একটা schema পাঠানো হয়। এখন থেকে model জানে এই Tool টা তার কাছে "available"।

```
Diagram:

  [Tool Definition]  →  .bind_tools()  →  [LLM জানে এখন কোন Tool ব্যবহার করা যায়]
  (name, description,
   input schema)
```

---

## ধাপ ২: Tool Calling

Tool Calling হলো সেই মুহূর্ত যখন LLM user এর query দেখে **সিদ্ধান্ত নেয়** — এই কাজের জন্য কোনো Tool দরকার কিনা, আর দরকার হলে কোনটা এবং কী argument দিয়ে।

```python
response = model_with_tools.invoke("১০০ USD কত BDT হবে?")

print(response.tool_calls)
# [{'name': 'get_exchange_rate', 
#   'args': {'base_currency': 'USD', 'target_currency': 'BDT'}, 
#   'id': 'call_abc123'}]
```

লক্ষ্য করো — `response` এ **কোনো actual সংখ্যা নেই**। LLM শুধু বলছে: "তোমার `get_exchange_rate` Tool টা, এই argument দিয়ে চালানো দরকার।" এটাই structured output এর একটা রূপ — model নিজে থেকে কোনো ফাংশন call করছে না, শুধু কী call করা উচিত সেটা বলে দিচ্ছে।

```
Diagram:

  User Query: "১০০ USD কত BDT?"
            │
            ▼
   [LLM Reasoning]
            │
            ▼
  "get_exchange_rate নামের Tool, 
   base_currency='USD', target_currency='BDT' দিয়ে
   কল করা দরকার" ← এটুকুই LLM এর কাজ, execute করা না
```

---

## ধাপ ৩: Tool Execution

এখন আসল কাজ — LLM এর suggest করা Tool call টা প্রোগ্রামার/কোড দিয়ে **সত্যিকারভাবে execute** করতে হয়, এবং ফলাফল আবার LLM কে ফেরত পাঠাতে হয় যাতে সে চূড়ান্ত উত্তর তৈরি করতে পারে।

```python
from langchain_core.messages import HumanMessage, ToolMessage

messages = [HumanMessage(content="১০০ USD কত BDT হবে?")]
response = model_with_tools.invoke(messages)
messages.append(response)

# প্রতিটা tool call ম্যানুয়ালি execute করা
for tool_call in response.tool_calls:
    if tool_call["name"] == "get_exchange_rate":
        result = get_exchange_rate.invoke(tool_call["args"])
        messages.append(ToolMessage(content=str(result), tool_call_id=tool_call["id"]))

# এবার LLM কে আবার কল করা — এবার সে ফলাফল সহ চূড়ান্ত উত্তর দেবে
final_response = model_with_tools.invoke(messages)
print(final_response.content)
# "১০০ USD সমান প্রায় ১১,০৫০ BDT।"
```

```
Diagram — পুরো Cycle:

  User Query
      │
      ▼
  [LLM] ── "এই Tool call করো" ──→ [Tool Execution — প্রোগ্রামার/কোড]
                                            │
                                            ▼
                                      Tool এর ফলাফল
                                            │
  [LLM] ←──────── ফলাফল ফেরত পাঠানো ────────┘
      │
      ▼
  চূড়ান্ত, মানুষের পড়ার উপযোগী উত্তর
```

---

## বাস্তব উদাহরণ: Currency Conversion Tool

চলো একটা বাস্তব API ব্যবহার করে সম্পূর্ণ উদাহরণ দেখি, যেখানে একাধিক ধাপে ডেটা এক Tool থেকে আরেক Tool এ পাঠাতে হয়।

```python
import requests
from langchain_core.tools import tool
from typing import Annotated

@tool
def get_exchange_rate(base_currency: str, target_currency: str) -> float:
    """দুইটা মুদ্রার মধ্যে বর্তমান বিনিময় হার রিটার্ন করে।"""
    response = requests.get(
        f"https://api.exchangerate-api.com/v4/latest/{base_currency}"
    )
    data = response.json()
    return data["rates"][target_currency]

@tool
def convert_currency(
    amount: float,
    conversion_rate: Annotated[float, "get_exchange_rate থেকে পাওয়া বিনিময় হার"]
) -> float:
    """একটা amount কে conversion rate দিয়ে গুণ করে রূপান্তরিত মান বের করে।"""
    return amount * conversion_rate
```

### কেন `Annotated` ব্যবহার করা হচ্ছে

এখানে একাধিক Tool একসাথে কাজ করছে — প্রথম Tool (`get_exchange_rate`) থেকে পাওয়া মান দ্বিতীয় Tool (`convert_currency`) এ input হিসেবে যাচ্ছে। `Annotated` ব্যবহার করে আমরা স্পষ্টভাবে বলে দিচ্ছি এই argument টা আসলে কোথা থেকে আসবে — এটা LLM কে বিভ্রান্ত না হয়ে সঠিকভাবে multi-step tool chain সাজাতে সাহায্য করে, যেখানে এক Tool এর output আরেক Tool এর input হয়ে যাচ্ছে।

```python
model_with_tools = model.bind_tools([get_exchange_rate, convert_currency])

messages = [HumanMessage(content="১০০ USD কত BDT হবে?")]
response = model_with_tools.invoke(messages)
messages.append(response)

# প্রথম Tool call: exchange rate বের করা
for tool_call in response.tool_calls:
    if tool_call["name"] == "get_exchange_rate":
        rate = get_exchange_rate.invoke(tool_call["args"])
        messages.append(ToolMessage(content=str(rate), tool_call_id=tool_call["id"]))

# LLM আবার কল হবে — সে বুঝবে এখন convert_currency দরকার
response2 = model_with_tools.invoke(messages)
messages.append(response2)

for tool_call in response2.tool_calls:
    if tool_call["name"] == "convert_currency":
        result = convert_currency.invoke(tool_call["args"])
        messages.append(ToolMessage(content=str(result), tool_call_id=tool_call["id"]))

final_response = model_with_tools.invoke(messages)
print(final_response.content)
```

এখানে একটা multi-step প্রক্রিয়া হচ্ছে — প্রথমে rate খোঁজা, তারপর সেই rate দিয়ে amount রূপান্তর করা — দুইটা আলাদা Tool call একসাথে chain হয়ে কাজ করছে।

---

## এটা কি একটা AI Agent?

উপরের উদাহরণটা দেখতে অনেকটা "agent-এর মতো" মনে হলেও, **এটা এখনো প্রকৃত AI Agent না**। কারণ:

| এই উদাহরণে যা হচ্ছে | প্রকৃত Agent এ যা হয় |
|---|---|
| আমরা ম্যানুয়ালি `for` loop দিয়ে প্রতিটা tool call execute করছি | Agent নিজে থেকেই সিদ্ধান্ত নেয় কতগুলো ধাপ লাগবে এবং কখন থামতে হবে |
| Tool call এর ক্রম আমরা কোডে হার্ডকোড করেছি | Agent dynamically ঠিক করে কোন Tool কখন লাগবে, পূর্বনির্ধারিত ক্রম ছাড়াই |
| কোনো autonomous loop/decision-making নেই | Agent নিজে থেকেই বারবার চিন্তা করে, action নেয়, ফলাফল দেখে, আবার সিদ্ধান্ত নেয় (reasoning loop) |

এটাকে বলা যায় **"agentic" (agent-সদৃশ) আচরণ**, কিন্তু প্রকৃত **autonomous Agent** বানাতে হলে আরও বেশি স্বাধীনতা দরকার — যেখানে LLM নিজে থেকেই ঠিক করে কতগুলো Tool call লাগবে, কোন ক্রমে, এবং কখন চূড়ান্ত উত্তরে পৌঁছেছে। এটাই পরবর্তী topic — **Agent** এবং **Agent Executor** — এ বিস্তারিত আলোচনা করা হবে।

---

## সংক্ষেপে

- **Tool Binding** — LLM কে জানানো কোন কোন Tool তার জন্য available (`.bind_tools()`)
- **Tool Calling** — LLM সিদ্ধান্ত নেয় কোন Tool, কী argument দিয়ে দরকার — কিন্তু **নিজে execute করে না**
- **Tool Execution** — প্রোগ্রামারের কোড দিয়ে actual Tool চালানো, ফলাফল LLM কে `ToolMessage` আকারে ফেরত পাঠানো
- জটিল, multi-tool পরিস্থিতিতে **`Annotated`** ব্যবহার করে বলে দেওয়া হয় কোন argument কোথা থেকে আসছে
- এই পুরো manual process **"agentic"**, কিন্তু প্রকৃত **autonomous Agent** না — কারণ এখানে decision-making loop টা ম্যানুয়ালি কোড করা, স্বয়ংক্রিয় না

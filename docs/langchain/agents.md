---
title: Agents
---

# Agents — LangChain এর ৬ষ্ঠ ও চূড়ান্ত Core Component

আগের পেজে আমরা দেখেছি কীভাবে ম্যানুয়ালি Tool Binding, Calling, Execution করতে হয় — কিন্তু সেটা ছিল "agentic," প্রকৃত Agent না, কারণ পুরো প্রক্রিয়াটা হার্ডকোড করা ছিল। এই পেজে আমরা দেখব প্রকৃত **AI Agent** কী, কীভাবে এটা autonomous ভাবে কাজ করে, এবং **ReAct** প্যাটার্ন ব্যবহার করে কীভাবে LangChain দিয়ে একটা real agent বানানো যায়।

---

## AI Agent কী?

**AI Agent** হলো একটা intelligent system, যেটা একটা high-level লক্ষ্য (goal) নিয়ে নিজে থেকেই পরিকল্পনা (plan) করে এবং external tool (API, search, calculator) ব্যবহার করে সেই লক্ষ্য অর্জনের জন্য প্রয়োজনীয় কাজগুলো execute করে — কোনো পূর্বনির্ধারিত, হার্ডকোড করা ধাপ ছাড়াই।

পার্থক্যটা এভাবে বোঝা যায়:

```
আগের (Manual Tool Calling) পদ্ধতি:

  Programmer আগে থেকেই ঠিক করে দেয়:
  "প্রথমে Tool A কল করো, তারপর Tool B কল করো"
  → কোডে হার্ডকোড করা ধাপ


প্রকৃত AI Agent:

  শুধু একটা লক্ষ্য দেওয়া হয়: "আজকে ঢাকার আবহাওয়া কেমন, আর সেই অনুযায়ী কী পোশাক পরা উচিত?"
  → Agent নিজেই ঠিক করে কোন Tool, কোন ক্রমে, কতবার লাগবে
```

---

## AI Agent এর বৈশিষ্ট্য (Characteristics)

| বৈশিষ্ট্য | ব্যাখ্যা |
|---|---|
| **Goal-driven** | একটা নির্দিষ্ট লক্ষ্য নিয়ে কাজ করে, শুধু একটা প্রশ্নের উত্তর দেওয়া না |
| **Planning** | লক্ষ্য অর্জনের জন্য কী কী ধাপ লাগবে তা নিজে থেকে ঠিক করে |
| **Tool Usage** | প্রয়োজন অনুযায়ী external tool (search, API, calculator) ব্যবহার করে |
| **Context Maintenance** | আগের ধাপের ফলাফল মনে রাখে এবং পরবর্তী সিদ্ধান্তে ব্যবহার করে |
| **Adaptive** | নতুন তথ্য পেলে (যেমন কোনো tool এর ফলাফল প্রত্যাশিত না হলে) পরিকল্পনা বদলাতে পারে |

---

## ReAct প্যাটার্ন (Reasoning + Acting)

**ReAct** হলো একটা framework যা agent কে জটিল, multi-step সমস্যা সমাধানের জন্য একটা repeating loop এ চালায়: **Thought (চিন্তা) → Action (কাজ) → Observation (পর্যবেক্ষণ)** — এবং প্রয়োজন অনুযায়ী এই loop বারবার চলতে থাকে যতক্ষণ না চূড়ান্ত উত্তরে পৌঁছানো যায়।

```
ReAct Loop:

        ┌─────────────────────────────────────┐
        │                                       │
        ▼                                       │
  ┌──────────┐     ┌──────────┐     ┌─────────────┐
  │ Thought  │ --> │  Action  │ --> │ Observation  │
  │(কী করা    │     │(Tool কল  │     │(Tool এর     │
  │ দরকার?)   │     │  করা)     │     │ ফলাফল দেখা)  │
  └──────────┘     └──────────┘     └─────────────┘
                                             │
                                             ▼
                                   যথেষ্ট তথ্য পাওয়া গেছে?
                                       │           │
                                      না          হ্যাঁ
                                       │           │
                                       └── আবার ──┘
                                        loop চলে      ▼
                                                চূড়ান্ত উত্তর
```

### উদাহরণ দিয়ে ReAct বোঝা

```
প্রশ্ন: "ঢাকার আজকের তাপমাত্রা অনুযায়ী কী পোশাক পরা উচিত?"

Thought: আমাকে প্রথমে ঢাকার আজকের তাপমাত্রা জানতে হবে।
Action: weather_tool("ঢাকা") কল করা
Observation: তাপমাত্রা ৩৩°C, আর্দ্র

Thought: তাপমাত্রা অনুযায়ী এখন উপযুক্ত পোশাকের পরামর্শ দিতে হবে।
Action: (আর কোনো Tool দরকার নেই, সরাসরি উত্তর দেওয়া যায়)
Observation: —

চূড়ান্ত উত্তর: "৩৩°C এবং আর্দ্র আবহাওয়ায় হালকা, সুতির, ঢিলেঢালা পোশাক পরা উচিত।"
```

এখানে লক্ষণীয় — agent নিজে থেকেই বুঝেছে প্রথমে কোন Tool দরকার, কখন আরও তথ্য দরকার, এবং কখন চূড়ান্ত উত্তর দেওয়ার মতো যথেষ্ট তথ্য জমা হয়েছে — এসব কোনো hardcoded ক্রম ছাড়াই।

---

## Agent ও Agent Executor

LangChain এ Agent বানাতে দুইটা আলাদা অংশ লাগে:

| Component | কাজ |
|---|---|
| **Agent** | সিদ্ধান্ত নেয় পরবর্তী কী action নিতে হবে (reasoning অংশ) |
| **AgentExecutor** | Agent এর সিদ্ধান্ত অনুযায়ী actual loop চালায় — Tool execute করে, ফলাফল Agent কে ফেরত দেয়, এবং কখন থামতে হবে তা নিয়ন্ত্রণ করে |

```
Diagram:

  ┌─────────────────────────────────────────────┐
  │              AgentExecutor                    │
  │   (পুরো loop পরিচালনা করে, বারবার চালায়)      │
  │                                               │
  │   ┌─────────┐         ┌───────────────┐      │
  │   │  Agent   │  <--->  │ Tool Execution │      │
  │   │(reasoning)│         │  (বাস্তব কাজ)   │      │
  │   └─────────┘         └───────────────┘      │
  │                                               │
  └─────────────────────────────────────────────┘
```

**Agent** নিজে শুধু চিন্তা করে ("এখন কী Tool দরকার"), কিন্তু **AgentExecutor**-ই আসলে সেই loop টা বাস্তবায়ন করে — Tool চালায়, ফলাফল ফেরত পাঠায়, এবং প্রয়োজনে আবার Agent কে জিজ্ঞেস করে।

---

## কোড দিয়ে Agent বানানো

### ধাপ ১: Tool প্রস্তুত করা

```python
from langchain_core.tools import tool
from langchain_community.tools import DuckDuckGoSearchRun
import requests

search_tool = DuckDuckGoSearchRun()

@tool
def get_weather(city: str) -> str:
    """একটা শহরের বর্তমান আবহাওয়ার তথ্য রিটার্ন করে।"""
    response = requests.get(f"https://api.weatherstack.com/current?query={city}&access_key=YOUR_KEY")
    data = response.json()
    return f"{city}: {data['current']['temperature']}°C, {data['current']['weather_descriptions'][0]}"

tools = [search_tool, get_weather]
```

### ধাপ ২: ReAct Prompt তৈরি করা

```python
from langchain import hub

prompt = hub.pull("hwchase17/react")
```

`hub.pull()` দিয়ে LangChain এর community hub থেকে একটা প্রি-বিল্ট, পরীক্ষিত ReAct prompt template টেনে আনা হচ্ছে — নিজে থেকে ReAct prompt লিখতে গেলে এটা বেশ জটিল হয়ে যেতে পারে, তাই standard template ব্যবহার করা ভালো অভ্যাস।

### ধাপ ৩: Agent তৈরি করা

```python
from langchain.agents import create_react_agent
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o")

agent = create_react_agent(
    llm=model,
    tools=tools,
    prompt=prompt
)
```

### ধাপ ৪: AgentExecutor তৈরি করা

```python
from langchain.agents import AgentExecutor

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,  # প্রতিটা Thought/Action/Observation দেখাবে
    max_iterations=5  # অসীম loop থেকে বাঁচার জন্য একটা সীমা
)
```

### ধাপ ৫: চালানো

```python
result = agent_executor.invoke({
    "input": "ঢাকার আজকের তাপমাত্রা কত, এবং সেই অনুযায়ী কী পোশাক পরা উচিত?"
})

print(result["output"])
```

`verbose=True` দিলে টার্মিনালে প্রতিটা ধাপের Thought, Action, Observation দেখা যায় — এটা debugging এবং agent এর reasoning বোঝার জন্য খুবই সহায়ক।

### `max_iterations` কেন গুরুত্বপূর্ণ

Agent কখনো কখনো একই কাজ বারবার করতে থাকতে পারে (loop এ আটকে যাওয়া) যদি সঠিকভাবে চূড়ান্ত উত্তরে পৌঁছাতে না পারে। `max_iterations` একটা সীমা বেঁধে দেয়, যাতে agent অসীম loop এ আটকে না থাকে এবং অপ্রয়োজনীয় খরচ (প্রতিটা LLM call এ টাকা লাগে) না বাড়ে।

---

## সংক্ষেপে Flow

```
User Input
    │
    ▼
AgentExecutor শুরু হয়
    │
    ▼
┌─────────────────────────────┐
│  Agent চিন্তা করে (Thought)   │
│         │                    │
│         ▼                    │
│  Tool দরকার?                 │
│    │           │             │
│   হ্যাঁ         না             │
│    │           │             │
│    ▼           ▼             │
│ Tool চালানো   চূড়ান্ত উত্তর   │
│ (Action +                    │
│  Observation)                │
│    │                         │
│    └── আবার loop এ ফিরে যায় ──┘
└─────────────────────────────┘
    │
    ▼
চূড়ান্ত Output ইউজারকে দেখানো
```

---

## গুরুত্বপূর্ণ সতর্কতা: Production এ কী ব্যবহার করবে

ভিডিওতে যেভাবে LangChain এর ঐতিহ্যবাহী `Agent` + `AgentExecutor` পদ্ধতিতে agent বানানো দেখানো হয়েছে, সেটা শেখার জন্য চমৎকার এবং concept বোঝার জন্য গুরুত্বপূর্ণ। কিন্তু:

::: warning Industry-grade Application এর জন্য
বড়, scalable, production-level AI Agent বানানোর জন্য LangChain এর ঐতিহ্যবাহী Agent পদ্ধতির বদলে **LangGraph** ব্যবহার করা recommended। কারণ:
- LangGraph জটিল state management ভালোভাবে handle করে
- Cyclic workflow (agent বারবার নিজেকে বা অন্য agent কে call করা) এর জন্য বেশি উপযোগী
- Human-in-the-loop, persistence, এবং error recovery এর মতো production-grade ফিচার built-in ভাবে সাপোর্ট করে
:::

এই `Agent`/`AgentExecutor` পদ্ধতি দিয়ে concept শেখা হলে, LangGraph শেখা অনেক সহজ হয়ে যাবে — কারণ মূল ধারণা (reasoning loop, tool calling) একই থাকে, শুধু implementation বেশি robust হয়।

---

## সংক্ষেপে

- **AI Agent** হলো একটা goal-driven, planning-সক্ষম system, যেটা autonomous ভাবে Tool ব্যবহার করে কাজ করে
- বৈশিষ্ট্য: **goal-driven, planning, tool usage, context maintenance, adaptive**
- **ReAct প্যাটার্ন** — Thought → Action → Observation — এই loop এ চলে যতক্ষণ না চূড়ান্ত উত্তর পাওয়া যায়
- **Agent** reasoning করে, **AgentExecutor** সেই reasoning অনুযায়ী actual loop চালায় এবং Tool execute করে
- কোড লেখার ধাপ: Tool তৈরি → ReAct prompt আনা → `create_react_agent` → `AgentExecutor` → `.invoke()`
- `max_iterations` দিয়ে অসীম loop প্রতিরোধ করা হয়
- **Production-grade, scalable agent** বানাতে চাইলে ঐতিহ্যবাহী LangChain Agent এর বদলে **LangGraph** ব্যবহার করা উচিত

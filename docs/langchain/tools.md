---
title: Tools
---

# Tools — Agent এর হাত-পা

LLM যুক্তি (reasoning) এবং ভাষা তৈরিতে দারুণ দক্ষ, কিন্তু বাস্তব দুনিয়ায় সরাসরি কোনো কাজ করতে পারে না — সে নিজে থেকে ওয়েব ব্রাউজ করতে পারে না, কোড রান করতে পারে না, বা database এ কোয়েরি চালাতে পারে না। **Tool** এই সীমাবদ্ধতা দূর করে — এটাই LLM কে বাস্তব world এর সাথে সংযুক্ত করার মাধ্যম।

---

## Tool এর ভূমিকা

**Tool কে LLM এর "হাত-পা" হিসেবে ভাবা যায়** — LLM চিন্তা করে কী করা দরকার (মস্তিষ্কের কাজ), আর Tool সেই কাজটা বাস্তবে execute করে।

```
┌─────────┐   চিন্তা করে/সিদ্ধান্ত নেয়   ┌─────────┐   কাজটা বাস্তবে করে   ┌──────────────┐
│   LLM   │ ───────────────────────→ │  Tool   │ ──────────────────→ │ External System │
│(মস্তিষ্ক) │                          │(হাত-পা)  │                      │ (Web, DB, API)  │
└─────────┘                          └─────────┘                     └──────────────┘
```

### Agent কী?

**Agent** হলো একটা LLM-চালিত সিস্টেম, যেটা নিজে থেকে reasoning করে সিদ্ধান্ত নিতে পারে এবং লক্ষ্য অর্জনের জন্য Tool ব্যবহার করে কাজ করতে পারে — শুধু text generate করার বদলে, agent প্রকৃতপক্ষে কিছু "করে"। Tool ছাড়া agent বানানো সম্ভব না — Tool-ই হলো সেই মাধ্যম যা দিয়ে agent বাস্তব দুনিয়ায় প্রভাব ফেলতে পারে।

---

## Built-in Tools

LangChain এ সাধারণ কাজের জন্য আগে থেকেই তৈরি অনেক tool পাওয়া যায় — এগুলো ব্যবহার করতে খুব সামান্য সেটআপ লাগে।

### DuckDuckGo Web Search

```python
from langchain_community.tools import DuckDuckGoSearchRun

search_tool = DuckDuckGoSearchRun()
result = search_tool.invoke("বাংলাদেশের বর্তমান জনসংখ্যা কত")
print(result)
```

### Wikipedia Query Tool

```python
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper

wiki_tool = WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper())
result = wiki_tool.invoke("সুন্দরবন")
print(result)
```

### Shell Command Execution

```python
from langchain_community.tools import ShellTool

shell_tool = ShellTool()
result = shell_tool.invoke("ls -la")
print(result)
```

::: warning
`ShellTool` সরাসরি system command চালায় — production application এ এটা ব্যবহার করার আগে অবশ্যই sandbox/permission নিয়ন্ত্রণ রাখা উচিত, নাহলে security ঝুঁকি তৈরি হতে পারে।
:::

---

## Custom Tools — তিনটা পদ্ধতি

যখন built-in tool যথেষ্ট না, তখন নিজের প্রয়োজন অনুযায়ী custom tool বানানো যায়। এর জন্য তিনটা পদ্ধতি আছে — সহজ থেকে সবচেয়ে flexible পর্যন্ত।

### পদ্ধতি ১: `@tool` Decorator (সবচেয়ে সহজ)

শুধু একটা Python function, type hint, এবং docstring দিয়ে দ্রুত একটা tool বানানো যায়।

```python
from langchain_core.tools import tool

@tool
def multiply(a: int, b: int) -> int:
    """দুইটা সংখ্যা গুণ করে ফলাফল দেয়।"""
    return a * b

result = multiply.invoke({"a": 6, "b": 7})
print(result)  # 42
```

**গুরুত্বপূর্ণ:** `docstring` টা শুধু documentation না — এটা LLM কে বলে দেয় tool টা **কখন এবং কেন** ব্যবহার করতে হবে। তাই docstring পরিষ্কার ও নির্ভুলভাবে লেখা জরুরি।

### পদ্ধতি ২: Structured Tools (Pydantic দিয়ে)

যখন input এর উপর কড়া validation দরকার, তখন Pydantic model দিয়ে schema define করে `StructuredTool` ব্যবহার করা যায়।

```python
from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

class MultiplyInput(BaseModel):
    a: int = Field(description="প্রথম সংখ্যা")
    b: int = Field(description="দ্বিতীয় সংখ্যা")

def multiply_func(a: int, b: int) -> int:
    return a * b

multiply_tool = StructuredTool.from_function(
    func=multiply_func,
    name="multiply",
    description="দুইটা সংখ্যা গুণ করে ফলাফল দেয়।",
    args_schema=MultiplyInput
)

result = multiply_tool.invoke({"a": 6, "b": 7})
```

`@tool` decorator এর তুলনায় এটা বেশি explicit control দেয় — প্রতিটা field এর জন্য আলাদা description, validation constraint (যেমন `ge=0`) ইত্যাদি বসানো যায়।

### পদ্ধতি ৩: `BaseTool` Class (সবচেয়ে Flexible)

সবচেয়ে জটিল customization বা async সাপোর্ট দরকার হলে, সরাসরি `BaseTool` class থেকে inherit করে নিজের tool বানানো যায়।

```python
from langchain_core.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Type

class MultiplyInput(BaseModel):
    a: int = Field(description="প্রথম সংখ্যা")
    b: int = Field(description="দ্বিতীয় সংখ্যা")

class MultiplyTool(BaseTool):
    name: str = "multiply"
    description: str = "দুইটা সংখ্যা গুণ করে ফলাফল দেয়।"
    args_schema: Type[BaseModel] = MultiplyInput

    def _run(self, a: int, b: int) -> int:
        return a * b

    async def _arun(self, a: int, b: int) -> int:
        # async ভার্সন — যেমন কোনো external API async call করতে হলে
        return a * b

multiply_tool = MultiplyTool()
result = multiply_tool.invoke({"a": 6, "b": 7})
```

`BaseTool` ব্যবহার করলে `_run` এবং `_arun` — দুইটা method আলাদা করে define করা যায়, যেটা async কাজের জন্য (যেমন নেটওয়ার্ক কল) গুরুত্বপূর্ণ।

---

## তিনটা পদ্ধতির তুলনা

| পদ্ধতি | জটিলতা | কখন ব্যবহার করবে |
|---|---|---|
| **`@tool` Decorator** | সবচেয়ে সহজ | সাধারণ, সরল function-based tool এর জন্য |
| **Structured Tool** | মাঝারি | Pydantic দিয়ে কড়া input validation দরকার হলে |
| **`BaseTool` Class** | সবচেয়ে flexible | জটিল logic, async support, বা গভীর customization দরকার হলে |

---

## Toolkits

**Toolkit** হলো একে অপরের সাথে সম্পর্কিত কয়েকটা Tool কে একসাথে গ্রুপ করে রাখা একটা collection — যাতে বারবার আলাদা আলাদা tool import করতে না হয়, এবং বিভিন্ন application এ সহজে পুনরায় ব্যবহার (reuse) করা যায়।

```python
# ধারণাগত উদাহরণ — একটা Math Toolkit
math_toolkit = [add_tool, subtract_tool, multiply_tool, divide_tool]

# অথবা LangChain এর built-in toolkit ব্যবহার করা
from langchain_community.agent_toolkits import GmailToolkit

gmail_toolkit = GmailToolkit()
tools = gmail_toolkit.get_tools()
# এতে একসাথে ইমেইল পড়া, পাঠানো, খোঁজার মতো একাধিক tool থাকে
```

### সাধারণ Toolkit এর উদাহরণ

| Toolkit | কী কী Tool থাকে |
|---|---|
| **Math Toolkit** | Add, Subtract, Multiply, Divide |
| **Gmail Toolkit** | ইমেইল পড়া, পাঠানো, খোঁজা |
| **Google Drive Toolkit** | ফাইল খোঁজা, পড়া, আপলোড করা |
| **SQL Database Toolkit** | Query চালানো, schema দেখা, table list করা |

Toolkit ব্যবহারের সুবিধা হলো — একবার একটা toolkit বানিয়ে রাখলে, যেকোনো নতুন agent এ সরাসরি সেটা যুক্ত করা যায়, প্রতিটা tool আলাদাভাবে আবার নতুন করে define করতে হয় না।

---

## সংক্ষেপে

- **Tool** হলো LLM এর "হাত-পা" — এটা LLM কে বাস্তব দুনিয়ার সাথে সংযুক্ত করে, যেটা LLM নিজে থেকে করতে পারে না
- **Agent** = LLM (reasoning) + Tool (action) — একসাথে মিলে একটা autonomous সিস্টেম তৈরি হয়
- **Built-in Tools** (DuckDuckGo, Wikipedia, Shell) দিয়ে দ্রুত শুরু করা যায়
- **Custom Tool** বানানোর তিনটা পদ্ধতি: **`@tool` decorator** (সহজ), **Structured Tool** (Pydantic validation সহ), **`BaseTool`** (সবচেয়ে flexible, async সাপোর্ট)
- Docstring/description গুরুত্বপূর্ণ — এটাই LLM কে বলে দেয় কখন এই tool ব্যবহার করতে হবে
- **Toolkit** হলো সম্পর্কিত একাধিক tool এর reusable collection — সুবিধা ও পুনর্ব্যবহারযোগ্যতার জন্য

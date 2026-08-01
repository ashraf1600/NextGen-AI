---
title: LangSmith
---

# LangSmith

Chain বা Agent যত জটিল হতে থাকে, ততই manually print statement দিয়ে debug করা কঠিন হয়ে যায়। **LangSmith** হলো LangChain টিমের তৈরি একটা observability এবং debugging platform, যেখানে তোমার chain/agent এর প্রতিটা ধাপ visually দেখা, trace করা, এবং evaluate করা যায়।

---

## LangSmith কী সমস্যার সমাধান করে?

আগের পেজে আমরা Callback দিয়ে দেখেছি কীভাবে প্রতিটা ধাপ track করা যায় — কিন্তু সেটা শুধু terminal এ print করা তথ্য। জটিল multi-step agent এ এত তথ্য একসাথে দেখা এবং বোঝা কঠিন হয়ে যায়। LangSmith এই একই তথ্যকে একটা visual dashboard এ সাজিয়ে দেখায়, যেখানে প্রতিটা step, তার input/output, সময় লাগা, এবং token খরচ — সবকিছু সুন্দরভাবে দেখা যায়।

```
Callback (Terminal এ) vs LangSmith (Visual Dashboard):

Callback:                          LangSmith:
"Model call শুরু..."               ┌─────────────────────┐
"Model call শেষ..."         →      │  Visual Trace Tree    │
"Tool call শুরু..."                │  ├─ Prompt (২০ms)     │
"Tool call শেষ..."                 │  ├─ LLM Call (৮০০ms)  │
                                    │  ├─ Tool Call (৩০০ms) │
                                    │  └─ Final Output       │
                                    └─────────────────────┘
```

---

## Setup — LangSmith Enable করা

LangSmith ব্যবহার করতে কোনো আলাদা কোড লিখতে হয় না — শুধু environment variable সেট করলেই automatic ভাবে tracing শুরু হয়ে যায়।

```bash
pip install langsmith
```

```bash
# .env ফাইলে
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=তোমার-langsmith-api-key
LANGCHAIN_PROJECT=my-first-project
```

```python
from dotenv import load_dotenv
load_dotenv()

# এখন থেকে chain.invoke() কল করলেই automatic ভাবে LangSmith এ trace হবে
result = chain.invoke({"question": "..."})
```

`LANGCHAIN_API_KEY` পাওয়া যাবে [smith.langchain.com](https://smith.langchain.com) এ অ্যাকাউন্ট বানিয়ে।

---

## LangSmith Dashboard এ কী কী দেখা যায়

| ফিচার | ব্যাখ্যা |
|---|---|
| **Trace Tree** | পুরো chain/agent এর প্রতিটা ধাপ visually দেখা — কোন ধাপ কতক্ষণ নিলো |
| **Input/Output** | প্রতিটা ধাপের সঠিক input এবং output দেখা |
| **Token Usage & Cost** | প্রতিটা LLM call এ কত token এবং খরচ হয়েছে |
| **Error Highlighting** | কোন ধাপে error হয়েছে তা সরাসরি চিহ্নিত হয়ে দেখানো |
| **Latency Breakdown** | কোন ধাপ সবচেয়ে বেশি সময় নিচ্ছে |

---

## Evaluation — Chain এর গুণমান যাচাই করা

LangSmith শুধু debugging না, একটা chain বিভিন্ন input এ কেমন performance করছে সেটা systematically যাচাই (evaluate) করারও সুযোগ দেয়।

```python
from langsmith import Client
from langsmith.evaluation import evaluate

client = Client()

dataset = client.create_dataset("qa-test-set")
client.create_examples(
    inputs=[{"question": "বাংলাদেশের রাজধানী কী?"}],
    outputs=[{"answer": "ঢাকা"}],
    dataset_id=dataset.id
)

def my_chain_wrapper(inputs):
    return {"answer": chain.invoke(inputs)}

results = evaluate(
    my_chain_wrapper,
    data="qa-test-set",
    evaluators=[...]  # accuracy, relevance ইত্যাদি মাপার জন্য evaluator
)
```

এভাবে একটা fixed dataset এর উপর chain টা বারবার টেস্ট করা যায় — বিশেষত prompt বা model পরিবর্তন করার পর performance আগের চেয়ে ভালো হলো নাকি খারাপ হলো, সেটা measurable ভাবে যাচাই করা যায়।

---

## কখন LangSmith ব্যবহার করবে

- **Development এর সময়** — জটিল chain/agent এর ভিতরের logic দ্রুত ডিবাগ করতে
- **Prompt tuning এর সময়** — বিভিন্ন prompt ভার্সন তুলনা করে কোনটা ভালো কাজ করছে দেখতে
- **Production monitoring এ** — live application এর error rate, latency, cost track করতে
- **Regression testing এ** — কোনো পরিবর্তনের পর আগের performance বজায় আছে কিনা যাচাই করতে

---

## সংক্ষেপে

- LangSmith হলো LangChain এর জন্য visual **observability ও debugging platform**
- শুধু environment variable সেট করলেই automatic tracing শুরু হয় — আলাদা কোড লাগে না
- Dashboard এ trace tree, token usage, cost, latency, error — সবকিছু visually দেখা যায়
- **Evaluation** ফিচার দিয়ে chain এর গুণমান systematically যাচাই করা যায়
- Development, prompt tuning, production monitoring — সব ক্ষেত্রেই কাজে লাগে

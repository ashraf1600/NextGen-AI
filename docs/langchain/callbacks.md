---
title: Callbacks
---

# Callbacks

Chain বা Agent যখন চলে, তখন ভিতরে ভিতরে অনেক ধাপ ঘটে — prompt তৈরি হওয়া, model call হওয়া, Tool execute হওয়া। স্বাভাবিকভাবে এই ধাপগুলো "black box" এর মতো — শুধু চূড়ান্ত output দেখা যায়, মাঝের কিছু দেখা যায় না। **Callback** এই সমস্যার সমাধান করে — এটা প্রতিটা ধাপে "hook" করে, ঘটে যাওয়া প্রতিটা event সম্পর্কে জানার সুযোগ দেয়।

---

## Callback কী এবং কেন দরকার?

Callback হলো একটা mechanism, যেটা দিয়ে চলমান একটা chain/agent এর **প্রতিটা ধাপে কী ঘটছে** তা নজরে রাখা যায় — model call শুরু হলো কখন, শেষ হলো কখন, কোন Tool call হলো, কোনো error হলে সেটা কোথায় হলো — এসব তথ্য real-time এ পাওয়া যায়।

### Callback ছাড়া

```python
result = chain.invoke({"question": "..."})
# শুধু চূড়ান্ত ফলাফল দেখা যায় — মাঝের কোনো ধাপ সম্পর্কে জানার উপায় নেই
```

### Callback সহ

```python
from langchain_core.callbacks import BaseCallbackHandler

class MyCallbackHandler(BaseCallbackHandler):
    def on_llm_start(self, serialized, prompts, **kwargs):
        print(f"Model call শুরু হলো — Prompt: {prompts}")

    def on_llm_end(self, response, **kwargs):
        print(f"Model call শেষ হলো — Response: {response}")

    def on_tool_start(self, serialized, input_str, **kwargs):
        print(f"Tool call শুরু হলো — Input: {input_str}")

    def on_chain_error(self, error, **kwargs):
        print(f"Chain এ Error হয়েছে: {error}")

result = chain.invoke(
    {"question": "..."},
    config={"callbacks": [MyCallbackHandler()]}
)
```

এখন প্রতিটা গুরুত্বপূর্ণ মুহূর্তে (model শুরু/শেষ, tool শুরু/শেষ, error) নির্দিষ্ট method automatically কল হবে — এভাবেই chain এর ভিতরের কাজ track করা যায়।

---

## Callback কী কী কাজে ব্যবহার হয়

| ব্যবহার | ব্যাখ্যা |
|---|---|
| **Logging** | প্রতিটা ধাপ ফাইলে/database এ log করে রাখা |
| **Debugging** | কোন ধাপে সমস্যা হচ্ছে সেটা খুঁজে বের করা |
| **Streaming UI** | Token-by-token response সরাসরি frontend এ পাঠানো |
| **Cost Tracking** | কতগুলো token ব্যবহার হলো, তার হিসাব রাখা |
| **Monitoring/Alerting** | Error হলে বা কোনো নির্দিষ্ট শর্ত মিললে notification পাঠানো |

### Streaming এর জন্য Callback ব্যবহার

```python
class StreamingHandler(BaseCallbackHandler):
    def on_llm_new_token(self, token: str, **kwargs):
        print(token, end="", flush=True)  # প্রতিটা নতুন token সাথে সাথে দেখানো

chain.invoke({"question": "..."}, config={"callbacks": [StreamingHandler()]})
```

এটা বিশেষভাবে useful যখন chatbot UI তে ChatGPT-এর মতো token-by-token typing effect দেখাতে হয়।

---

## গুরুত্বপূর্ণ Callback Method গুলো

| Method | কখন কল হয় |
|---|---|
| `on_llm_start` | Model call শুরু হওয়ার সময় |
| `on_llm_new_token` | Streaming এ প্রতিটা নতুন token আসার সময় |
| `on_llm_end` | Model call সম্পূর্ণ হওয়ার সময় |
| `on_tool_start` / `on_tool_end` | Tool execution শুরু/শেষ হওয়ার সময় |
| `on_chain_start` / `on_chain_end` | পুরো chain শুরু/শেষ হওয়ার সময় |
| `on_chain_error` | কোনো error ঘটলে |

---

## সংক্ষেপে

- Callback দিয়ে chain/agent এর ভিতরের প্রতিটা ধাপ real-time এ পর্যবেক্ষণ করা যায়
- `BaseCallbackHandler` থেকে inherit করে নিজের custom handler বানানো হয়
- মূল ব্যবহার: **logging, debugging, streaming, cost tracking, monitoring**
- `config={"callbacks": [...]}` দিয়ে যেকোনো chain call এ callback যুক্ত করা যায়

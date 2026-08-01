---
title: Text Splitters
---

# Text Splitters

Document Loader দিয়ে আনা raw content সাধারণত অনেক বড় হয় — একটা পুরো PDF, বড় আর্টিকেল, বা document। এত বড় টেক্সট সরাসরি LLM এ পাঠানো যায় না, এবং সরাসরি পাঠালে RAG এর performance ও খারাপ হয়ে যায়। **Text Splitter** এই বড় content কে ছোট ছোট, অর্থপূর্ণ **chunk** এ ভাগ করে দেয়।

---

## কেন Text Splitting জরুরি?

### ১. Context Window এর সীমাবদ্ধতা

প্রতিটা LLM এর একটা fixed maximum input limit (context window) থাকে। একটা পুরো বড় document — যেমন ১০০ পাতার PDF — একবারে LLM এ পাঠানো সম্ভবই না, কারণ সেটা এই limit ছাড়িয়ে যাবে। Splitting নিশ্চিত করে যে content ছোট ছোট অংশে ভাগ হয়ে এই limit এর মধ্যে ফিট করে।

### ২. ভালো Embedding পাওয়া

Embedding model যখন খুব বড় একটা টেক্সট block কে একটা মাত্র vector এ রূপান্তর করার চেষ্টা করে, তখন সেই vector এ অনেক ভিন্ন ভিন্ন topic এর তথ্য মিশে যায় — ফলে vector টা কোনো একটা নির্দিষ্ট বিষয়ের সঠিক প্রতিনিধিত্ব করতে পারে না। ছোট, focused, thematic chunk হলে embedding model সেই chunk এর **অর্থগত অর্থ (semantic meaning)** অনেক নির্ভুলভাবে ধরতে পারে।

### ৩. উন্নত Retrieval

RAG এ যখন user প্রশ্ন করে, তখন সিস্টেমকে সবচেয়ে relevant অংশ খুঁজে বের করতে হয়। পুরো ফাইলের ভিতর খুঁজলে অপ্রাসঙ্গিক তথ্যও চলে আসে। কিন্তু organized, granular chunk এর মধ্যে খুঁজলে সরাসরি সেই নির্দিষ্ট অংশটাই পাওয়া যায় যেটা প্রশ্নের সাথে সবচেয়ে বেশি সম্পর্কিত — ফলে answer quality অনেক বেড়ে যায়।

```
বড় Document (splitting ছাড়া):
┌───────────────────────────────────┐
│ পুরো ১০০ পাতা — একটা মাত্র block   │  ← context window এ ফিট করে না
└───────────────────────────────────┘

Split করার পর:
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Chunk 1 │ │Chunk 2 │ │Chunk 3 │ │Chunk 4 │  ← প্রতিটা আলাদাভাবে embed ও search যোগ্য
└────────┘ └────────┘ └────────┘ └────────┘
```

---

## পদ্ধতি ১: Length-based Splitting

সবচেয়ে সহজ পদ্ধতি — টেক্সটকে একটা fixed সংখ্যক character বা token অনুযায়ী ভাগ করা, টেক্সটের গঠন বা অর্থ বিবেচনা না করেই।

```python
from langchain_text_splitters import CharacterTextSplitter

splitter = CharacterTextSplitter(
    separator="\n",
    chunk_size=200,
    chunk_overlap=20
)

text = """তোমার লম্বা টেক্সট এখানে থাকবে... 
(একাধিক লাইন এবং প্যারাগ্রাফ)"""

chunks = splitter.split_text(text)
print(f"মোট chunk সংখ্যা: {len(chunks)}")
```

### গুরুত্বপূর্ণ Parameter: `chunk_overlap`

`chunk_overlap` মানে দুইটা পাশাপাশি chunk এর মধ্যে কিছু অংশ common/overlap রাখা।

```
chunk_overlap ছাড়া:
[Chunk 1: ...বাক্যটা এখানে শেষ] [Chunk 2: হয়েছিল। এরপর...]
                                    ↑ প্রসঙ্গ হারিয়ে গেছে

chunk_overlap সহ:
[Chunk 1: ...বাক্যটা এখানে শেষ হয়েছিল।] 
                        [Chunk 2: এখানে শেষ হয়েছিল। এরপর...]
                                    ↑ overlap থাকায় প্রসঙ্গ বজায় থাকে
```

Overlap না রাখলে chunk এর একদম শুরুতে বা শেষে থাকা তথ্য প্রসঙ্গ (context) ছাড়াই কেটে যেতে পারে — একটা বাক্য বা ধারণা দুই chunk এর মাঝে ভেঙে গেলে দুটোর কোনোটাতেই সম্পূর্ণ অর্থ থাকে না। সাধারণত `chunk_overlap` কে `chunk_size` এর ১০-২০% রাখা হয়।

### সীমাবদ্ধতা

Length-based splitting টেক্সটের গঠন (বাক্য, প্যারাগ্রাফ) সম্পূর্ণ উপেক্ষা করে — ফলে একটা বাক্যের মাঝখানেই chunk কেটে যেতে পারে, যেটা অর্থ নষ্ট করে দেয়।

---

## পদ্ধতি ২: Text-Structure based Splitting

এই পদ্ধতি টেক্সটের স্বাভাবিক গঠন (paragraph → sentence → word) ব্যবহার করে যৌক্তিক (logical) chunk তৈরি করে — শুধু সংখ্যা গুনে ভাগ করার বদলে।

### `RecursiveCharacterTextSplitter` — Industry Standard

এটাই সাধারণ টেক্সট এর জন্য সবচেয়ে বহুল ব্যবহৃত এবং সুপারিশকৃত splitter।

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

chunks = splitter.split_text(text)
```

### এটা কীভাবে কাজ করে

`RecursiveCharacterTextSplitter` একটা **প্রায়োরিটি অনুযায়ী separator তালিকা** ব্যবহার করে (ডিফল্ট: `["\n\n", "\n", " ", ""]`) — অর্থাৎ, প্রথমে paragraph break (`\n\n`) দিয়ে ভাগ করার চেষ্টা করে। যদি তাতেও chunk `chunk_size` এর চেয়ে বড় থেকে যায়, তাহলে পরের separator (`\n` — line break) দিয়ে ভাগ করে। এভাবে ধাপে ধাপে ছোট separator এ নেমে আসে, যতক্ষণ না chunk যথেষ্ট ছোট হয়।

```
চেষ্টার ক্রম:

১. প্যারাগ্রাফ অনুযায়ী ভাগ (\n\n) — এখনও বড়?
২. লাইন অনুযায়ী ভাগ (\n) — এখনও বড়?
৩. স্পেস অনুযায়ী ভাগ ( ) — এখনও বড়?
৪. character অনুযায়ী ভাগ (একদম শেষ উপায়)
```

এই "recursive" পদ্ধতির কারণেই এটা যতটা সম্ভব প্রাকৃতিক ভাষার গঠন বজায় রেখে chunk বানায় — বাক্যের মাঝখানে কাটার সম্ভাবনা অনেক কম থাকে।

---

## পদ্ধতি ৩: Document-Structure based Splitting

সাধারণ প্রবন্ধ (prose) এর বাইরে, বিশেষ ধরনের কনটেন্ট — যেমন **Python কোড**, **HTML**, বা **Markdown** — এর নিজস্ব গঠন থাকে (function, tag, heading), যেটা সাধারণ paragraph splitting দিয়ে সঠিকভাবে ভাগ করা যায় না। এর জন্য language-specific separator ব্যবহার করা হয়।

### Python কোড Split করা

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter, Language

python_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.PYTHON,
    chunk_size=300,
    chunk_overlap=30
)

code = """
def calculate_area(radius):
    return 3.1416 * radius ** 2

class Circle:
    def __init__(self, radius):
        self.radius = radius
"""

chunks = python_splitter.split_text(code)
```

এই splitter জানে যে Python কোডে `def`, `class` এর মতো keyword দিয়ে যৌক্তিক ব্লক শুরু হয় — তাই সে চেষ্টা করে একটা function/class কে মাঝপথে না কেটে সম্পূর্ণ রাখতে।

### Markdown Split করা

```python
markdown_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.MARKDOWN,
    chunk_size=300,
    chunk_overlap=30
)
```

`Language.MARKDOWN` ব্যবহার করলে heading (`#`, `##`), list, code block এর গঠন বিবেচনা করে ভাগ করা হয় — যাতে একটা heading এর নিচের content তার সাথেই থাকে।

### সাপোর্টেড Language

`Language` enum এ Python, JavaScript, HTML, Markdown, LaTeX সহ আরও অনেক ফরম্যাট সাপোর্ট করে — প্রতিটার জন্য উপযুক্ত separator আগে থেকেই ঠিক করা আছে।

---

## পদ্ধতি ৪: Semantic Meaning Based Splitting

এটা একটা তুলনামূলক নতুন, experimental পদ্ধতি — এখানে টেক্সট কে fixed length বা structure অনুযায়ী না ভেঙে, বরং **অর্থ/topic পরিবর্তনের ভিত্তিতে** ভাগ করা হয়। এটা embedding similarity ব্যবহার করে বোঝার চেষ্টা করে কোথায় একটা topic শেষ হচ্ছে এবং নতুন topic শুরু হচ্ছে।

```
টেক্সট এর মধ্যে topic পরিবর্তনের ধারণা:

"...সালোকসংশ্লেষণ প্রক্রিয়ায় উদ্ভিদ সূর্যালোক ব্যবহার করে।"
                    ↑ একই topic (উদ্ভিদবিজ্ঞান)
"...এই প্রক্রিয়ায় ক্লোরোফিল গুরুত্বপূর্ণ ভূমিকা রাখে।"

── topic পরিবর্তন এখানে detected হতে পারে ──

"অন্যদিকে, শেয়ারবাজারে গতকাল সূচক বেড়েছে।"
                    ↑ সম্পূর্ণ নতুন topic (অর্থনীতি)
```

মূল ধারণা হলো — পাশাপাশি বাক্যগুলোর embedding এর মধ্যে similarity মাপা হয়। Similarity হঠাৎ কমে গেলে, সেটাকে topic পরিবর্তনের সংকেত ধরে সেখানে chunk boundary বসানো হয়।

::: warning
এই পদ্ধতি এখনো experimental এবং computationally বেশি ব্যয়বহুল (প্রতিটা বাক্যের embedding বের করতে হয়), তাই ছোট বা মাঝারি প্রজেক্টে এটা সবসময় practical নাও হতে পারে। বেশিরভাগ ক্ষেত্রে `RecursiveCharacterTextSplitter` দিয়েই ভালো ফলাফল পাওয়া যায়।
:::

---

## চারটা পদ্ধতির তুলনা

| পদ্ধতি | ভিত্তি | কখন ব্যবহার করবে |
|---|---|---|
| **Length-based** | Fixed character/token সংখ্যা | সবচেয়ে সহজ, দ্রুত prototype, কিন্তু গঠন উপেক্ষা করে |
| **Text-Structure based** | Paragraph/sentence গঠন | সাধারণ প্রবন্ধ/টেক্সট এর জন্য — **industry standard, বেশিরভাগ ক্ষেত্রে এটাই ডিফল্ট পছন্দ** |
| **Document-Structure based** | কোড/HTML/Markdown এর নিজস্ব syntax | বিশেষ ধরনের structured content (কোড, markdown) এর জন্য |
| **Semantic Meaning based** | Embedding similarity / topic পরিবর্তন | Experimental, সর্বোচ্চ নির্ভুলতা দরকার হলে, কিন্তু বেশি ব্যয়বহুল |

---

## সংক্ষেপে

- Text Splitting জরুরি কারণ: **context window** সীমাবদ্ধতা, **ভালো embedding**, এবং **উন্নত retrieval** — এই তিনটা কারণে
- **Length-based (`CharacterTextSplitter`)** — সহজ কিন্তু গঠন উপেক্ষা করে; **`chunk_overlap`** ব্যবহার করে বাক্যের প্রসঙ্গ বজায় রাখা হয়
- **`RecursiveCharacterTextSplitter`** — paragraph → line → word ক্রমে চেষ্টা করে, সাধারণ টেক্সট এর জন্য **industry standard**
- **Document-Structure based** — Python, HTML, Markdown এর মতো বিশেষ ফরম্যাটের জন্য `Language` enum ব্যবহার করা হয়
- **Semantic Meaning based** — topic পরিবর্তনের ভিত্তিতে ভাগ করে, তবে এখনো experimental এবং ব্যয়বহুল

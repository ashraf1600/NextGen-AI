---
title: LangChain Expression Language (LCEL)
---

# LangChain Expression Language (LCEL)

LCEL is the `|` pipe syntax used to compose LangChain components into a chain. It's the single most important concept in modern LangChain — almost everything else in this section builds on top of it.

## The Basic Idea

Any two `Runnable` objects can be connected with `|`, where the output of the left side becomes the input of the right side — just like piping commands in a terminal.

```python
chain = prompt | model | parser
```

Read this as: *"Take the prompt, send it to the model, then send the model's output to the parser."*

## Building Your First Chain

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_template(
    "Translate '{text}' into {language}."
)
model = ChatOpenAI(model="gpt-4o")
parser = StrOutputParser()

chain = prompt | model | parser

result = chain.invoke({"text": "good morning", "language": "Bengali"})
print(result)
```

Each `|` step is independently swappable — change the parser, change the model, change the prompt — without touching the rest of the chain.

## The Four Ways to Run a Chain

Every LCEL chain supports the same four execution methods, regardless of what's inside it:

| Method | Behavior |
|---|---|
| `.invoke(input)` | Run once, return the full result |
| `.stream(input)` | Yield output incrementally (token-by-token for chat models) |
| `.batch([input1, input2])` | Run multiple inputs in parallel |
| `.ainvoke(input)` | Async version of `.invoke()` |

```python
# Streaming example
for chunk in chain.stream({"text": "thank you", "language": "French"}):
    print(chunk, end="", flush=True)
```

You get streaming and batching **for free** — you don't write any extra code to support them, because every component in the chain already implements the `Runnable` interface.

## Running Steps in Parallel

Use `RunnableParallel` when you need multiple independent branches to run at the same time and merge their results.

```python
from langchain_core.runnables import RunnableParallel

parallel_chain = RunnableParallel(
    translation=prompt | model | parser,
    word_count=lambda x: len(x["text"].split())
)

result = parallel_chain.invoke({"text": "good morning", "language": "Bengali"})
# {'translation': '...', 'word_count': 2}
```

## Conditional Logic with RunnableBranch

For "if this, do that" logic inside a chain:

```python
from langchain_core.runnables import RunnableBranch

branch = RunnableBranch(
    (lambda x: x["language"] == "Bengali", bengali_chain),
    (lambda x: x["language"] == "French", french_chain),
    default_chain  # fallback
)
```

## Passing Data Through with RunnablePassthrough

Sometimes you need to carry the original input forward alongside a transformed value — common in RAG pipelines where you need both the retrieved context *and* the original question downstream.

```python
from langchain_core.runnables import RunnablePassthrough

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | parser
)
```

Here, `question` passes through unchanged while `context` gets populated by the retriever — both land as variables in the next prompt step.

## Why This Matters More Than It Looks

LCEL replaced LangChain's older `Chain` class hierarchy (`LLMChain`, `SequentialChain`, etc.), which required subclassing and boilerplate. LCEL chains are just plain Python objects composed with an operator — easier to read, easier to debug, and every chain automatically gets streaming, batching, and async support without extra work.

## What's Next

Next: [Prompt Templates](/langchain/prompt-templates) — the first building block you'll plug into the left side of most chains.

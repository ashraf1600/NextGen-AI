---
title: Introduction
---
What is LangChain?
------------------

LangChain is an **orchestration framework** — it doesn't replace the LLM, it sits on top of it and manages everything around the model call: prompts, context, tools, memory, and output handling.

## The Core Idea: Everything Is a Runnable

Modern LangChain (post-LCEL) is built around one interface: `Runnable`. A prompt is a Runnable. A chat model is a Runnable. An output parser is a Runnable. Even a retriever is a Runnable.

Because everything shares the same interface, they can all be:

- **Piped together** with `|`
- **Run in parallel** with `RunnableParallel`
- **Streamed** token-by-token with `.stream()`
- **Batched** with `.batch()`
- **Run async** with `.ainvoke()`

This is the single biggest design decision in LangChain — once you understand `Runnable`, the rest of the framework is just "which building blocks implement it."

```python
# All of these are Runnables, and can be composed the same way
prompt.invoke(...)
model.invoke(...)
retriever.invoke(...)
chain.invoke(...)  # a chain is just Runnables piped together
```

## LangChain's Package Ecosystem

LangChain isn't one package — it's split up so you only install what you need:

| Package                                             | What it contains                                                                                     |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `langchain-core`                                  | Base abstractions:`Runnable`, prompts, messages, output parsers                                    |
| `langchain-community`                             | Third-party integrations (vector stores, document loaders, tools)                                    |
| `langchain-openai`, `langchain-anthropic`, etc. | Provider-specific model integrations                                                                 |
| `langchain`                                       | Higher-level chains, agents, and retrieval logic built on core                                       |
| `langgraph`                                       | A separate, more powerful library for building stateful agent workflows (covered in its own section) |
| `langsmith`                                       | Observability/tracing — not required, but useful for debugging chains                               |

## Why "Provider-Agnostic" Matters

Because chat models implement the same `Runnable` interface regardless of provider, switching from OpenAI to Anthropic is often just changing one line:

```python
# Before
from langchain_openai import ChatOpenAI
model = ChatOpenAI(model="gpt-4o")

# After
from langchain_anthropic import ChatAnthropic
model = ChatAnthropic(model="claude-sonnet-4-6")
```

Everything downstream — prompts, parsers, chains — stays the same.

## LangChain vs. Calling the API Directly

|                                | Direct API call                      | LangChain                      |
| ------------------------------ | ------------------------------------ | ------------------------------ |
| Single prompt, single response | ✅ Simpler                           | Unnecessary overhead           |
| Swapping providers             | Rewrite integration code             | Change one line                |
| RAG pipeline                   | Build retrieval logic yourself       | Pre-built retriever interfaces |
| Agents with tools              | Build the tool-calling loop yourself | `AgentExecutor` handles it   |
| Debugging multi-step chains    | Manual print statements              | LangSmith tracing              |

## LangChain vs. LangGraph

A common point of confusion: **LangChain** is best for linear or lightly-branching pipelines (RAG, simple agents). **LangGraph** (built by the same team) is for workflows that need cycles, complex state, or human-in-the-loop control — like a multi-agent system where agents call each other repeatedly. You'll see this distinction again in the [Orchestration Frameworks](/orchestration/) section.

## What's Next

Next: [Installation](/langchain/installation) to get your environment set up, followed by [LCEL](/langchain/langchain-expression-language) where you'll build your first real chain.
-------------------------------------------------------------------------------------------------------------

# Introduction

Content coming soon.

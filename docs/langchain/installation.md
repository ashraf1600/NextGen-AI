---
title: Installation
---

# Installation

This page gets your environment ready for every example in this LangChain section.

## Prerequisites

- Python 3.9 or higher
- `pip` (or `uv`/`poetry` if you prefer)
- An API key from at least one LLM provider (OpenAI, Anthropic, etc.)

Check your Python version:

```bash
python --version
```

## Step 1: Create a Virtual Environment

Always isolate your project dependencies.

::: code-group

```bash [macOS/Linux]
python -m venv venv
source venv/bin/activate
```

```powershell [Windows PowerShell]
python -m venv venv
.\venv\Scripts\Activate.ps1
```

:::

## Step 2: Install Core LangChain Packages

```bash
pip install langchain langchain-core
```

Then install the provider package for whichever model you're using:

::: code-group

```bash [OpenAI]
pip install langchain-openai
```

```bash [Anthropic]
pip install langchain-anthropic
```

```bash [Google Gemini]
pip install langchain-google-genai
```

:::

You can install multiple provider packages side by side — this is what makes swapping models later a one-line change instead of a rewrite.

## Step 3: Set Your API Key

Never hardcode API keys in your source files. Use environment variables.

Create a `.env` file in your project root:

```bash
OPENAI_API_KEY=your-key-here
```

Load it in Python using `python-dotenv`:

```bash
pip install python-dotenv
```

```python
from dotenv import load_dotenv
load_dotenv()
```

::: warning
Add `.env` to your `.gitignore` immediately — never commit API keys to version control.
:::

## Step 4: Verify the Installation

Run this minimal script to confirm everything is wired correctly:

```python
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

model = ChatOpenAI(model="gpt-4o")
response = model.invoke("Say hello in one word.")
print(response.content)
```

If you see a response printed without errors, your setup is working.

## Optional: Install Extras as You Go

You don't need everything up front. Install these later, only when the relevant topic needs them:

| Package | Needed for |
|---|---|
| `langchain-community` | Vector stores, document loaders, community tools |
| `langchain-chroma` / `langchain-pinecone` | Specific vector store integrations |
| `langgraph` | Agent workflows (covered in its own section) |
| `langsmith` | Tracing and debugging chains |
| `langserve` | Deploying chains as REST APIs |

## Common Setup Issues

- **`ModuleNotFoundError`** — you likely installed `langchain` but forgot the provider package (e.g. `langchain-openai`).
- **`AuthenticationError`** — check that `.env` is being loaded *before* you instantiate the model, and that the variable name matches exactly (`OPENAI_API_KEY`, case-sensitive).
- **Version conflicts** — LangChain's packages move fast; if you hit unexpected errors, run `pip install --upgrade langchain langchain-core` to sync versions.

## What's Next

With your environment ready, move on to [LCEL](/langchain/langchain-expression-language) to learn the `|` syntax that chains everything together.

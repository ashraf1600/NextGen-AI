---
title: Prompt Templates
---

# Prompt Templates

Prompt templates let you define a prompt once with placeholder variables, then reuse it with different inputs — instead of manually string-concatenating text every time.

## Basic PromptTemplate

For simple, single-string prompts:

```python
from langchain_core.prompts import PromptTemplate

template = PromptTemplate.from_template(
    "Write a short bio for a {profession} named {name}."
)

prompt = template.invoke({"profession": "software engineer", "name": "Ashraful"})
print(prompt.text)
# Write a short bio for a software engineer named Ashraful.
```

## ChatPromptTemplate

Most real applications use chat models, which expect a list of messages (system, human, AI) rather than a single string. `ChatPromptTemplate` is the standard choice.

```python
from langchain_core.prompts import ChatPromptTemplate

template = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant that responds in {language}."),
    ("human", "{question}")
])

prompt = template.invoke({"language": "Bengali", "question": "What is RAG?"})
```

This produces a proper message list (`SystemMessage`, `HumanMessage`) ready to send to a chat model — not just plain text.

## Few-Shot Prompting

Give the model examples of the input/output pattern you want before asking your real question — this significantly improves consistency for classification, formatting, or style-matching tasks.

```python
from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate

examples = [
    {"input": "happy", "output": "positive"},
    {"input": "terrible", "output": "negative"},
]

example_prompt = PromptTemplate.from_template("Input: {input}\nOutput: {output}")

few_shot_prompt = FewShotPromptTemplate(
    examples=examples,
    example_prompt=example_prompt,
    suffix="Input: {input}\nOutput:",
    input_variables=["input"]
)

print(few_shot_prompt.invoke({"input": "amazing"}).text)
```

## Partial Prompts

If some variables are known ahead of time (e.g. today's date, a fixed system persona) and others are filled in later at runtime, use `.partial()` to pre-bind the known values.

```python
template = PromptTemplate.from_template(
    "You are answering as of {date}. Question: {question}"
)

partial_template = template.partial(date="2026-07-31")

# Now you only need to supply `question` at call time
prompt = partial_template.invoke({"question": "What year is it?"})
```

## Combining with LCEL

Prompt templates are `Runnable`, so they slot directly into a chain:

```python
chain = template | model | parser
chain.invoke({"language": "Bengali", "question": "What is RAG?"})
```

## Best Practices

- Keep system prompts in a template, not hardcoded inline — makes swapping tone/persona a one-line change.
- Use `ChatPromptTemplate` by default for chat models; only use plain `PromptTemplate` for completion-style or non-chat use cases.
- For prompts with many examples, store few-shot examples in a separate file/list rather than inlining them — easier to maintain as the example set grows.

## What's Next

Next: [Output Parsers](/langchain/output-parsers) — once the model responds, this is how you turn raw text into structured data your application can use.

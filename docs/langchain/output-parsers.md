---
title: Output Parsers
---

# Output Parsers

LLMs return raw text. Output parsers convert that text into a structured, usable format — a string, a JSON object, or a validated Python object — so the rest of your application doesn't have to deal with unpredictable formatting.

## StrOutputParser

The simplest parser — extracts just the text content from a model's response object.

```python
from langchain_core.output_parsers import StrOutputParser

parser = StrOutputParser()
chain = prompt | model | parser

result = chain.invoke({"question": "What is LangChain?"})
# result is a plain string, not a message object
```

Without a parser, `chain.invoke()` would return an `AIMessage` object; with `StrOutputParser`, you get `.content` directly as a string.

## JsonOutputParser

Use this when you need the model to return structured JSON — useful for extracting fields, classifications, or any data your app will process programmatically.

```python
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate

parser = JsonOutputParser()

prompt = ChatPromptTemplate.from_template(
    "Extract the name and age from this text as JSON with keys 'name' and 'age': {text}"
)

chain = prompt | model | parser
result = chain.invoke({"text": "John is 29 years old."})
# {'name': 'John', 'age': 29}
```

## PydanticOutputParser

For strict, validated structured output, define a Pydantic model and let the parser enforce the schema — including type checking.

```python
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

class Person(BaseModel):
    name: str = Field(description="The person's name")
    age: int = Field(description="The person's age")

parser = PydanticOutputParser(pydantic_object=Person)

prompt = ChatPromptTemplate.from_messages([
    ("system", "Extract structured data.\n{format_instructions}"),
    ("human", "{text}")
]).partial(format_instructions=parser.get_format_instructions())

chain = prompt | model | parser
result = chain.invoke({"text": "John is 29 years old."})
# Person(name='John', age=29) — a real, type-checked object
```

`parser.get_format_instructions()` automatically generates the schema description that gets injected into the prompt, telling the model exactly what shape of JSON to return.

## Handling Parse Failures

Models occasionally return malformed output (extra text around the JSON, missing fields). Two common strategies:

**1. OutputFixingParser** — wraps another parser and asks the model to fix its own broken output:

```python
from langchain.output_parsers import OutputFixingParser

fixing_parser = OutputFixingParser.from_llm(parser=parser, llm=model)
```

**2. Retry with structured output binding** — many modern models support native structured output via `.with_structured_output()`, which is more reliable than parsing free text after the fact:

```python
structured_model = model.with_structured_output(Person)
result = structured_model.invoke("John is 29 years old.")
# Person(name='John', age=29)
```

::: tip
When your model provider supports it, prefer `.with_structured_output()` over manual parsing — it uses the provider's native JSON mode or function-calling under the hood, which is far more reliable than asking the model to "please return valid JSON" in a text prompt.
:::

## Choosing the Right Parser

| Need | Use |
|---|---|
| Just the text, no structure | `StrOutputParser` |
| Loose JSON, no strict validation | `JsonOutputParser` |
| Strict schema with type validation | `PydanticOutputParser` or `.with_structured_output()` |
| Model keeps returning malformed output | `OutputFixingParser` |

## What's Next

Next: [Chat Models](/langchain/chat-models) — a closer look at the model layer itself, message types, and streaming.

import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/NextGen_AI/',
  title: "NextGen AI",
  description: "NextGen AI is a comprehensive guide to the latest advancements in artificial intelligence, providing insights, tutorials, and resources for developers and enthusiasts.",
  ignoreDeadLinks: true,

  markdown: {
    attrs: {
      disable: true
    }
  },

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },

      {
        text: 'Languages & Frameworks',
        items: [
          { text: 'Python', link: '/python/' },
          { text: 'PyTorch', link: '/pytorch/' },
          { text: 'TensorFlow / JAX', link: '/tensorflow-jax/' },
          { text: 'FastAPI', link: '/fastapi/' }
        ]
      },

      {
        text: 'LLM Engineering',
        items: [
          { text: 'Prompt Engineering', link: '/prompt-engineering/' },
          { text: 'RAG', link: '/rag/' },
          { text: 'Fine-tuning (LoRA/QLoRA, PEFT)', link: '/fine-tuning/' },
          { text: 'Function Calling / Tool Use', link: '/tool-use/' },
          { text: 'Evaluation & Guardrails', link: '/evaluation/' }
        ]
      },

      {
        text: 'Orchestration Frameworks',
        items: [
          { text: 'Overview', link: '/orchestration/' },
          { text: 'LangChain', link: '/langchain/' },
          { text: 'LlamaIndex', link: '/llamaindex/' },
          { text: 'LangGraph', link: '/langgraph/' },
          { text: 'CrewAI', link: '/orchestration/crewai' },
          // { text: 'AutoGen', link: '/orchestration/autogen' }
        ]
      },

      // {
      //   text: 'MLOps & Tools',
      //   items: [
      //     { text: 'Vector Databases', link: '/vector-databases/' },
      //     { text: 'Model Serving', link: '/model-serving/' },
      //     { text: 'Experiment Tracking', link: '/experiment-tracking/' },
      //     { text: 'Deployment (Docker, K8s)', link: '/deployment/' },
      //     { text: 'Inference / Serving', link: '/inference-serving/' }
      //   ]
      // },

      // {
      //   text: 'Architecture & Design',
      //   items: [
      //     { text: 'System Design for AI Apps', link: '/architecture/system-design' },
      //     { text: 'RAG Architecture Patterns', link: '/architecture/rag-patterns' },
      //     { text: 'Multi-Agent Architecture', link: '/architecture/multi-agent' }
      //   ]
      // },

      {
        text: 'AI Interview Preparation',
        items: [
          { text: 'AI/ML Fundamentals', link: '/fundamentals/math-stats' },
          { text: 'RAG', link: '/Rag/rag' },
          { text: 'Agentic AI ', link: '/Agentic_ai/' }
        ]
      }
    ],

    sidebar: {
      '/langchain/': [
        {
          text: 'LangChain',
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/langchain/' },
            { text: 'What is LangChain?', link: '/langchain/what-is-langchain' },
            { text: 'Installation', link: '/langchain/installation' },
            { text: 'LangChain Expression Language (LCEL)', link: '/langchain/langchain-expression-language' },
            { text: 'Prompt Templates', link: '/langchain/prompt-templates' },
            { text: 'Output Parsers', link: '/langchain/output-parsers' },
            { text: 'Chat Models', link: '/langchain/chat-models' },
            { text: 'Embeddings', link: '/langchain/embeddings' },
            { text: 'Vector Stores', link: '/langchain/vector-stores' },
            { text: 'Retrievers', link: '/langchain/retrievers' },
            { text: 'RAG', link: '/langchain/rag' },
            { text: 'Tools', link: '/langchain/tools' },
            { text: 'Tool Calling', link: '/langchain/tool-calling' },
            { text: 'Memory', link: '/langchain/memory' },
            { text: 'Chains', link: '/langchain/chains' },
            { text: 'Agents', link: '/langchain/agents' },
            { text: 'Callbacks', link: '/langchain/callbacks' },
            { text: 'LangSmith', link: '/langchain/langsmith' },
            { text: 'LangServe', link: '/langchain/langserve' },
            { text: 'Projects', link: '/langchain/projects' }
          ]
        }
      ],

      '/llamaindex/': [
        {
          text: 'LlamaIndex',
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/llamaindex/' },
            { text: 'What is LlamaIndex?', link: '/llamaindex/what-is-llamaindex' },
            { text: 'Installation', link: '/llamaindex/installation' },
            { text: 'Data Loaders', link: '/llamaindex/data-loaders' },
            { text: 'Indexes', link: '/llamaindex/indexes' },
            { text: 'Query Engines', link: '/llamaindex/query-engines' },
            { text: 'Retrievers', link: '/llamaindex/retrievers' },
            { text: 'Node Post-Processors', link: '/llamaindex/node-post-processors' },
            { text: 'Response Synthesis', link: '/llamaindex/response-synthesis' },
            { text: 'Agents', link: '/llamaindex/agents' },
            { text: 'Evaluation', link: '/llamaindex/evaluation' },
            { text: 'Projects', link: '/llamaindex/projects' }
          ]
        }
      ],

      '/langgraph/': [
        {
          text: 'LangGraph',
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/langgraph/' },
            { text: 'What is LangGraph?', link: '/langgraph/what-is-langgraph' },
            { text: 'Installation', link: '/langgraph/installation' },
            { text: 'Graphs & Nodes', link: '/langgraph/graphs-nodes' },
            { text: 'State Management', link: '/langgraph/state-management' },
            { text: 'Conditional Edges', link: '/langgraph/conditional-edges' },
            { text: 'Cycles & Loops', link: '/langgraph/cycles-loops' },
            { text: 'Human-in-the-Loop', link: '/langgraph/human-in-the-loop' },
            { text: 'Persistence & Checkpoints', link: '/langgraph/persistence' },
            { text: 'Multi-Agent Workflows', link: '/langgraph/multi-agent-workflows' },
            { text: 'Projects', link: '/langgraph/projects' }
          ]
        }
      ],

      '/orchestration/': [
        {
          text: 'Orchestration Frameworks',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/orchestration/' },
            { text: 'LangChain', link: '/langchain/' },
            { text: 'LlamaIndex', link: '/llamaindex/' },
            { text: 'LangGraph', link: '/langgraph/' },
            { text: 'CrewAI', link: '/orchestration/crewai' },
            { text: 'AutoGen', link: '/orchestration/autogen' },
            { text: 'Choosing the Right Framework', link: '/orchestration/comparison' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/riponahmed2201' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/md-ripon-mia1' },
      { icon: 'youtube', link: 'https://youtube.com/@riponahmed2201' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: '© 2026-Ashraful Islam'
    }
  }
})

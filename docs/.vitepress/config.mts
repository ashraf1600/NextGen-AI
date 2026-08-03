import { defineConfig } from 'vitepress'
import {withMermaid} from "vitepress-plugin-mermaid";


export default withMermaid(
 defineConfig({
  base: '/NextGen-AI/',
  title: "NextGen-AI",
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
          { text: 'Django Rest Framework', link: '/drf/' },
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

      {
        text: 'AI Interview Preparation',
        items: [
          { text: 'AI/ML Fundamentals', link: '/fundamentals/math-stats' },
          { text: 'RAG', link: '/Rag/rag' },
          { text: 'Agentic AI', link: '/Agentic_ai/' }
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
            { text: 'Installation', link: '/langchain/installation' },
            { text: 'LangChain Expression Language (LCEL)', link: '/langchain/langchain-expression-language' },
            { text: 'Core Components Overview', link: '/langchain/langchain-components' },
            { text: 'Component: Models', link: '/langchain/models' },
            { text: 'Component: Prompts', link: '/langchain/prompt' },
            { text: 'Structured Output', link: '/langchain/structured-output' },
            { text: 'Output Parsers', link: '/langchain/output-parsers_1' },
            { text: 'Component: Chains', link: '/langchain/chains' },
            { text: 'What are Runnables?', link: '/langchain/runnables' },
            { text: 'Component: Indexes', link: '/langchain/indexes' },
            { text: 'Document Loaders', link: '/langchain/document-loaders' },
            { text: 'Text Splitters', link: '/langchain/text-splitters' },
            { text: 'Vector Stores', link: '/langchain/vector-stores' },
            { text: 'Retrievers', link: '/langchain/retrievers' },
            { text: 'Component: Memory', link: '/langchain/memory' },
            { text: 'Intro to RAG (Retrieval-Augmented Generation)', link: '/langchain/rag' },
            { text: 'Tools', link: '/langchain/tools' },
            { text: 'Tool Calling', link: '/langchain/tool-calling' },
            { text: 'Component: Agents', link: '/langchain/agents' },
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
          text: 'Overview',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/orchestration/' },
            { text: 'Choosing the Right Framework', link: '/orchestration/comparison' }
          ]
        }
      ],

      '/drf/': [
        {
          text: 'Django Rest Framework',
          collapsed: false,
          items: [
            { text: 'Section 1: Introduction', link: '/drf/'},
            { text: 'Section 2: Project Setup', link: '/drf/project-setup' },
            { text: 'Section 3: Models', link: '/drf/models' },
            { text: 'Section 4: APIView', link: '/drf/apiview' },
            { text: 'Section 5: Serializer', link: '/drf/serializer' },
            { text: 'Section 6: GenericAPIView', link: '/drf/genericapiview' },
            { text: 'Section 7: Mixins', link: '/drf/mixins' },
            { text: 'Section 8: Generic Views', link: '/drf/generic-views' },
            { text: 'Section 9: ViewSets', link: '/drf/viewsets' },
            { text: 'Section 10: Authentication', link: '/drf/authentication' },
            { text: 'Section 11: Permissions', link: '/drf/permissions' },
            { text: 'Section 12: Filtering', link: '/drf/filtering' },
            { text: 'Section 13: Pagination', link: '/drf/pagination' },
            { text: 'Section 14: Relations', link: '/drf/relations' },
            { text: 'Section 15: Validation', link: '/drf/validation' },
            { text: 'Section 16: Upload', link: '/drf/upload' },
            { text: 'Section 17: Performance', link: '/drf/performance' },
            { text: 'Section 18: Versioning', link: '/drf/versioning' },
            { text: 'Section 19: Throttling', link: '/drf/throttling' },
            { text: 'Section 20: Caching', link: '/drf/caching' },
            { text: 'Section 21: Testing', link: '/drf/testing' },
            { text: 'Section 22: Deployment', link: '/drf/deployment' },
            { text: 'Section 23: Security', link: '/drf/security' },
            { text: 'Section 24: Interview Questions', link: '/drf/interview-questions' },
            { text: 'Section 25: Project Review', link: '/drf/project-review' },
            
            
            

          ]
        },
        {
    text: 'Advanced Topics',
    collapsed: false,
    items: [
      { text: 'Docker: DRF + React Full Stack', link: '/drf/docker-fullstack' }
    ]
  }

      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ashraf1600' },
      { icon: 'linkedin', link: 'https://linkedin.com/in/ashraful-islam-a31268226/' },
      { icon: 'youtube', link: 'https://youtube.com/@riponahmed2201' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: '© 2026-Ashraful Islam'
    }
  }
})
)

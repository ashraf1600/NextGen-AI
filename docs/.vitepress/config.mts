import { defineConfig } from 'vitepress'
import { withMermaid } from "vitepress-plugin-mermaid";

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
            { text: 'Advanced RAG', link: '/rag-advanced/' },
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
          ]
        },
        {
          text: 'MLOps/LLMOps',
          items: [
            { text: 'Overview', link: '/mlops/' },
            { text: 'MLflow', link: '/mlflow/' },
            {text:'AWS', link: '/aws/'}
          ]
        },
        {
          text: 'AI Interview',
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
            text: 'Orchestration Frameworks',
            collapsed: false,
            items: [
              { text: 'Overview', link: '/orchestration/' },
              { text: 'Choosing the Right Framework', link: '/orchestration/comparison' },
              { text: 'CrewAI', link: '/orchestration/crewai' }
            ]
          }
        ],

        '/rag-advanced/': [
          {
            text: 'Advanced RAG — Course Outline',
            collapsed: false,
            items: [
              { text: 'Course Overview & Prerequisites', link: '/rag-advanced/' },
              { text: 'Module 1: RAG Fundamentals and Architecture', link: '/rag-advanced/module-1-fundamentals' },
              { text: 'Module 2: Document Processing and Chunking', link: '/rag-advanced/module-2-chunking' },
              { text: 'Module 3: Embeddings and Vector Representations', link: '/rag-advanced/module-3-embeddings' },
              { text: 'Module 4: Vector Stores', link: '/rag-advanced/module-4-vector-stores' },
              { text: 'Module 5: Basic Retrieval Techniques', link: '/rag-advanced/module-5-basic-retrieval' },
              { text: 'Module 6: Advanced Retrieval Techniques', link: '/rag-advanced/module-6-advanced-retrieval' },
              { text: 'Module 7: Advanced RAG Patterns', link: '/rag-advanced/module-7-advanced-patterns' },
              { text: 'Module 8: Agentic RAG with LangGraph', link: '/rag-advanced/module-8-agentic-rag' },
              { text: 'Module 9: RAG Evaluation (RAGAS)', link: '/rag-advanced/module-9-ragas-evaluation' },
              { text: 'Module 10: Capstone Project', link: '/rag-advanced/module-10-capstone' },
              { text: 'Production RAG', link: '/rag-advanced/production-rag' }
            ]
          }
        ],

        '/drf/': [
          {
            text: 'Django Rest Framework',
            collapsed: false,
            items: [
              { text: 'Section 1: Introduction', link: '/drf/' },
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
              { text: 'Docker: DRF + React Full Stack', link: '/drf/docker-fullstack' }
            ]
          }
        ],

        '/mlops/': [
          {
            text: 'MLOps/LLMOps',
            collapsed: false,
            items: [
              { text: 'Overview', link: '/mlops/' },
             
            ]
          }
        ],
        '/mlflow/': [
          {
            text: 'MLflow',
            collapsed: false,
            items: [
              { text: 'Introduction', link: '/mlflow/' },
              { text: 'Experiment Tracking', link: '/mlflow/experiment-tracking' },
              { text: 'Model Registry', link: '/mlflow/model-registry' },
              { text: 'MLflow Autologging', link: '/mlflow/mlflow-autologging' },
              { text: 'Serving with FastAPI', link: '/mlflow/mlflow-model-serving-fastapi' },
              { text: 'Model Evaluation', link: '/mlflow/mlflow-model-evaluation' }
            ]
          }
        ],
        '/aws/': [
  {
    text: 'Course Outline',
    collapsed: false,
    items: [
      { text: 'Day 0: Course Outline', link: '/aws/' }
    ]
  },
  {
    text: 'Phase 1 — Cloud & AWS Foundations',
    collapsed: false,
    items: [
      { text: 'Day 01: Cloud Computing Basics', link: '/aws/day-01-cloud-computing-basics' },
      { text: 'Day 02: AWS Introduction', link: '/aws/day-02-aws-introduction' },
      { text: 'Day 03: IAM Deep Dive', link: '/aws/day-03-iam-deep-dive' },
      { text: 'Day 04: AWS CLI Setup', link: '/aws/day-04-aws-cli-setup' },
      { text: 'Day 05: EC2, Key Pairs, Security Groups', link: '/aws/day-05-ec2-key-pairs-security-groups' },
      { text: 'Day 06: EBS', link: '/aws/day-06-ebs' },
      { text: 'Day 07: EFS Hands-on', link: '/aws/day-07-efs-hands-on' },
      { text: 'Day 08: AMI', link: '/aws/day-08-ami' }
    ]
  },
  {
    text: 'Phase 2 — Networking',
    collapsed: true,
    items: [
      { text: 'Day 09: VPC Fundamentals', link: '/aws/day-09-vpc-fundamentals' },
      { text: 'Day 10: Firewall & Elastic IP', link: '/aws/day-10-firewall-elastic-ip' },
      { text: 'Day 11: VPC Peering', link: '/aws/day-11-vpc-peering' },
      { text: 'Day 12: Load Balancer (ALB, NLB)', link: '/aws/day-12-load-balancer' }
    ]
  },
  {
    text: 'Phase 3 — Storage & Databases',
    collapsed: true,
    items: [
      { text: 'Day 13: S3 Deep Dive', link: '/aws/day-13-s3-deep-dive' },
      { text: 'Day 14: S3 Static Website Hosting', link: '/aws/day-14-s3-static-website' },
      { text: 'Day 15: RDS Introduction', link: '/aws/day-15-rds-introduction' },
      { text: 'Day 16: MySQL on EC2', link: '/aws/day-16-mysql-on-ec2' },
      { text: 'Day 17: EFS Hands-on (Advanced)', link: '/aws/day-17-efs-advanced' }
    ]
  },
  {
    text: 'Phase 4 — High Availability & Scaling',
    collapsed: true,
    items: [
      { text: 'Day 18: Auto Scaling Groups', link: '/aws/day-18-auto-scaling-groups' },
      { text: 'Day 19: Launch Templates, Multi-AZ', link: '/aws/day-19-launch-templates-multi-az' },
      { text: 'Day 20: SNS', link: '/aws/day-20-sns' },
      { text: 'Day 21: CloudWatch Alarms', link: '/aws/day-21-cloudwatch-alarms' },
      { text: 'Day 22: SQS', link: '/aws/day-22-sqs' }
    ]
  },
  {
    text: 'Phase 5 — Serverless & Modern AWS',
    collapsed: true,
    items: [
      { text: 'Day 23: Lambda Introduction', link: '/aws/day-23-lambda-introduction' },
      { text: 'Day 24: API Gateway + Lambda', link: '/aws/day-24-api-gateway-lambda' },
      { text: 'Day 25: Project — S3 → Lambda → SNS', link: '/aws/day-25-s3-lambda-sns-project' },
      { text: 'Day 26: Elastic Beanstalk', link: '/aws/day-26-elastic-beanstalk' }
    ]
  },
  {
    text: 'Phase 6 — DNS & Traffic Management',
    collapsed: true,
    items: [
      { text: 'Day 27: Route 53', link: '/aws/day-27-route-53' }
    ]
  },
  {
    text: 'Phase 7 — Containers & Kubernetes',
    collapsed: true,
    items: [
      { text: 'Day 28: Docker Basics', link: '/aws/day-28-docker-basics' },
      { text: 'Day 29: ECR & ECS', link: '/aws/day-29-ecr-ecs' },
      { text: 'Day 30: Deploy to ECS Fargate + ALB + Auto Scaling', link: '/aws/day-30-ecs-fargate-deploy' },
      { text: 'Day 31: EKS Introduction & Deploy', link: '/aws/day-31-eks-introduction' }
    ]
  },
  {
    text: 'Phase 8 — DevOps on AWS',
    collapsed: true,
    items: [
      { text: 'Day 32: CI/CD Basics & AWS DevOps Services', link: '/aws/day-32-cicd-basics-aws-devops' },
      { text: 'Day 33: CodeCommit', link: '/aws/day-33-codecommit' },
      { text: 'Day 34: CodeBuild', link: '/aws/day-34-codebuild' },
      { text: 'Day 35: CodePipeline', link: '/aws/day-35-codepipeline' },
      { text: 'Day 36: CodeDeploy', link: '/aws/day-36-codedeploy' },
      { text: 'Day 37: Blue-Green Deployment', link: '/aws/day-37-blue-green-deployment' }
    ]
  },
  {
    text: 'Phase 9 — Infrastructure as Code',
    collapsed: true,
    items: [
      { text: 'Day 38: CloudFormation', link: '/aws/day-38-cloudformation' },
      { text: 'Day 39: Terraform on AWS', link: '/aws/day-39-terraform-on-aws' },
      { text: 'Day 40: Deploy Full Infra Using Terraform', link: '/aws/day-40-terraform-full-infra' }
    ]
  },
  {
    text: 'Phase 10 — Real-World Capstone',
    collapsed: true,
    items: [
      { text: 'Capstone: 3-Tier Project (Terraform + Jenkins + Docker)', link: '/aws/capstone-3-tier-project' }
    ]
  }
],



        '/prompt-engineering/': [
          {
            text: 'Prompt Engineering',
            collapsed: false,
            items: [
              { text: 'Introduction', link: '/prompt-engineering/' }
            ]
          }
        ],

        '/fine-tuning/': [
          {
            text: 'Fine-tuning',
            collapsed: false,
            items: [
              { text: 'Introduction', link: '/fine-tuning/' }
            ]
          }
        ],

        '/tool-use/': [
          {
            text: 'Function Calling / Tool Use',
            collapsed: false,
            items: [
              { text: 'Introduction', link: '/tool-use/' }
            ]
          }
        ],

        '/evaluation/': [
          {
            text: 'Evaluation & Guardrails',
            collapsed: false,
            items: [
              { text: 'Introduction', link: '/evaluation/' }
            ]
          }
        ],

        '/fundamentals/': [
          {
            text: 'AI/ML Fundamentals',
            collapsed: false,
            items: [
              { text: 'Math & Statistics', link: '/fundamentals/math-stats' }
            ]
          }
        ],

        '/Rag/': [
          {
            text: 'RAG Interview',
            collapsed: false,
            items: [
              { text: 'RAG', link: '/Rag/rag' }
            ]
          }
        ],

        '/Agentic_ai/': [
          {
            text: 'Agentic AI',
            collapsed: false,
            items: [
              { text: 'Introduction', link: '/Agentic_ai/' }
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
        copyright: '© 2026 - Ashraful Islam'
      }
    }
  })
);
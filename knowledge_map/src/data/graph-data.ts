export interface GraphNode {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface GraphLink {
  source: string;
  target: string;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export const CATEGORIES = [
  { name: "核心基础", color: "#525252" },
  { name: "前端开发", color: "#737373" },
  { name: "后端开发", color: "#a3a3a3" },
  { name: "数据库", color: "#bfbfbf" },
  { name: "DevOps", color: "#d4d4d4" },
  { name: "数据科学", color: "#e5e5e5" },
] as const;

export const graphData: GraphData = {
  nodes: [
    { id: "javascript", name: "JavaScript", category: "核心基础", description: "动态类型脚本语言，Web 开发的核心技术之一，支持函数式与面向对象编程范式。" },
    { id: "typescript", name: "TypeScript", category: "核心基础", description: "JavaScript 的超集，添加了静态类型系统和类、接口等语言特性。" },
    { id: "html-css", name: "HTML/CSS", category: "核心基础", description: "Web 页面的结构标记语言与样式表语言，构成前端展示的基石。" },
    { id: "algorithms", name: "算法", category: "核心基础", description: "解决问题的有限步骤集合，是计算机科学的理论基础。" },
    { id: "react", name: "React", category: "前端开发", description: "Meta 开源的声明式 UI 库，基于组件化和虚拟 DOM 技术。" },
    { id: "vue", name: "Vue", category: "前端开发", description: "渐进式 JavaScript 框架，以易学易用和响应式数据绑定著称。" },
    { id: "nextjs", name: "Next.js", category: "前端开发", description: "基于 React 的全栈框架，支持 SSR、SSG 和 API Routes。" },
    { id: "tailwind", name: "Tailwind CSS", category: "前端开发", description: "原子化 CSS 框架，通过组合 utility class 快速构建自定义界面。" },
    { id: "vite", name: "Vite", category: "前端开发", description: "新一代前端构建工具，利用原生 ES 模块实现极速开发体验。" },
    { id: "nodejs", name: "Node.js", category: "后端开发", description: "基于 V8 的 JavaScript 运行时，使 JS 可用于服务端开发。" },
    { id: "python", name: "Python", category: "后端开发", description: "通用高级编程语言，以简洁语法和丰富的生态广泛应用于各领域。" },
    { id: "rest-api", name: "REST API", category: "后端开发", description: "基于 HTTP 协议的接口设计风格，使用标准方法操作资源。" },
    { id: "graphql", name: "GraphQL", category: "后端开发", description: "API 查询语言，允许客户端精确指定所需数据结构。" },
    { id: "postgresql", name: "PostgreSQL", category: "数据库", description: "功能强大的开源关系型数据库，支持 ACID 事务和复杂查询。" },
    { id: "redis", name: "Redis", category: "数据库", description: "高性能内存键值数据库，常用于缓存和消息队列。" },
    { id: "mongodb", name: "MongoDB", category: "数据库", description: "面向文档的 NoSQL 数据库，以灵活的 JSON-like 文档模型著称。" },
    { id: "docker", name: "Docker", category: "DevOps", description: "容器化平台，将应用及其依赖打包为可移植的容器。" },
    { id: "kubernetes", name: "Kubernetes", category: "DevOps", description: "容器编排系统，自动化部署、扩缩容和管理容器化应用。" },
    { id: "cicd", name: "CI/CD", category: "DevOps", description: "持续集成与持续交付，自动化代码构建、测试和部署流程。" },
    { id: "machine-learning", name: "机器学习", category: "数据科学", description: "让计算机从数据中自动学习模式和规律的技术领域。" },
    { id: "data-analysis", name: "数据分析", category: "数据科学", description: "对数据进行收集、处理和建模，以发现有价值的信息和趋势。" },
  ],
  links: [
    { source: "javascript", target: "typescript", weight: 5 },
    { source: "javascript", target: "react", weight: 5 },
    { source: "javascript", target: "vue", weight: 4 },
    { source: "javascript", target: "nodejs", weight: 5 },
    { source: "javascript", target: "html-css", weight: 4 },
    { source: "typescript", target: "react", weight: 4 },
    { source: "typescript", target: "nextjs", weight: 4 },
    { source: "typescript", target: "vue", weight: 3 },
    { source: "html-css", target: "tailwind", weight: 4 },
    { source: "html-css", target: "react", weight: 3 },
    { source: "react", target: "nextjs", weight: 5 },
    { source: "react", target: "vite", weight: 3 },
    { source: "react", target: "graphql", weight: 3 },
    { source: "vue", target: "vite", weight: 4 },
    { source: "nodejs", target: "rest-api", weight: 4 },
    { source: "nodejs", target: "graphql", weight: 3 },
    { source: "nodejs", target: "nextjs", weight: 3 },
    { source: "python", target: "machine-learning", weight: 5 },
    { source: "python", target: "data-analysis", weight: 5 },
    { source: "python", target: "rest-api", weight: 3 },
    { source: "rest-api", target: "graphql", weight: 3 },
    { source: "postgresql", target: "rest-api", weight: 4 },
    { source: "postgresql", target: "redis", weight: 3 },
    { source: "mongodb", target: "rest-api", weight: 3 },
    { source: "mongodb", target: "nodejs", weight: 3 },
    { source: "docker", target: "kubernetes", weight: 5 },
    { source: "docker", target: "cicd", weight: 4 },
    { source: "kubernetes", target: "cicd", weight: 3 },
    { source: "machine-learning", target: "data-analysis", weight: 4 },
    { source: "algorithms", target: "machine-learning", weight: 3 },
    { source: "algorithms", target: "data-analysis", weight: 3 },
    { source: "algorithms", target: "javascript", weight: 2 },
    { source: "redis", target: "nodejs", weight: 3 },
  ],
};

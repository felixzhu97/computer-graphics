# VR 游戏项目

一个基于 Next.js 和 Three.js 构建的虚拟现实游戏项目。

## 功能特性

- 沉浸式 VR 体验
- 支持桌面和移动设备的响应式设计
- 自定义 3D 图形和交互

## 技术栈

- Next.js 14
- TypeScript
- Tailwind CSS
- Three.js (用于 3D 渲染)
- Framer Motion (用于动画效果)

## 快速开始

1. 安装依赖:

```bash
pnpm install
```

2. 启动开发服务器:

```bash
pnpm dev
```

3. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 项目结构

- `app/`: Next.js 应用路由页面
- `components/`: React 组件
- `docs/`: 项目文档
  - `c4/`: C4 模型文档
    - `context.puml`: 系统上下文图
    - `container.puml`: 容器图
    - `component.puml`: 组件图
    - `code.puml`: 代码图
- `public/`: 静态资源
- `styles/`: 全局 CSS 样式

## 项目部署

运行以下命令部署项目:

```bash
pnpm build
pnpm start
```

## 许可证

MIT

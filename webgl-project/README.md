# WebGL 项目

这是一个基于 Next.js 和 Three.js 的 WebGL 项目，用于展示和交互 3D 模型。

## 项目结构

```
webgl-project/
├── docs/            # C4 架构文档
├── app/             # Next.js 应用代码
├── components/      # UI 组件
├── public/          # 静态资源
│   └── assets/3d/   # 3D 模型文件
├── styles/          # 全局样式
└── lib/             # 工具函数
```

## 主要技术栈

- Next.js 14
- Three.js
- Shadcn UI 组件库
- Tailwind CSS

## 快速开始

1. 安装依赖：

```bash
npm install
```

2. 运行开发服务器：

```bash
npm run dev
```

3. 访问：

```
http://localhost:3000
```

## 项目文档

详细架构设计请查看 [docs/README.md](./docs/README.md) 中的 C4 模型文档。

## 开发说明

- 3D 模型应放置在 `public/assets/3d/` 目录下
- 主要 3D 渲染逻辑在 `app/page.tsx` 中
- UI 组件使用 Shadcn 的预制组件

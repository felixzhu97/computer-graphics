# 计算机图形学指南

> 一个综合性的计算机图形学学习和实践项目集合，涵盖 WebGL、Three.js 和 WebGPU 等多种 3D 图形技术。

## 📖 项目简介

本项目是一个开源的计算机图形学教学和实践平台，旨在通过实际的代码案例帮助开发者学习和掌握现代 3D 图形渲染技术。项目包含从基础的 WebGL 原生 API 到高级的 Three.js 框架应用，以及前沿的 WebGPU 技术等多个层次的实践案例。

### 项目目标

- 🎯 **教学导向**：提供清晰的代码示例和文档，帮助初学者理解 3D 图形渲染原理
- 🔬 **实践验证**：通过实际项目展示不同技术栈的特点和适用场景
- 📚 **知识体系**：构建从基础到进阶的完整学习路径
- 🏗️ **架构规范**：遵循整洁架构原则，提供可维护的代码结构

## 📁 项目结构

本项目采用 Monorepo 结构，包含以下子项目：

```
computer-graphics-guide/
├── computer-graphics-guide/    # 原生 WebGL 2.0 教程案例
├── cool-threejs/               # 3D 目标射击游戏
├── threejs-globe-stripe/       # Three.js 地球可视化
├── vr-game/                    # VR 游戏项目
├── webgl-project/              # WebGL 3D 模型展示
└── webgpu-game/                # WebGPU 游戏项目
```

## 🚀 子项目列表

### 1. computer-graphics-guide

**技术栈**: WebGL 2.0、TypeScript、Vite

**描述**: 基于原生 WebGL 2.0 API 的 3D 图形学教学案例，包含完整的数学库（向量、矩阵运算）和渲染引擎实现。

**特点**:
- ✅ 完整的数学库实现（Vec3、Vec4、Mat4）
- ✅ WebGL 渲染引擎封装
- ✅ 着色器管理器
- ✅ 几何体管理器
- ✅ 完整的单元测试覆盖

**运行方式**:
```bash
cd computer-graphics-guide
pnpm install
pnpm dev
```

**文档**: 查看项目内的 `index.html` 和测试文件了解更多细节。

---

### 2. cool-threejs

**技术栈**: Next.js 15、Three.js、React Three Fiber、TypeScript、Tailwind CSS

**描述**: 一个基于 Three.js 构建的 3D 目标射击游戏，展示了使用 React Three Fiber 创建交互式 3D 应用的完整流程。

**特点**:
- 🎯 10 个随机颜色的 3D 目标
- ⏱️ 60 秒倒计时游戏模式
- 📈 动态难度系统
- ✨ 击中目标时的粒子特效
- 🎮 响应式游戏 UI
- 🔄 自动旋转相机视角

**运行方式**:
```bash
cd cool-threejs
pnpm install
pnpm dev
```

**文档**: 查看 [README.md](./cool-threejs/README.md) 和 [架构文档](./cool-threejs/docs/architecture.md)

---

### 3. threejs-globe-stripe

**技术栈**: Three.js、原生 JavaScript

**描述**: 使用 Three.js 创建的地球可视化项目，展示带有飞行线条的 3D 地球效果。

**特点**:
- 🌍 3D 地球模型
- ✈️ 飞行线条动画效果
- 🎨 自定义视觉效果

**运行方式**:
```bash
cd threejs-globe-stripe
npm install
npm start
# 或
npm run dev
```

**文档**: 查看 [README.md](./threejs-globe-stripe/README.md)

---

### 4. vr-game

**技术栈**: Next.js 14、Three.js、TypeScript、Tailwind CSS、Framer Motion

**描述**: 基于 Web 的虚拟现实游戏项目，提供沉浸式的 VR 体验，支持桌面和移动设备。

**特点**:
- 🥽 沉浸式 VR 体验
- 📱 响应式设计（支持桌面和移动设备）
- 🎮 自定义 3D 图形和交互

**运行方式**:
```bash
cd vr-game
pnpm install
pnpm dev
```

**文档**: 查看 [README.md](./vr-game/README.md) 和 [C4 架构文档](./vr-game/docs/c4/)

---

### 5. webgl-project

**技术栈**: Next.js 14、Three.js、TypeScript、Shadcn UI、Tailwind CSS

**描述**: 基于 Next.js 和 Three.js 的 WebGL 项目，用于展示和交互 3D 模型。

**特点**:
- 🎨 3D 模型加载和展示
- 🖱️ 交互式模型控制
- 🎯 现代化的 UI 设计

**运行方式**:
```bash
cd webgl-project
pnpm install
pnpm dev
```

**文档**: 查看 [README.md](./webgl-project/README.md) 和 [C4 架构文档](./webgl-project/docs/)

---

### 6. webgpu-game

**技术栈**: Next.js 15、WebGPU、TypeScript、Tailwind CSS

**描述**: 基于 WebGPU API 的游戏项目，展示了下一代 Web 图形技术的应用。

**特点**:
- ⚡ WebGPU 高性能渲染
- 🎮 游戏引擎实现
- 🔧 现代化的控制界面

**运行方式**:
```bash
cd webgpu-game
pnpm install
pnpm dev
```

**文档**: 查看 [README.md](./webgpu-game/README.md) 和 [C4 架构文档](./webgpu-game/docs/)

## 🛠️ 技术栈概览

### 核心技术

| 技术 | 用途 | 相关项目 |
|------|------|----------|
| **WebGL 2.0** | 原生 Web 图形 API | computer-graphics-guide |
| **Three.js** | 3D 图形库 | cool-threejs, threejs-globe-stripe, vr-game, webgl-project |
| **WebGPU** | 下一代 Web 图形 API | webgpu-game |
| **React Three Fiber** | Three.js 的 React 封装 | cool-threejs |
| **Next.js** | React 框架 | cool-threejs, vr-game, webgl-project, webgpu-game |
| **TypeScript** | 类型安全的 JavaScript | 所有项目 |
| **Vite** | 现代化构建工具 | computer-graphics-guide |

### 开发工具

- **包管理器**: pnpm（推荐）、npm、yarn
- **测试框架**: Vitest
- **代码规范**: TypeScript、ESLint
- **样式方案**: Tailwind CSS

## 🏃 快速开始

### 前置要求

- Node.js 18+ 
- pnpm（推荐）或 npm/yarn

### 运行单个项目

每个子项目都是独立的，可以单独运行：

```bash
# 1. 进入项目目录
cd <项目名称>

# 2. 安装依赖
pnpm install
# 或
npm install

# 3. 启动开发服务器
pnpm dev
# 或
npm run dev
```

### 运行所有项目

由于各项目技术栈不同，建议分别运行。每个项目都有独立的依赖和配置。

## 📚 学习路径建议

### 初学者路径

1. **基础入门**: 从 `computer-graphics-guide` 开始，了解 WebGL 基础概念
2. **框架应用**: 学习 `threejs-globe-stripe`，理解 Three.js 的基本使用
3. **项目实践**: 研究 `webgl-project`，学习如何集成到现代 Web 应用中

### 进阶路径

1. **游戏开发**: 深入学习 `cool-threejs` 的游戏开发模式
2. **VR 体验**: 探索 `vr-game` 的 VR 交互实现
3. **前沿技术**: 体验 `webgpu-game` 的 WebGPU 特性

## 📖 项目文档

各子项目的详细文档请查看对应目录下的 README.md：

- [computer-graphics-guide](./computer-graphics-guide/) - 基础教程
- [cool-threejs](./cool-threejs/README.md) - 3D 射击游戏
- [threejs-globe-stripe](./threejs-globe-stripe/README.md) - 地球可视化
- [vr-game](./vr-game/README.md) - VR 游戏
- [webgl-project](./webgl-project/README.md) - WebGL 项目
- [webgpu-game](./webgpu-game/README.md) - WebGPU 游戏

## 🏗️ 架构原则

本项目遵循**整洁架构（Clean Architecture）**原则：

- **分层设计**: 领域层、应用层、基础设施层清晰分离
- **依赖倒置**: 依赖关系指向抽象而非具体实现
- **单一职责**: 每个模块和类都有明确的职责
- **测试友好**: 代码结构便于单元测试和集成测试

### 代码组织示例

```
项目结构示例（computer-graphics-guide）:
├── src/
│   ├── math/           # 领域层：核心数学库
│   ├── render/         # 应用层：渲染逻辑
│   └── scene/          # 应用层：场景管理
└── tests/              # 测试代码
    └── [对应模块的测试]
```

## 🤝 贡献指南

欢迎贡献代码、提出建议或报告问题！

### 贡献步骤

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 遵循项目的 TypeScript 配置和 ESLint 规则
- 编写清晰的注释和文档
- 添加适当的单元测试
- 保持代码风格一致

### 提交信息规范

使用清晰、描述性的提交信息：

```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加或修改测试
chore: 构建过程或辅助工具的变动
```

## 📄 许可证

[Apache-2.0](LICENSE) © 2026 Felix Zhu

## 社区

- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security](SECURITY.md)

## 🙏 致谢

感谢所有为本项目做出贡献的开发者和开源社区！

---

**Happy Coding! 🎉**


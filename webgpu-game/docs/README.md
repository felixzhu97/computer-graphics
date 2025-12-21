# WebGPU 游戏系统 C4 模型文档

本文档包含 WebGPU 游戏系统的 C4 模型图，使用 PlantUML 格式绘制。

## 文件说明

1. `C4_Context.puml` - 系统上下文图

   - 展示系统与外部用户和系统的关系
   - 主要元素：用户、系统边界

2. `C4_Container.puml` - 容器图

   - 展示系统内部的主要容器及其关系
   - 主要元素：前端应用、后端服务、数据库

3. `C4_Component.puml` - 组件图

   - 展示容器内部的组件及其关系
   - 主要元素：游戏界面、控制面板、游戏引擎等

4. `C4_Code.puml` - 类图
   - 展示代码级别的类结构
   - 主要元素：Game、WebGPURenderer 等核心类

## 查看图表

1. 安装 PlantUML 插件到你的 IDE 或使用在线查看器
2. 确保网络连接以加载 C4 PlantUML 库
3. 打开任意.puml 文件并渲染

## 依赖

- PlantUML
- C4-PlantUML 库(自动从 GitHub 加载)

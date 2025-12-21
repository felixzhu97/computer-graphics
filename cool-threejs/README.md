# Cool ThreeJS - 3D 目标射击游戏

![游戏截图](public/placeholder.jpg)

一个基于 Next.js 和 Three.js 构建的 3D 目标射击游戏，玩家需要在限定时间内点击移动的目标获取分数。

## 技术栈

- **框架**: Next.js 15
- **3D 引擎**: Three.js + @react-three/fiber
- **UI 组件**: Radix UI + 自定义组件
- **样式**: Tailwind CSS
- **动画**: @react-spring/three
- **表单验证**: react-hook-form + zod

## 功能特点

- 🎯 10 个随机颜色的 3D 目标
- ⏱️ 60 秒倒计时游戏模式
- 📈 动态难度系统（随游戏时间增加）
- ✨ 击中目标时的粒子特效
- 🎮 响应式游戏 UI
- 🔄 自动旋转相机视角

## 安装与运行

1. 克隆仓库：

```bash
git clone https://github.com/your-repo/cool-threejs.git
cd cool-threejs
```

2. 安装依赖：

```bash
pnpm install
# 或
yarn install
# 或
npm install
```

3. 运行开发服务器：

```bash
pnpm dev
# 或
yarn dev
# 或
npm run dev
```

4. 打开浏览器访问：

```
http://localhost:3000
```

## 项目结构

```
cool-threejs/
├── app/                  # Next.js应用路由
│   ├── layout.tsx        # 全局布局
│   └── page.tsx          # 主页面
├── components/           # 组件
│   ├── three-scene.tsx   # 3D游戏场景
│   ├── game-ui.tsx       # 游戏UI
│   └── ui/               # UI组件库
├── public/               # 静态资源
└── styles/               # 全局样式
```

## 开发指南

1. 修改 3D 场景：

   - 编辑`components/three-scene.tsx`
   - 调整目标数量、移动模式等参数

2. 修改游戏逻辑：

   - 游戏状态管理在`ThreeScene`组件中
   - 难度系数随时间自动增加

3. 自定义 UI：

   - 使用 Tailwind CSS 类名修改样式
   - UI 组件位于`components/ui`目录

4. 构建生产版本：

```bash
pnpm build
# 或
yarn build
# 或
npm run build
```

## 贡献

欢迎提交 Pull Request 或 Issue 报告问题。

## 许可证

MIT

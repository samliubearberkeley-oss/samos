# 项目结构说明

## 📁 目录结构

```
samOS/
├── assets/                    # 原始资源文件（未使用的资源）
│   └── original-resources/    # 原始图标和资源文件（.icns, .png）
│
├── dist/                      # 构建输出目录（自动生成，已忽略）
│
├── node_modules/              # 依赖包（已忽略）
│
├── public/                    # 公共静态资源
│   └── icons/                 # 项目使用的图标文件
│       ├── apple-icon.png
│       ├── applications-icon.png
│       ├── chatgpt-icon.png
│       ├── finder-icon.png
│       ├── ie-icon.png
│       ├── ipod-icon.png
│       ├── macintosh-hd-icon.png
│       └── trash-icon.png
│
├── src/                       # 源代码目录
│   ├── App.jsx                # 主应用组件
│   ├── main.jsx               # 应用入口文件
│   └── index.css              # 全局样式文件
│
├── index.html                 # HTML 入口文件
├── package.json               # 项目配置和依赖
├── package-lock.json          # 依赖锁定文件
├── vite.config.js             # Vite 构建配置
├── tailwind.config.js         # Tailwind CSS 配置
├── postcss.config.js          # PostCSS 配置
├── .gitignore                 # Git 忽略文件
└── README.md                  # 项目说明文档
```

## 📝 文件说明

### 核心文件
- **src/App.jsx**: 主应用组件，包含所有 UI 组件和逻辑
- **src/main.jsx**: React 应用入口点
- **src/index.css**: 全局样式和 Tailwind CSS 导入
- **index.html**: HTML 模板

### 配置文件
- **vite.config.js**: Vite 开发服务器和构建配置
- **tailwind.config.js**: Tailwind CSS 主题和插件配置
- **postcss.config.js**: PostCSS 处理配置
- **package.json**: 项目依赖和脚本命令

### 资源文件
- **public/icons/**: 项目实际使用的图标文件（通过 `/icons/` 路径访问）
- **assets/original-resources/**: 原始资源文件备份（未在代码中使用）

### 构建输出
- **dist/**: 生产构建输出目录（由 `npm run build` 生成）

## 🎯 项目特点

- macOS Aqua 风格的复古界面
- React + Vite + Tailwind CSS 技术栈
- 响应式设计和交互式 Dock
- 窗口管理系统
- 菜单栏和实时时钟

## 📦 依赖管理

主要依赖：
- `react`: React 框架
- `react-dom`: React DOM 渲染
- `lucide-react`: 图标库
- `tailwindcss`: CSS 框架
- `vite`: 构建工具

## 🚀 开发命令

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
```


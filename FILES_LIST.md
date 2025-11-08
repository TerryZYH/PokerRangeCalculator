# 项目文件清单

## 📂 项目结构

```
po4/
├── 📄 配置文件
│   ├── .eslintrc.cjs              # ESLint 代码检查配置
│   ├── .gitignore                 # Git 忽略文件配置
│   ├── package.json               # 项目依赖和脚本配置
│   ├── postcss.config.js          # PostCSS 配置
│   ├── tailwind.config.js         # Tailwind CSS 配置
│   ├── tsconfig.json              # TypeScript 配置
│   ├── tsconfig.node.json         # Node.js TypeScript 配置
│   └── vite.config.ts             # Vite 构建工具配置
│
├── 📚 文档文件
│   ├── README.md                  # 项目主文档（完整介绍）
│   ├── QUICK_START.md             # 快速启动指南
│   ├── PROJECT_SUMMARY.md         # 项目总结报告
│   ├── FEATURES.md                # 功能清单详细说明
│   ├── DEPLOYMENT.md              # 部署指南
│   └── FILES_LIST.md              # 本文件（文件清单）
│
├── 🎨 静态资源
│   └── public/
│       └── vite.svg               # 应用图标（扑克主题）
│
├── 📝 入口文件
│   └── index.html                 # HTML 入口模板
│
├── 🛠️ 脚本文件
│   └── scripts/
│       └── setup.sh               # 自动安装脚本
│
└── 💻 源代码 (src/)
    ├── App.tsx                    # 主应用组件（核心逻辑）
    ├── main.tsx                   # 应用入口文件
    ├── index.css                  # 全局样式（Tailwind + 自定义）
    │
    ├── 🧩 组件 (components/)
    │   ├── HandCell.tsx           # 手牌单元格组件
    │   ├── HandMatrix.tsx         # 13x13 矩阵组件（核心）
    │   ├── ProbabilityDisplay.tsx # 概率显示组件
    │   ├── RangeSelector.tsx      # 范围选择器组件
    │   └── BatchOperations.tsx    # 批量操作组件
    │
    ├── 📊 数据 (data/)
    │   ├── ranks.ts               # 牌力排序常量
    │   └── presetRanges.ts        # 12个预设范围配置
    │
    ├── 🏷️ 类型 (types/)
    │   └── index.ts               # TypeScript 类型定义
    │
    └── 🔧 工具 (utils/)
        ├── handGenerator.ts       # 手牌矩阵生成器
        ├── probability.ts         # 概率计算逻辑
        └── storage.ts             # 本地存储管理

```

## 📊 文件统计

### 按类型统计

| 类型 | 数量 | 说明 |
|------|------|------|
| 配置文件 | 8 | 项目配置（TypeScript, ESLint, Vite等） |
| 文档文件 | 6 | 完整的项目文档 |
| TypeScript/TSX | 13 | 源代码文件 |
| CSS | 1 | 全局样式 |
| HTML | 1 | 入口模板 |
| Shell | 1 | 安装脚本 |
| SVG | 1 | 应用图标 |
| **总计** | **31** | - |

### 按功能模块统计

| 模块 | 文件数 | 代码行数（估算） |
|------|--------|------------------|
| 组件层 | 5 | ~800 行 |
| 数据层 | 2 | ~300 行 |
| 工具层 | 3 | ~300 行 |
| 类型定义 | 1 | ~60 行 |
| 应用入口 | 2 | ~200 行 |
| 配置文件 | 8 | ~200 行 |
| 文档 | 6 | ~2000 行 |
| **总计** | **27** | **~3860 行** |

## 📝 核心文件说明

### 🔴 核心组件（必读）

#### 1. `src/App.tsx` (主应用)
- **作用**: 应用主逻辑，状态管理中心
- **功能**: 
  - 范围管理（创建、删除、切换）
  - 数据持久化
  - 导入导出
  - 通知系统
- **代码行数**: ~200+ 行

#### 2. `src/components/HandMatrix.tsx` (手牌矩阵)
- **作用**: 13x13 手牌矩阵核心组件
- **功能**:
  - 矩阵渲染
  - 单点选择
  - 滑动多选
  - 触摸支持
- **代码行数**: ~150+ 行

#### 3. `src/data/presetRanges.ts` (预设范围)
- **作用**: 12个预设范围配置
- **内容**:
  - UTG/HJ/CO/BTN/SB/BB Open
  - 3-Bet, Call 3-Bet
  - 4-Bet, Call 4-Bet
  - Flop Check/Bet
- **代码行数**: ~200+ 行

### 🟡 重要组件

#### 4. `src/components/RangeSelector.tsx` (范围选择器)
- 范围列表展示
- 创建/编辑/删除范围
- 收藏功能
- 导入导出界面

#### 5. `src/components/BatchOperations.tsx` (批量操作)
- 全选/清空/反选
- 按类型选择
- 智能按钮状态

#### 6. `src/components/ProbabilityDisplay.tsx` (概率显示)
- 实时概率计算展示
- 格式化输出
- 计算公式说明

### 🟢 工具函数

#### 7. `src/utils/storage.ts` (存储管理)
- LocalStorage 读写
- 导入导出 JSON
- 数据格式转换

#### 8. `src/utils/probability.ts` (概率计算)
- 概率计算公式
- 范围对比
- 格式化输出

#### 9. `src/utils/handGenerator.ts` (手牌生成)
- 生成 13x13 矩阵
- 手牌查找
- 范围解析

## 📚 文档文件说明

### README.md
- **作用**: 项目主文档
- **内容**: 功能介绍、技术栈、使用指南
- **适合**: 首次了解项目

### QUICK_START.md
- **作用**: 快速启动指南
- **内容**: 安装步骤、启动命令、常见问题
- **适合**: 快速上手使用

### PROJECT_SUMMARY.md
- **作用**: 项目总结报告
- **内容**: 完成度分析、技术细节、项目亮点
- **适合**: 了解项目全貌

### FEATURES.md
- **作用**: 功能清单
- **内容**: 所有功能详细列表（已实现/未实现）
- **适合**: 功能查询

### DEPLOYMENT.md
- **作用**: 部署指南
- **内容**: 各种部署方案、CI/CD配置
- **适合**: 生产部署

### FILES_LIST.md
- **作用**: 文件清单（本文件）
- **内容**: 项目结构、文件说明
- **适合**: 代码导航

## 🔧 配置文件说明

| 文件 | 作用 | 必需 |
|------|------|------|
| package.json | npm 依赖和脚本 | ✅ |
| tsconfig.json | TypeScript 编译配置 | ✅ |
| vite.config.ts | Vite 构建配置 | ✅ |
| tailwind.config.js | Tailwind CSS 配置 | ✅ |
| postcss.config.js | PostCSS 配置 | ✅ |
| .eslintrc.cjs | 代码检查规则 | ✅ |
| .gitignore | Git 忽略规则 | ✅ |
| tsconfig.node.json | Node.js TS 配置 | ✅ |

## 🎯 文件导航指南

### 想要...

#### 了解项目功能？
→ 阅读 `README.md` 和 `FEATURES.md`

#### 快速启动项目？
→ 按照 `QUICK_START.md` 操作

#### 修改手牌矩阵？
→ 编辑 `src/components/HandMatrix.tsx`

#### 添加预设范围？
→ 修改 `src/data/presetRanges.ts`

#### 调整概率计算？
→ 编辑 `src/utils/probability.ts`

#### 修改存储逻辑？
→ 编辑 `src/utils/storage.ts`

#### 调整样式？
→ 修改 `src/index.css` 或组件内的 Tailwind 类名

#### 部署到生产？
→ 参考 `DEPLOYMENT.md`

#### 了解开发进度？
→ 查看 `PROJECT_SUMMARY.md`

## 📦 依赖关系

```
App.tsx
  ├─→ HandMatrix
  │     └─→ HandCell
  ├─→ ProbabilityDisplay
  ├─→ RangeSelector
  └─→ BatchOperations

utils/
  ├─→ handGenerator
  ├─→ probability
  └─→ storage

data/
  ├─→ ranks
  └─→ presetRanges
```

## 🚀 开始开发

1. 阅读 `README.md` 了解项目
2. 执行 `npm install` 安装依赖
3. 运行 `npm run dev` 启动开发
4. 修改代码，浏览器自动刷新
5. 参考各文档文件了解细节

## 📞 获取帮助

- **功能问题**: 查看 `FEATURES.md`
- **启动问题**: 查看 `QUICK_START.md`
- **部署问题**: 查看 `DEPLOYMENT.md`
- **代码问题**: 查看源码注释

---

**所有文件齐全，项目完整可用！** ✅


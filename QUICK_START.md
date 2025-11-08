# 快速启动指南

## 安装依赖

由于您的系统可能存在 npm 缓存权限问题，请先执行以下命令修复：

```bash
# 方法1：修复npm缓存权限（推荐）
sudo chown -R $(whoami) ~/.npm

# 然后安装依赖
npm install
```

或者使用临时缓存：

```bash
# 方法2：使用临时缓存目录
npm install --cache /tmp/.npm-cache --force
```

或者使用 yarn（如果已安装）：

```bash
# 方法3：使用yarn
yarn install
```

## 启动开发服务器

```bash
npm run dev
```

或

```bash
yarn dev
```

应用将在 http://localhost:3000 启动

## 构建生产版本

```bash
npm run build
```

或

```bash
yarn build
```

## 功能特性

✅ 13x13 手牌矩阵可视化
✅ 点击和滑动多选手牌
✅ 实时概率计算
✅ 12个预设范围（UTG/HJ/CO/BTN/SB/BB Open等）
✅ 自定义范围管理
✅ 收藏功能
✅ 批量操作（全选/反选/按类型选择）
✅ 本地存储（数据持久化）
✅ 导入/导出功能
✅ 响应式设计（支持移动端）
✅ 美观的UI设计

## 项目结构

```
po4/
├── src/
│   ├── components/          # React 组件
│   │   ├── HandCell.tsx     # 手牌单元格
│   │   ├── HandMatrix.tsx   # 13x13 矩阵
│   │   ├── ProbabilityDisplay.tsx  # 概率显示
│   │   ├── RangeSelector.tsx       # 范围选择器
│   │   └── BatchOperations.tsx     # 批量操作
│   ├── data/                # 数据配置
│   │   ├── ranks.ts         # 牌力排序
│   │   └── presetRanges.ts  # 预设范围
│   ├── types/               # TypeScript 类型
│   │   └── index.ts
│   ├── utils/               # 工具函数
│   │   ├── handGenerator.ts # 手牌生成
│   │   ├── probability.ts   # 概率计算
│   │   └── storage.ts       # 本地存储
│   ├── App.tsx              # 主应用
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── public/                  # 静态资源
├── index.html              # HTML 模板
├── package.json            # 依赖配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
├── tailwind.config.js      # Tailwind CSS 配置
└── README.md               # 项目文档
```

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite 5** - 构建工具
- **Tailwind CSS 3** - 样式框架
- **Lucide React** - 图标库

## 常见问题

### Q: npm install 失败？
A: 尝试清理缓存 `npm cache clean --force` 或使用 yarn

### Q: 数据会丢失吗？
A: 所有数据存储在浏览器 LocalStorage，清除浏览器数据会导致丢失，建议定期导出备份

### Q: 支持哪些浏览器？
A: Chrome/Firefox/Safari/Edge 最新版本，移动端支持 iOS Safari 和 Android Chrome

### Q: 可以离线使用吗？
A: 构建后的生产版本可以部署为离线应用（PWA）

## 下一步优化建议

1. **多语言支持**：添加英文界面
2. **范围对比**：同时查看两个范围的差异
3. **云端同步**：支持账号登录和多设备同步
4. **范围历史**：保存最近使用的10个范围
5. **高级统计**：添加图表可视化
6. **PWA支持**：支持离线使用和桌面安装
7. **主题切换**：支持深色模式

## 支持

如有问题，请参考 README.md 或提交 Issue。

祝您游戏愉快！🃏


# 开发指南

## 📖 目录

- [开发环境搭建](#开发环境搭建)
- [代码规范](#代码规范)
- [开发流程](#开发流程)
- [部署指南](#部署指南)
- [故障排查](#故障排查)

---

## 🛠️ 开发环境搭建

### 环境要求

| 工具 | 版本要求 | 说明 |
|------|---------|------|
| Node.js | ≥ 18.0.0 | JavaScript 运行时 |
| npm | ≥ 8.0.0 | 包管理器 |
| Git | 最新版 | 版本控制 |

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd po4
```

#### 2. 安装依赖

```bash
npm install
```

如遇权限问题：

```bash
# 修复 npm 缓存权限
sudo chown -R $(whoami) ~/.npm

# 或使用临时缓存
npm install --cache /tmp/.npm-cache

# 或使用 yarn
yarn install
```

#### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

#### 4. 构建生产版本

```bash
npm run build
```

输出到 `dist/` 目录

#### 5. 预览构建

```bash
npm run preview
```

---

## 📝 代码规范

### TypeScript 规范

#### 类型定义

```typescript
// ✅ 好的实践
interface Range {
  id: string;
  name: string;
  hands: Set<string>;
}

// ❌ 避免使用 any
const data: any = {};

// ✅ 使用具体类型
const data: Range = { ... };
```

#### 函数声明

```typescript
// ✅ 明确的参数和返回类型
function calculateProbability(hands: Set<string>): number {
  // ...
}

// ✅ 使用箭头函数
const handleClick = (id: string): void => {
  // ...
};
```

### React 规范

#### 组件结构

```typescript
// ✅ 函数组件 + TypeScript
interface MyComponentProps {
  name: string;
  onAction: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  name, 
  onAction 
}) => {
  // Hooks
  const [state, setState] = useState();
  
  // 事件处理
  const handleEvent = useCallback(() => {
    // ...
  }, [依赖]);
  
  // 渲染
  return <div>...</div>;
};
```

#### Hooks 使用

```typescript
// ✅ 正确的依赖数组
useEffect(() => {
  // ...
}, [dependency]);

// ✅ useCallback 优化
const memoizedCallback = useCallback(() => {
  // ...
}, [dependency]);

// ✅ useMemo 优化
const memoizedValue = useMemo(() => {
  return expensiveCalculation();
}, [dependency]);
```

### 样式规范

#### Tailwind CSS

```tsx
// ✅ 使用 Tailwind 类名
<div className="flex items-center justify-between p-4 rounded-lg">
  ...
</div>

// ✅ 响应式设计
<div className="text-sm sm:text-base md:text-lg">
  ...
</div>

// ✅ 状态样式
<div className={`
  px-4 py-2 rounded
  ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200'}
`}>
  ...
</div>
```

### 命名规范

```typescript
// 组件：PascalCase
HandMatrix.tsx
ProbabilityDisplay.tsx

// 函数：camelCase
calculateProbability()
handleRangeSelect()

// 常量：UPPER_SNAKE_CASE
const TOTAL_HAND_COMBINATIONS = 1326;

// 类型/接口：PascalCase
interface Range {}
type HandType = 'pair' | 'suited' | 'offsuit';

// 文件名：kebab-case 或 PascalCase
probability.ts
HandMatrix.tsx
```

---

## 🔄 开发流程

### 分支策略

```
main        - 生产分支（稳定版本）
  ↓
develop     - 开发分支（最新代码）
  ↓
feature/*   - 功能分支
bugfix/*    - 修复分支
hotfix/*    - 紧急修复
```

### 开发步骤

#### 1. 创建功能分支

```bash
git checkout develop
git pull origin develop
git checkout -b feature/new-feature
```

#### 2. 开发功能

```bash
# 启动开发服务器
npm run dev

# 编写代码...
# 测试功能...
```

#### 3. 代码检查

```bash
# TypeScript 检查
npm run build

# ESLint 检查
npm run lint

# 格式化代码
npm run format
```

#### 4. 提交代码

```bash
git add .
git commit -m "feat: 添加新功能"
```

**Commit 消息规范**：

```
feat:     新功能
fix:      修复 bug
docs:     文档更新
style:    代码格式（不影响功能）
refactor: 重构
perf:     性能优化
test:     测试
chore:    构建/工具变动
```

#### 5. 合并代码

```bash
git push origin feature/new-feature

# 创建 Pull Request
# Code Review
# 合并到 develop
```

---

## 🚀 部署指南

### 静态部署

#### Vercel（推荐）

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel

# 生产部署
vercel --prod
```

**Web 界面部署**：
1. 访问 https://vercel.com
2. 导入 Git 仓库
3. 自动检测 Vite 配置
4. 点击部署

#### Netlify

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 部署
netlify deploy --prod
```

**配置**：
- Build command: `npm run build`
- Publish directory: `dist`

#### GitHub Pages

1. 修改 `vite.config.ts`：
```typescript
export default defineConfig({
  base: '/po4/',  // 仓库名
  plugins: [react()],
})
```

2. 添加部署脚本到 `package.json`：
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. 部署：
```bash
npm install --save-dev gh-pages
npm run deploy
```

### Docker 部署

#### Dockerfile

```dockerfile
# 构建阶段
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### 构建和运行

```bash
# 构建镜像
docker build -t poker-range-calculator .

# 运行容器
docker run -p 80:80 poker-range-calculator
```

### 云服务部署

#### AWS S3 + CloudFront

```bash
# 构建
npm run build

# 上传到 S3
aws s3 sync dist/ s3://your-bucket-name

# 配置 CloudFront 分发
```

#### 阿里云 OSS

```bash
# 构建
npm run build

# 上传到 OSS
ossutil cp -r dist/ oss://your-bucket-name/
```

---

## 🔍 故障排查

### 常见问题

#### 1. npm install 失败

**问题**：权限错误或依赖冲突

**解决方案**：
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

#### 2. 端口被占用

**问题**：3000 端口已被使用

**解决方案**：
```bash
# 查找进程
lsof -ti:3000

# 杀掉进程
kill -9 $(lsof -ti:3000)

# 或修改端口
# vite.config.ts: server.port = 3001
```

#### 3. TypeScript 错误

**问题**：类型检查失败

**解决方案**：
```bash
# 检查错误
npm run build

# 查看详细错误
tsc --noEmit

# 修复类型定义
```

#### 4. 构建失败

**问题**：Vite 构建报错

**解决方案**：
```bash
# 清理缓存
rm -rf node_modules/.vite

# 重新构建
npm run build

# 查看详细日志
npm run build -- --debug
```

#### 5. 热更新不工作

**问题**：修改代码不自动刷新

**解决方案**：
```bash
# 重启开发服务器
npm run dev

# 检查文件监听
# macOS 可能需要增加文件监听数
```

### 调试技巧

#### 浏览器调试

```typescript
// 添加断点
debugger;

// Console 日志
console.log('Debug info:', data);

// 性能分析
console.time('operation');
// ... 代码 ...
console.timeEnd('operation');
```

#### React DevTools

1. 安装浏览器扩展
2. 查看组件树
3. 检查 Props 和 State
4. 性能分析

#### Vite 调试

```bash
# 详细日志
npm run dev -- --debug

# 清理缓存
rm -rf node_modules/.vite
```

---

## 📊 性能优化

### 构建优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react']
        }
      }
    }
  }
});
```

### 代码分割

```typescript
// 路由懒加载
const Component = lazy(() => import('./Component'));

// 使用 Suspense
<Suspense fallback={<Loading />}>
  <Component />
</Suspense>
```

### 图片优化

```typescript
// 使用 WebP 格式
// 懒加载图片
// 响应式图片
```

---

## 🧪 测试

### 单元测试

```bash
# 安装测试工具
npm install --save-dev vitest @testing-library/react

# 运行测试
npm run test
```

### E2E 测试

```bash
# 安装 Playwright
npm install --save-dev @playwright/test

# 运行测试
npm run test:e2e
```

---

## 📚 参考资料

### 官方文档
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

### 最佳实践
- [React Patterns](https://reactpatterns.com/)
- [TypeScript Best Practices](https://github.com/typescript-cheatsheets/react)
- [Clean Code](https://github.com/ryanmcdermott/clean-code-javascript)

---

## 🤝 贡献指南

### Pull Request 流程

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request
5. Code Review
6. 合并代码

### Code Review 检查清单

- [ ] 代码符合规范
- [ ] TypeScript 无错误
- [ ] ESLint 通过
- [ ] 功能测试通过
- [ ] 文档已更新
- [ ] Commit 消息规范

---

**欢迎贡献代码，共同改进项目！** 🚀


# 部署指南

本文档介绍如何将德州扑克手牌范围计算器部署到生产环境。

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

## 生产构建

### 构建命令

```bash
npm run build
```

构建产物将输出到 `dist` 目录，包含：
- HTML、CSS、JavaScript 静态文件
- 优化后的资源（压缩、分块）
- Source maps（可选）

### 预览构建

```bash
npm run preview
```

## 部署选项

### 1. Vercel（推荐）

最简单的部署方式，自动CI/CD。

#### 步骤：

1. 安装 Vercel CLI：
```bash
npm install -g vercel
```

2. 登录 Vercel：
```bash
vercel login
```

3. 部署：
```bash
vercel
```

4. 生产部署：
```bash
vercel --prod
```

#### 或使用 Web 界面：

1. 访问 https://vercel.com
2. 导入 Git 仓库
3. 自动检测 Vite 配置
4. 点击部署

### 2. Netlify

#### 通过 Web 界面：

1. 访问 https://netlify.com
2. 连接 Git 仓库
3. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
4. 点击部署

#### 通过 CLI：

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 部署
netlify deploy --prod
```

### 3. GitHub Pages

#### 步骤：

1. 安装 gh-pages：
```bash
npm install --save-dev gh-pages
```

2. 修改 `vite.config.ts`，添加 base：
```typescript
export default defineConfig({
  base: '/po4/',  // 替换为你的仓库名
  plugins: [react()],
})
```

3. 添加部署脚本到 `package.json`：
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

4. 部署：
```bash
npm run deploy
```

5. 在 GitHub 仓库设置中启用 GitHub Pages

### 4. 静态服务器

将 `dist` 目录部署到任何静态文件服务器：

#### Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### Apache 配置示例：

创建 `.htaccess` 文件：
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### 5. Docker 部署

#### Dockerfile：

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

#### nginx.conf：

```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

#### 构建和运行：

```bash
# 构建镜像
docker build -t poker-range-calculator .

# 运行容器
docker run -p 80:80 poker-range-calculator
```

### 6. 云服务平台

#### AWS S3 + CloudFront

1. 构建项目：
```bash
npm run build
```

2. 上传 `dist` 到 S3 桶

3. 配置 S3 静态网站托管

4. 设置 CloudFront 分发

#### 阿里云 OSS

1. 构建项目

2. 上传到 OSS 桶

3. 启用静态网站功能

4. 配置 CDN 加速

## 环境变量

如需配置环境变量，创建 `.env` 文件：

```env
VITE_APP_TITLE=德州扑克手牌范围计算器
VITE_API_URL=https://api.example.com
```

在代码中使用：
```typescript
const title = import.meta.env.VITE_APP_TITLE;
```

## 性能优化

### 1. 启用 HTTPS
所有生产环境应使用 HTTPS

### 2. 启用 Gzip/Brotli 压缩
减小文件传输大小

### 3. 设置缓存策略
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 4. 使用 CDN
加速静态资源加载

### 5. 预加载关键资源
在 `index.html` 中添加：
```html
<link rel="preload" href="/assets/main.js" as="script">
```

## 监控和分析

### Google Analytics

在 `index.html` 中添加：
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Sentry 错误监控

```bash
npm install @sentry/react
```

在 `main.tsx` 中配置：
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

## 域名配置

### 自定义域名

1. 购买域名
2. 在 DNS 设置中添加记录：
   - A 记录：指向服务器IP
   - CNAME 记录：指向 CDN 域名
3. 配置 SSL 证书（Let's Encrypt 免费）

### SSL 证书

使用 Certbot 自动配置：
```bash
sudo certbot --nginx -d your-domain.com
```

## 检查清单

部署前确认：

- [ ] 所有功能测试通过
- [ ] 生产构建成功
- [ ] 资源正确加载
- [ ] 移动端响应式正常
- [ ] 浏览器兼容性测试
- [ ] 性能测试（Lighthouse）
- [ ] SEO 优化（meta 标签）
- [ ] 404 页面配置
- [ ] HTTPS 配置
- [ ] 域名解析正确
- [ ] 监控配置完成

## 持续集成/部署（CI/CD）

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID}}
        vercel-project-id: ${{ secrets.PROJECT_ID}}
        vercel-args: '--prod'
```

## 常见问题

### Q: 页面刷新后 404？
A: 配置服务器将所有请求重定向到 index.html（SPA 路由）

### Q: 资源加载失败？
A: 检查 `vite.config.ts` 中的 `base` 配置

### Q: 本地存储数据丢失？
A: 浏览器清除数据会导致 LocalStorage 丢失，提醒用户定期导出

### Q: 性能优化建议？
A: 使用 Lighthouse 检测，启用代码分割和懒加载

## 推荐部署方案

**个人项目**: Vercel / Netlify（免费，简单）  
**企业项目**: AWS / 阿里云（可控，稳定）  
**快速演示**: GitHub Pages（免费，快速）

## 更新部署

```bash
# 拉取最新代码
git pull

# 安装依赖（如有更新）
npm install

# 构建
npm run build

# 部署（根据选择的平台）
npm run deploy
```

## 回滚

如需回滚到之前的版本：
```bash
# 查看部署历史（Vercel）
vercel list

# 回滚到指定版本
vercel rollback [deployment-url]
```

---

**选择适合您的部署方案，开始使用吧！** 🚀


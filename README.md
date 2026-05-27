# ⚰️ 代码火葬场 - Code Graveyard

> 每段代码都值得一个体面的葬礼。

一个为开发者打造的社交平台，让你「埋葬」那些被删除、被重构、被遗弃的代码，为它们立碑、写悼词、献花、点蜡烛。

🌐 **线上地址**: [code-graveyard.vercel.app](https://code-graveyard.vercel.app)

## ✨ 功能特性

### 核心功能
- 🪦 **埋葬代码** - 为你的代码创建墓碑，记录它的「死因」和生平
- 💐 **献花悼念** - 给其他人的代码墓碑献花
- 💬 **写悼词** - 为逝去的代码写下最后的话
- 🕯️ **点蜡烛** - 默哀致敬
- 🤖 **AI 悼词** - 一键生成创意悼词

### 发现与探索
- 🔍 **搜索** - 按名称、描述搜索墓碑
- 🎯 **筛选** - 按死因、编程语言筛选
- 📊 **排序** - 按最新、最热门、最多悼词排序
- 🔀 **随机挖坟** - 随机发现一个墓碑
- 🏆 **排行榜** - 最受欢迎的墓碑排名

### 社交互动
- 🔔 **通知系统** - 有人给你献花/写悼词时通知你
- ❤️ **收藏** - 收藏喜欢的墓碑
- 📤 **分享** - 分享到 Twitter/微博，或下载分享图片
- 🚩 **举报** - 举报不当内容

### 数据与统计
- 📈 **数据面板** - 死因分布饼图、语言排行榜、月度趋势
- 👁️ **浏览计数** - 每个墓碑的浏览量
- 📋 **活动时间线** - 全站最新动态

### 体验优化
- 🌙 **暗色/亮色主题** - 跟随心情切换
- 🌐 **中英文切换** - 支持中文和 English
- 📱 **响应式设计** - 手机端完美适配
- ⚡ **骨架屏加载** - 更流畅的加载体验
- 🎨 **代码高亮** - 语法高亮显示代码
- 📊 **Diff 视图** - 重构类代码可查看前后对比
- 🔊 **音效** - 埋葬/献花时的音效反馈
- 💀 **埋葬动画** - 提交后播放棺材下葬动画
- ✨ **背景粒子** - 飘落的 💀🪦🕯️👻⚰️🌸🦇

## 🛠️ 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes + Supabase (PostgreSQL)
- **认证**: NextAuth v4 + GitHub OAuth
- **动画**: Framer Motion
- **图标**: Lucide React
- **主题**: next-themes
- **部署**: Vercel

## 📁 项目结构

```
src/
├── app/
│   ├── page.tsx              # 首页
│   ├── layout.tsx            # 根布局
│   ├── bury/page.tsx         # 埋葬代码页
│   ├── tombstone/[id]/       # 墓碑详情页
│   ├── my-graveyard/         # 我的墓地
│   ├── user/[id]/            # 用户主页
│   ├── leaderboard/          # 排行榜
│   ├── stats/                # 数据统计
│   ├── activity/             # 活动时间线
│   ├── notifications/        # 通知中心
│   ├── bookmarks/            # 收藏夹
│   ├── admin/                # 管理后台
│   └── api/                  # API 路由
├── components/               # 通用组件
├── lib/                      # 工具函数
├── i18n/                     # 国际化翻译
└── types/                    # TypeScript 类型
```

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/JFRTE/code-graveyard.git
cd code-graveyard
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
创建 `.env.local` 文件：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
GITHUB_ID=your_github_oauth_id
GITHUB_SECRET=your_github_oauth_secret
```

### 4. 初始化数据库
在 Supabase SQL Editor 中依次执行：
- `supabase-schema.sql` - 基础表结构
- `supabase-candles.sql` - 蜡烛功能
- `supabase-features.sql` - 书签、举报、浏览计数
- `supabase-activity.sql` - 活动日志

### 5. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000 🎉

## 📄 License

MIT

---

<p align="center">
  用 💀 和 ❤️ 打造<br>
  <a href="https://code-graveyard.vercel.app">code-graveyard.vercel.app</a>
</p>

# 💀 代码火葬场 (Code Graveyard)

一个专门用来埋葬代码的地方。每段代码都值得一个体面的葬礼。

## 功能

- 🪦 墓碑系统 - 每段代码都有墓碑和"死因"
- 💀 死因分类 - 重构牺牲、误删手滑、项目废弃等
- 🌸 献花系统 - 其他开发者可以来献花
- 💬 悼词系统 - 写悼词纪念逝去的代码
- 📊 全球统计 - 实时显示全球埋了多少代码
- 🏠 个人墓地 - 查看你的代码安息之地

## 技术栈

- Next.js 14 + Tailwind CSS + Framer Motion
- Supabase (PostgreSQL)
- NextAuth.js + GitHub OAuth
- Vercel 部署

## 快速开始

1. 配置 `.env.local` 环境变量
2. 在 Supabase 执行 `supabase-schema.sql`
3. `npm install`
4. `npm run dev`

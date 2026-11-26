# 构建控制台（Cloudflare Pages 全栈版）

公网可访问的构建控制台：静态页面 + Pages Functions 后端部署在同一个 Cloudflare Pages 项目，支持 websitebuildtest01 下的 3 个站点。

## 访问地址

**https://tv-build-console.pages.dev**

首次打开需在顶部「访问密钥」框输入密钥并点保存（密钥只存本机浏览器，随请求发送校验）。

## 架构

```
公网页面 (tv-build-console.pages.dev)
   └─ /api/* (Pages Functions，服务端)
         ├─ 校验 X-Access-Key
         ├─ GITHUB_TOKEN (Pages Secret) → GitHub API workflow_dispatch
         └─ 返回运行状态/列表
```

- 页面与 API 同域，无需 CORS 跨域。
- GitHub Token 存于 Pages 项目 Secret，**不在页面代码里**。
- 访问密钥校验防止公开页面被任意触发。

## 目录结构

```
cloud/
  index.html                      静态页面
  wrangler.toml                   项目配置
  functions/
    _lib.js                       共享逻辑（站点配置、鉴权、GitHub 调用）
    api/config.js                 GET  /api/config
    api/trigger/[key].js          POST /api/trigger/:key
    api/runs/[key].js             GET  /api/runs/:key
```

## 部署/更新流程

```bash
cd build-page/cloud
export CLOUDFLARE_API_TOKEN=<token>
export CLOUDFLARE_ACCOUNT_ID=<account>
npx wrangler@3.90.0 pages deploy . --project-name=tv-build-console --branch=main
```

Secret 更新（不落盘）：
```bash
gh auth token | npx wrangler@3.90.0 pages secret put GITHUB_TOKEN
printf '%s' '<访问密钥>' | npx wrangler@3.90.0 pages secret put ACCESS_KEY
```

## 已验证

- 首页 HTTP 200；无密钥访问 `/api/config` 返回 401；带密钥正常返回 3 站点配置。
- 通过云端 API 触发 `plantextract-demo` 构建 → 运行 #3 `success` → 站点部署成功。
- 三个目标站点均可公开访问（见上级 `local/README.md`）。

## 说明

- 本机版（`build-page/local/`）仍可用，适合内网/离线场景；云端版适合随时随地访问。
- 本机 gh token 有效期取决于 GitHub OAuth，过期后需重新执行 `pages secret put GITHUB_TOKEN`。

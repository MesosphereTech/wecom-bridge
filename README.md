# WeCom Bridge (企业微信 · 网页授权 & JS-SDK 桥接壳)

这个最小项目用于：
- 在企业微信“自建应用”内完成 **网页授权(OAuth)** 与 **JS-SDK** 注入；
- 页面中 **iframe** 承载你的 Figma 预览链接或真实 H5；
- 提供三个后端 API：获取 `access_token`、用 `code` 换 `UserId`、生成 JS-SDK 签名。

## 快速开始（Vercel）
1. 把本仓库上传到 GitHub。
2. 在 Vercel 控制台 Import 该项目。
3. 在 Vercel 的 Environment Variables 设置：
   - `WECOM_CORP_ID`       （企业 CorpID）
   - `WECOM_CORP_SECRET`   （自建应用的 Secret）
   - `WECOM_AGENT_ID`      （AgentID）
4. 从企业微信后台 → 你的自建应用 → **网页授权及 JS-SDK** 下载 `WW_verify_xxx.txt`
   - 把该文件放到本项目的 `public/` 目录（覆盖 `WW_verify_placeholder.txt`）。
   - 重新部署后，在后台校验通过。
5. 把企业微信“应用主页 URL”填为 `https://你的项目.vercel.app`
6. 打开企业微信 → 工作台 → 点击应用图标，进入页面：
   - 点击“识别企业微信身份”完成 OAuth，应显示 `UserId`；
   - 点击“调用扫码(JS-SDK)”验证 JS-SDK 注入成功；
   - iframe 默认加载的是示例 Figma 链接，替换为你的真实链接即可。

> 生产环境建议：为 `access_token`/ticket 增加更加稳健的缓存（如 Redis）、日志与错误兜底。

## 目录结构
```
wecom-bridge/
├─ public/
│  ├─ index.html                # 外壳页：OAuth + JS-SDK + iframe
│  └─ WW_verify_placeholder.txt # 占位文件；请用后台下载的真实文件替换
├─ api/
│  ├─ env.ts                    # 返回 corpId/agentId 给前端
│  ├─ gettoken.ts               # 获取 access_token（带简单缓存）
│  ├─ getuserinfo.ts            # 用 code 换 UserId
│  └─ jssdk-config.ts           # 生成 wx.config / wx.agentConfig 的签名
├─ vercel.json
├─ package.json
├─ .gitignore
└─ README.md
```

## 环境变量
- `WECOM_CORP_ID`、`WECOM_CORP_SECRET`、`WECOM_AGENT_ID` 均来自企业微信管理后台 → 自建应用详情页。

## 常见问题
- `50001/可信域名错误`：请确保在“网页授权及 JS-SDK”设置里添加并校验了 `yourproject.vercel.app` 域名。
- `agentConfig invalid signature`：签名中的 URL 必须是**当前页面的完整 URL**，且**不包含 # 及其后面**。
- 只能显示页面、拿不到 `UserId`：说明没有走 OAuth，请点击“识别企业微信身份”按钮触发跳转。

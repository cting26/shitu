# 3D Icon Prompt Builder · Vercel 免费部署

本目录 = 完整可部署项目：
- `index.html`：工具页面（纯前端即可用：生成器 + 本地启发式分析）
- `api/analyze.js`：AI 按 ①-⑩ 识别（调用智谱视觉模型）
- `api/translate.js`：识别结果中英互译
- `vercel.json`：函数超时配置

## 一、一次性准备
1. 注册 Vercel 并绑定 GitHub：https://vercel.com （Hobby 免费版即可）
2. 需要一个智谱 API Key（bigmodel.cn，`glm-4v-flash` / `glm-4.6v-flash` 免费档）
   - 本机已有：打开终端执行 `echo $OPENAI_API_KEY`（形如 `xxxxx.yyyyy`）即为你的 Key
3. 装 Vercel CLI（可选，方式二用）：`npm i -g vercel`

## 二、部署（二选一）
### 方式 A：GitHub + Vercel（推荐）
1. 把本 `deploy-vercel` 目录推到你的 GitHub 仓库（新建仓库即可）
2. Vercel → Add New Project → Import 该仓库
3. Build 不需要特殊设置（纯静态 + API），直接 Deploy
4. 得到公网地址，如 `https://xxxx.vercel.app`

### 方式 B：Vercel CLI（不上传 GitHub）
1. 终端进入本目录：`cd /Users/cttothemoon/Documents/ChatGPT/ZPJ/deploy-vercel`
2. `vercel login` → `vercel` → 按提示部署；生产用 `vercel --prod`

## 三、设置环境变量（重要）
在 Vercel 项目 Settings → Environment Variables 添加：
| 名称 | 值 |
|---|---|
| `ZHIPU_API_KEY` | 你的智谱 Key（必填） |
| `ZHIPU_BASE_URL` | `https://open.bigmodel.cn/api/paas/v4`（默认，可省） |
| `AI_MODEL` | `glm-4v-flash`（默认免费，可省） |
| `ACCESS_TOKEN` | 自定义访问口令（**强烈建议设置**，防止别人白嫖你的 Key） |

添加后 Redeploy。

## 四、页面里使用 AI
- 打开你的 `https://xxxx.vercel.app`：页面会自动用本站 `/api/*`（无需填地址）
- 若设置了 `ACCESS_TOKEN`：点页面里「⚙ AI 服务设置」→ 访问口令填同一个值 → 保存
- 之后上传/拖拽/粘贴图片即可自动 AI 精析 + 中英互译

## 五、只想先上“纯前端版”（不含 AI）
把 `index.html` 单独放到任意免费静态托管（Netlify Drop / GitHub Pages / Cloudflare Pages）即可：
生成器、10 项多选、本地启发式分析全可用；AI 按钮会提示“服务未连接”。

## 费用说明
- Vercel Hobby：免费（函数调用量个人足够）
- 智谱 `glm-4v-flash` / `glm-4.6v-flash`：免费档模型，按官方最新说明为准

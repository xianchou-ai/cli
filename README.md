# 献丑 CLI

[![npm](https://img.shields.io/npm/v/@xianchou/cli)](https://www.npmjs.com/package/@xianchou/cli)
[![GitHub](https://img.shields.io/github/license/xianchou-ai/cli)](https://github.com/xianchou-ai/cli)

- GitHub：<https://github.com/xianchou-ai/cli>
- npmjs：<https://www.npmjs.com/package/@xianchou/cli>

`xianchou` 是献丑面向公开用户和 AI Agent 的命令行工具。它通过 `/api/cli` 专用接口进行 AI 生图、AI 生视频，并可以为任意 Markdown 自动生成和插入图片。

## 安装

全局安装：

```bash
npm install -g @xianchou/cli
```

项目内安装：

```bash
pnpm add -D @xianchou/cli
pnpm xianchou --help
```

本地源码开发：

```bash
cd cli
pnpm install
pnpm build
pnpm dev -- --help
```

## 认证

在献丑 Web 登录后，点击头像菜单中的 `Access Key`，在弹窗中点击 `创建新 Access Key`，然后复制完整 Access Key。

```bash
xianchou auth login --key <ACCESS_KEY> --project-id <PROJECT_ID>
```

默认配置文件：

```text
~/.xianchou/config.json
```

也可以使用环境变量：

```bash
export XIANCHOU_ACCESS_KEY=<ACCESS_KEY>
export XIANCHOU_PROJECT_ID=<PROJECT_ID>
export XIANCHOU_API_URL=https://api.xianchou.com
export XIANCHOU_CONFIG_DIR=~/.xianchou
```

环境变量优先于配置文件。

## 查看模型

```bash
xianchou models image --project-id <PROJECT_ID>
xianchou models video --project-id <PROJECT_ID>
```

生成图片或视频前应先查看模型列表，不要硬编码模型 ID。

## 单张生图

```bash
xianchou generate image \
  --prompt "现代科技文档封面，抽象 AI 视频创作画布" \
  --project-id <PROJECT_ID> \
  --poll
```

如果不传 `--provider-id` 和 `--model-id`，CLI 会读取模型列表并使用默认模型。
如果不传 `--channel`，CLI 会从选中模型的 `channels` 中使用第一个可用值。

## AI 生视频

文生视频：

```bash
xianchou generate video \
  --prompt "电影感航拍镜头，雨后的未来城市，霓虹反光" \
  --project-id <PROJECT_ID> \
  --poll
```

首帧生视频：

```bash
xianchou generate video \
  --mode first \
  --first-frame-url "https://xianchou.com/path/to/image.png" \
  --prompt "镜头缓慢推进，角色抬头看向镜头" \
  --project-id <PROJECT_ID> \
  --poll
```

首尾帧和参考生视频：

```bash
xianchou generate video --mode first-last \
  --first-frame-url "https://xianchou.com/start.png" \
  --last-frame-url "https://xianchou.com/end.png" \
  --prompt "从清晨过渡到黄昏" \
  --project-id <PROJECT_ID> \
  --poll

xianchou generate video --mode reference \
  --reference-url "https://xianchou.com/reference.png" \
  --prompt "保留主体和风格生成一个动态镜头" \
  --project-id <PROJECT_ID> \
  --poll
```

`--mode` 可选 `text`、`first`、`first-last`、`reference`；不传时 CLI 会根据参考素材自动推断。视频生成同样会自动读取 `models video` 补齐默认模型、比例、时长和分辨率。

## 查询任务

查询一次：

```bash
xianchou generate task <TASK_ID>
```

轮询到完成：

```bash
xianchou generate task <TASK_ID> --poll
```

`--poll` 会在任务成功后自动调用 settle 接口。

## 为 Markdown 插图

生成插图并写回原文：

```bash
xianchou markdown images ./article.md --count 3
```

指定资源目录和链接前缀：

```bash
xianchou markdown images ./docs/guide.md \
  --assets-dir ./docs/assets \
  --public-url-prefix ./assets \
  --count 3
```

CLI 会插入带标记的图片块：

```markdown
<!-- xianchou:image title="章节标题" -->
![章节标题配图](./assets/guide-01.webp)
```

该标记用于重复运行时更新已有图片，避免重复插入。

## 封面图

```bash
xianchou markdown images ./article.md \
  --cover \
  --count 3
```

`--cover` 会额外生成封面图，并将 `cover` 和 `coverAlt` 写入 Markdown frontmatter。图片保存位置和链接前缀仍由 `--assets-dir` 与 `--public-url-prefix` 控制。

## 常用参数

| 参数 | 说明 |
|------|------|
| `--count` | 正文图片数量 |
| `--cover` | 生成并更新封面 |
| `--assets-dir` | 生成图片保存目录 |
| `--public-url-prefix` | 写入 Markdown 的 URL 前缀 |
| `--project-id` | 献丑项目 ID |
| `--provider-id` | 生图 provider ID |
| `--model-id` | 生图 model ID |
| `--channel` | 生图通道；不传时使用选中模型的第一个可用通道 |
| `--ratio` | 图片比例 |
| `--resolution` | 图片分辨率 |
| `--output-format` | 图片输出格式 |

## API 约定

CLI 只调用 `/api/cli/*`：

- `GET /api/cli/models/image`
- `GET /api/cli/models/video`
- `POST /api/cli/images/generate`
- `POST /api/cli/videos/generate`
- `GET /api/cli/tasks/{task_id}`
- `POST /api/cli/tasks/{task_id}/settle`
- `POST /api/cli/markdown/images/plan`

不要让脚本直接依赖 `/run`、`/canvas` 等 Web 内部接口。

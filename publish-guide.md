# @xianchou/cli 发布指南

用于后续升级并发布 `@xianchou/cli` 到 npm。

> 不要把 npm token、OTP、Access Key 写入仓库或文档。发布 token 只复制到剪贴板或临时环境变量中使用。

## 账号和权限

- npm 个人账号：`xianchou-admin`
- npm 组织：`xianchou`
- 包名：`@xianchou/cli`
- npm 页面：<https://www.npmjs.com/package/@xianchou/cli>

确认登录和组织权限：

```bash
npm whoami
npm org ls xianchou
```

期望看到当前账号是 `xianchou-admin`，并且在 `xianchou` 组织中有 owner 或 publish 权限。

## 1. 更新版本号

同时更新：

- `package.json` 里的 `version`
- `src/index.ts` 里的 `.version(...)`

例如从 `0.1.0` 升到 `0.1.1`：

```json
{
  "version": "0.1.1"
}
```

```ts
.version('0.1.1')
```

不要重复发布已发布过的版本。npm 不允许覆盖同一个版本。

## 2. 发布前校验

```bash
cd /Users/timlai99/xianchou/cli

pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build

node dist/index.js --version
npm pack --dry-run
```

检查点：

- `node dist/index.js --version` 输出应等于本次版本号
- `npm pack --dry-run` 应只包含 `dist/**`、`README.md`、`package.json`
- `package.json` 的 `bin` 应保持：

```json
{
  "bin": {
    "xianchou": "dist/index.js"
  }
}
```

## 3. 生成发布 token

如果 npm 账号启用了 2FA，建议使用 granular access token 发布。

在 npm 网站：

1. 进入 `Account -> Access Tokens`
2. 点击 `Generate New Token`
3. 选择 `Granular Access Token`
4. Token name 填：`xianchou-cli-publish`
5. 勾选 `Bypass two-factor authentication (2FA)`
6. `Allowed IP ranges` 留空
7. `Packages and scopes -> Permissions` 选择 `Read and write`
8. 范围选择 `@xianchou` 或 `@xianchou/cli`
9. 创建后复制以 `npm_` 开头的 token

token 只显示一次。不要提交到 git，不要写入文档。

## 4. 正式发布

推荐使用临时 npm 配置文件发布，避免 token 留在项目或用户配置中。

```bash
cd /Users/timlai99/xianchou/cli

TOKEN="$(pbpaste)"
TMP_NPMRC="$(mktemp)"
chmod 600 "$TMP_NPMRC"
printf 'registry=https://registry.npmjs.org/\n//registry.npmjs.org/:_authToken=%s\n' "$TOKEN" > "$TMP_NPMRC"
npm_config_userconfig="$TMP_NPMRC" npm publish --access public
rm -f "$TMP_NPMRC"
unset TOKEN TMP_NPMRC
```

发布成功会看到类似：

```text
+ @xianchou/cli@0.1.1
```

如果看到：

```text
You cannot publish over the previously published versions
```

说明这个版本号已经发布过，需要升级版本号后重新发布。

## 5. 发布后验证

```bash
npm view @xianchou/cli@latest name version dist-tags.latest bin
```

期望：

- `name = '@xianchou/cli'`
- `dist-tags.latest` 是刚发布的版本
- `bin = { xianchou: 'dist/index.js' }`

在源码目录外验证 `npx`：

```bash
TMPDIR_NPX="$(mktemp -d)"
cd "$TMPDIR_NPX"
npx -y @xianchou/cli@latest --version
npx -y @xianchou/cli@latest --help
```

验证本地安装：

```bash
TMPDIR_INSTALL="$(mktemp -d)"
cd "$TMPDIR_INSTALL"
npm init -y >/dev/null
npm install @xianchou/cli@latest
./node_modules/.bin/xianchou --version
./node_modules/.bin/xianchou --help
```

注意：不要在 `/Users/timlai99/xianchou/cli` 源码目录里用 `npx @xianchou/cli@latest` 验证。npm 可能优先识别当前本地包，导致 `xianchou: command not found`。

如果必须在源码目录验证远端包，使用：

```bash
npm exec -y --package @xianchou/cli@latest -- xianchou --version
```

## 6. 用户安装方式

推荐：

```bash
npx @xianchou/cli@latest --help
```

或全局安装：

```bash
npm install -g @xianchou/cli
xianchou --help
```

如果全局安装遇到：

```text
EACCES: permission denied, mkdir '/usr/local/lib/node_modules/@xianchou'
```

说明当前用户没有全局 npm 目录写权限。建议配置用户级全局目录：

```bash
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
npm install -g @xianchou/cli
```

不建议使用 `sudo npm install -g @xianchou/cli`，容易造成后续全局 npm 包权限混乱。

## 7. 发布后维护

发布完成后建议：

```bash
git status
git add package.json src/index.ts publish-guide.md
git commit -m "Release @xianchou/cli v0.1.1"
git tag cli-v0.1.1
git push
git push origin cli-v0.1.1
```

只在确认需要提交时执行 commit 和 tag。
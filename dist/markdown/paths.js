import path from 'node:path';
export function resolveAssetsDir(options) {
    if (options.assetsDir)
        return path.resolve(options.assetsDir);
    const parsed = path.parse(options.articlePath);
    return path.join(parsed.dir, `${parsed.name}-assets`);
}
export function resolvePublicUrlPrefix(options, assetsDir) {
    if (options.publicUrlPrefix)
        return trimTrailingSlash(options.publicUrlPrefix);
    return path.basename(assetsDir);
}
export function toMarkdownUrl(prefix, fileName) {
    return `${trimTrailingSlash(prefix)}/${fileName}`.replace(/\\/g, '/');
}
function trimTrailingSlash(value) {
    return value.replace(/\/+$/, '');
}
//# sourceMappingURL=paths.js.map
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { z } from 'zod';
const configSchema = z.object({
    accessKey: z.string().optional(),
    projectId: z.string().optional(),
    apiUrl: z.string().url().optional(),
});
export const DEFAULT_API_URL = 'https://api.xianchou.com';
export function getConfigDir() {
    return (process.env.XIANCHOU_CONFIG_DIR ||
        path.join(homedir(), '.xianchou'));
}
export function getConfigPath() {
    return path.join(getConfigDir(), 'config.json');
}
export async function readStoredConfig() {
    try {
        const raw = await readFile(getConfigPath(), 'utf8');
        return configSchema.parse(JSON.parse(raw));
    }
    catch (error) {
        const err = error;
        if (err.code === 'ENOENT')
            return {};
        throw error;
    }
}
export async function writeStoredConfig(config) {
    const dir = getConfigDir();
    await mkdir(dir, { recursive: true, mode: 0o700 });
    await writeFile(getConfigPath(), JSON.stringify(config, null, 2) + '\n', {
        mode: 0o600,
    });
}
export async function resolveConfig() {
    const stored = await readStoredConfig();
    return {
        accessKey: process.env.XIANCHOU_ACCESS_KEY || stored.accessKey || '',
        projectId: process.env.XIANCHOU_PROJECT_ID || stored.projectId || '',
        apiUrl: process.env.XIANCHOU_API_URL || stored.apiUrl || DEFAULT_API_URL,
    };
}
export async function saveAuthConfig(options) {
    const existing = await readStoredConfig();
    const next = {
        ...existing,
        accessKey: options.key,
        projectId: options.projectId || existing.projectId,
        apiUrl: options.apiUrl || existing.apiUrl || DEFAULT_API_URL,
    };
    await writeStoredConfig(next);
    return next;
}
//# sourceMappingURL=config.js.map
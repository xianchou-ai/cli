import { CliError } from '../errors.js';
export class XianchouClient {
    apiUrl;
    accessKey;
    constructor(options) {
        this.apiUrl = options.apiUrl.replace(/\/+$/, '');
        this.accessKey = options.accessKey;
    }
    async getImageModels(projectId) {
        return this.request(`/api/cli/models/image?project_id=${encodeURIComponent(projectId)}`);
    }
    async getVideoModels(projectId) {
        return this.request(`/api/cli/models/video?project_id=${encodeURIComponent(projectId)}`);
    }
    async generateImage(request) {
        return this.request('/api/cli/images/generate', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }
    async generateVideo(request) {
        return this.request('/api/cli/videos/generate', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }
    async getTask(taskId) {
        return this.request(`/api/cli/tasks/${encodeURIComponent(taskId)}`);
    }
    async settleTask(taskId) {
        return this.request(`/api/cli/tasks/${encodeURIComponent(taskId)}/settle`, { method: 'POST' });
    }
    async planMarkdownImages(request) {
        return this.request('/api/cli/markdown/images/plan', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }
    async request(pathname, init = {}) {
        if (!this.accessKey) {
            throw new CliError('Missing Access Key. Run `xianchou auth login --key <key>` or set XIANCHOU_ACCESS_KEY.');
        }
        const response = await fetch(`${this.apiUrl}${pathname}`, {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.accessKey}`,
                ...(init.headers || {}),
            },
        });
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        if (!response.ok) {
            const message = data?.message || data?.detail || `HTTP ${response.status} ${response.statusText}`;
            throw new CliError(String(message));
        }
        return data;
    }
}
export async function downloadFile(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new CliError(`Failed to download ${url}: HTTP ${response.status}`);
    }
    return new Uint8Array(await response.arrayBuffer());
}
//# sourceMappingURL=client.js.map
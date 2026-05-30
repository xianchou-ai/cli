import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { downloadFile } from '../api/client.js';
import { CliError } from '../errors.js';
import { extractHeadings, getDescription, getStringArrayField, getTitle, readMarkdownDocument, slugFromDocument, } from './parser.js';
import { resolveAssetsDir, resolvePublicUrlPrefix, toMarkdownUrl, } from './paths.js';
import { applyMarkdownImages } from './writer.js';
const SUCCESS_STATE = 'SUCCESS';
const FAILURE_STATES = new Set(['FAILURE', 'REVOKED', 'EXPIRED']);
export async function runMarkdownImages(client, options) {
    const document = await readMarkdownDocument(options.file);
    const headings = extractHeadings(document.content)
        .filter((heading) => heading.depth >= 2)
        .map((heading) => heading.text);
    const title = getTitle(document);
    const description = getDescription(document);
    const keywords = getStringArrayField(document, 'keywords');
    const audience = getStringArrayField(document, 'audience');
    const plan = await client.planMarkdownImages({
        title,
        description,
        headings,
        count: options.count,
        include_cover: options.includeCover,
        keywords,
        audience,
    });
    const catalog = await client.getImageModels(options.projectId);
    const defaults = catalog.defaults;
    const providerId = options.providerId || defaults.provider_id;
    const modelId = options.modelId || defaults.model_id;
    const selectedModel = catalog.models.find((model) => model.provider_id === providerId && model.model_id === modelId);
    const channel = options.channel || selectedModel?.channels[0];
    if (!providerId || !modelId) {
        throw new CliError('No image model is available for this project.');
    }
    const assetsDir = resolveAssetsDir({
        articlePath: options.file,
        assetsDir: options.assetsDir,
    });
    const publicUrlPrefix = resolvePublicUrlPrefix({
        articlePath: options.file,
        publicUrlPrefix: options.publicUrlPrefix,
    }, assetsDir);
    await mkdir(assetsDir, { recursive: true });
    const slug = slugFromDocument(document);
    const insertions = [];
    for (const [index, item] of plan.items.entries()) {
        const imageUrls = await generateAndPoll(client, {
            projectId: options.projectId,
            prompt: item.prompt,
            providerId,
            modelId,
            channel,
            ratio: options.ratio || defaults.ratio,
            resolution: options.resolution || defaults.resolution,
            outputFormat: options.outputFormat || defaults.output_format,
        });
        const url = imageUrls[0];
        if (!url)
            throw new CliError(`No image URL returned for ${item.title}`);
        const fileName = buildFileName(slug, item, index);
        const filePath = path.join(assetsDir, fileName);
        await writeFile(filePath, await downloadFile(url));
        const markdownUrl = toMarkdownUrl(publicUrlPrefix, fileName);
        insertions.push({
            kind: item.kind,
            title: item.title,
            anchor: item.anchor,
            prompt: item.prompt,
            alt: item.alt,
            filePath,
            markdownUrl,
            frontmatterUrl: item.kind === 'cover' ? markdownUrl : undefined,
        });
    }
    const next = applyMarkdownImages(document, insertions);
    await writeFile(options.file, next);
    return {
        file: options.file,
        assets_dir: assetsDir,
        public_url_prefix: publicUrlPrefix,
        insertions,
    };
}
async function generateAndPoll(client, options) {
    const submitted = await client.generateImage({
        project_id: options.projectId,
        prompt: options.prompt,
        provider_id: options.providerId,
        model_id: options.modelId,
        channel: options.channel,
        ratio: options.ratio,
        resolution: options.resolution,
        output_format: options.outputFormat,
        number: 1,
    });
    if (!submitted.success || !submitted.task_id) {
        throw new CliError(submitted.error_message || 'Image generation failed.');
    }
    while (true) {
        const task = await client.getTask(submitted.task_id);
        if (task.state === SUCCESS_STATE) {
            await client.settleTask(submitted.task_id);
            return task.image_urls;
        }
        if (FAILURE_STATES.has(task.state)) {
            throw new CliError(task.detail || `Task ${submitted.task_id} failed.`);
        }
        await new Promise((resolve) => setTimeout(resolve, task.poll_interval ?? 3000));
    }
}
function buildFileName(slug, item, index) {
    if (item.kind === 'cover')
        return `${slug}-cover.webp`;
    return `${slug}-${String(index + 1).padStart(2, '0')}.webp`;
}
//# sourceMappingURL=images.js.map
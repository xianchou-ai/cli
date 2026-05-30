import { Command } from 'commander';
import { resolveConfig } from '../config.js';
import { XianchouClient } from '../api/client.js';
import { CliError } from '../errors.js';
import { printJson } from '../utils/json.js';
const SUCCESS_STATE = 'SUCCESS';
const FAILURE_STATES = new Set(['FAILURE', 'REVOKED', 'EXPIRED']);
const VIDEO_MODES = new Set(['text', 'first', 'first-last', 'reference']);
async function pollTask(client, taskId) {
    while (true) {
        const task = await client.getTask(taskId);
        if (task.state === SUCCESS_STATE) {
            await client.settleTask(taskId);
            return task;
        }
        if (FAILURE_STATES.has(task.state)) {
            throw new CliError(task.detail || `Task ${taskId} failed with ${task.state}`);
        }
        const interval = task.poll_interval ?? 3000;
        await new Promise((resolve) => setTimeout(resolve, interval));
    }
}
function parseList(value) {
    if (!value)
        return [];
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}
function parseOptionalInt(value) {
    if (!value)
        return undefined;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
}
function looksLikeVideoUrl(value) {
    return /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(value);
}
export function createGenerateCommand() {
    const generate = new Command('generate').description('Generate Xianchou assets');
    generate
        .command('image')
        .description('Generate one image task through /api/cli')
        .requiredOption('--prompt <prompt>', 'Image prompt')
        .option('--project-id <projectId>', 'Project id')
        .option('--provider-id <providerId>', 'Provider id from models image')
        .option('--model-id <modelId>', 'Model id from models image')
        .option('--channel <channel>', 'Generation channel')
        .option('--ratio <ratio>', 'Aspect ratio, such as 16-9')
        .option('--resolution <resolution>', 'Resolution option')
        .option('--output-format <format>', 'Output format')
        .option('--number <number>', 'Number of images', '1')
        .option('--poll', 'Poll until the task completes')
        .action(async (options) => {
        const config = await resolveConfig();
        const projectId = options.projectId || config.projectId;
        if (!projectId) {
            throw new CliError('Missing project id. Pass --project-id or set XIANCHOU_PROJECT_ID.');
        }
        const client = new XianchouClient(config);
        let providerId = options.providerId;
        let modelId = options.modelId;
        let channel = options.channel;
        let ratio = options.ratio;
        let resolution = options.resolution;
        let outputFormat = options.outputFormat;
        if (!providerId || !modelId || !channel) {
            const catalog = await client.getImageModels(projectId);
            providerId ||= catalog.defaults.provider_id;
            modelId ||= catalog.defaults.model_id;
            channel ||= catalog.models.find((model) => model.provider_id === providerId && model.model_id === modelId)?.channels[0];
            ratio ||= catalog.defaults.ratio;
            resolution ||= catalog.defaults.resolution;
            outputFormat ||= catalog.defaults.output_format;
        }
        const submitted = await client.generateImage({
            project_id: projectId,
            prompt: options.prompt,
            provider_id: providerId,
            model_id: modelId,
            channel,
            ratio,
            resolution,
            output_format: outputFormat,
            number: Number.parseInt(options.number, 10) || 1,
        });
        if (!submitted.success || !submitted.task_id) {
            throw new CliError(submitted.error_message || 'Image generation failed.');
        }
        if (options.poll) {
            printJson(await pollTask(client, submitted.task_id));
        }
        else {
            printJson(submitted);
        }
    });
    generate
        .command('video')
        .description('Generate one video task through /api/cli')
        .option('--prompt <prompt>', 'Video prompt', '')
        .option('--project-id <projectId>', 'Project id')
        .option('--mode <mode>', 'Video mode: text, first, first-last, reference')
        .option('--provider-id <providerId>', 'Provider id from models video')
        .option('--model-id <modelId>', 'Model id from models video')
        .option('--channel <channel>', 'Generation channel')
        .option('--ratio <ratio>', 'Aspect ratio, such as 16-9')
        .option('--duration <duration>', 'Video duration, such as 5s')
        .option('--resolution <resolution>', 'Resolution option')
        .option('--audio', 'Enable model audio when supported')
        .option('--first-frame-url <url>', 'First frame image URL')
        .option('--first-image-url <url>', 'First frame image URL')
        .option('--last-frame-url <url>', 'Last frame image URL')
        .option('--last-image-url <url>', 'Last frame image URL')
        .option('--reference-url <url>', 'Reference image or video URL')
        .option('--reference-image-url <url>', 'Reference image URL')
        .option('--reference-video-url <url>', 'Reference video URL')
        .option('--image-urls <urls>', 'Comma-separated reference image URLs')
        .option('--video-urls <urls>', 'Comma-separated reference video URLs')
        .option('--audio-urls <urls>', 'Comma-separated reference audio URLs')
        .option('--audio-url <url>', 'Single reference audio URL')
        .option('--motion <motion>', 'Motion option')
        .option('--quality <quality>', 'Quality option')
        .option('--mj-advanced', 'Enable Midjourney advanced video options')
        .option('--stylize <value>', 'Midjourney stylize value')
        .option('--chaos <value>', 'Midjourney chaos value')
        .option('--weird <value>', 'Midjourney weird value')
        .option('--poll', 'Poll until the task completes')
        .action(async (options) => {
        const config = await resolveConfig();
        const projectId = options.projectId || config.projectId;
        if (!projectId) {
            throw new CliError('Missing project id. Pass --project-id or set XIANCHOU_PROJECT_ID.');
        }
        const firstImageUrl = options.firstFrameUrl || options.firstImageUrl;
        const lastImageUrl = options.lastFrameUrl || options.lastImageUrl;
        const imageUrls = parseList(options.imageUrls);
        const videoUrls = parseList(options.videoUrls);
        if (options.referenceImageUrl)
            imageUrls.push(options.referenceImageUrl);
        if (options.referenceVideoUrl)
            videoUrls.push(options.referenceVideoUrl);
        if (options.referenceUrl) {
            if (looksLikeVideoUrl(options.referenceUrl)) {
                videoUrls.push(options.referenceUrl);
            }
            else {
                imageUrls.push(options.referenceUrl);
            }
        }
        let mode = options.mode;
        if (!mode) {
            if (lastImageUrl)
                mode = 'first-last';
            else if (firstImageUrl)
                mode = 'first';
            else if (imageUrls.length || videoUrls.length)
                mode = 'reference';
            else
                mode = 'text';
        }
        if (!VIDEO_MODES.has(mode)) {
            throw new CliError(`Unsupported video mode "${mode}". Use one of: ${[...VIDEO_MODES].join(', ')}.`);
        }
        if (mode === 'text' && !options.prompt.trim()) {
            throw new CliError('Missing prompt for text video mode.');
        }
        if (mode === 'first' && !firstImageUrl) {
            throw new CliError('Missing --first-frame-url for first video mode.');
        }
        if (mode === 'first-last' && (!firstImageUrl || !lastImageUrl)) {
            throw new CliError('Missing --first-frame-url and --last-frame-url for first-last video mode.');
        }
        if (mode === 'reference' && !imageUrls.length && !videoUrls.length) {
            throw new CliError('Missing reference media. Pass --reference-url, --image-urls, or --video-urls.');
        }
        const client = new XianchouClient(config);
        let providerId = options.providerId;
        let modelId = options.modelId;
        let channel = options.channel;
        let ratio = options.ratio;
        let duration = options.duration;
        let resolution = options.resolution;
        if (!providerId || !modelId || !channel || !ratio || !duration || !resolution) {
            const catalog = await client.getVideoModels(projectId);
            const selected = catalog.models.find((model) => model.mode === mode &&
                (!providerId || model.provider_id === providerId) &&
                (!modelId || model.model_id === modelId)) || catalog.models.find((model) => model.mode === mode);
            providerId ||= selected?.provider_id || catalog.defaults.provider_id;
            modelId ||= selected?.model_id || catalog.defaults.model_id;
            channel ||= selected?.channels[0];
            ratio ||= selected?.default_ratio || catalog.defaults.ratio;
            duration ||= selected?.default_duration || catalog.defaults.duration;
            resolution ||= selected?.default_resolution || catalog.defaults.resolution;
        }
        if (!providerId || !modelId) {
            throw new CliError(`No video model available for mode "${mode}".`);
        }
        const submitted = await client.generateVideo({
            project_id: projectId,
            prompt: options.prompt,
            mode,
            provider_id: providerId,
            model_id: modelId,
            channel,
            ratio,
            duration,
            resolution,
            audio: Boolean(options.audio),
            first_image_url: firstImageUrl,
            last_image_url: lastImageUrl,
            image_urls: imageUrls,
            video_urls: videoUrls,
            audio_urls: parseList(options.audioUrls),
            audio_url: options.audioUrl,
            motion: options.motion,
            quality: options.quality,
            mj_advanced: options.mjAdvanced,
            stylize: parseOptionalInt(options.stylize),
            chaos: parseOptionalInt(options.chaos),
            weird: parseOptionalInt(options.weird),
        });
        if (!submitted.success || !submitted.task_id) {
            throw new CliError(submitted.error_message || 'Video generation failed.');
        }
        if (options.poll) {
            printJson(await pollTask(client, submitted.task_id));
        }
        else {
            printJson(submitted);
        }
    });
    generate
        .command('task')
        .description('Get or poll one generation task')
        .argument('<taskId>', 'Task id')
        .option('--poll', 'Poll until the task completes')
        .action(async (taskId, options) => {
        const config = await resolveConfig();
        const client = new XianchouClient(config);
        if (options.poll) {
            printJson(await pollTask(client, taskId));
        }
        else {
            printJson(await client.getTask(taskId));
        }
    });
    return generate;
}
//# sourceMappingURL=generate.js.map
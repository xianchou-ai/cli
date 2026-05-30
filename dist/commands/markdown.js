import { Command } from 'commander';
import { resolveConfig } from '../config.js';
import { XianchouClient } from '../api/client.js';
import { CliError } from '../errors.js';
import { printJson } from '../utils/json.js';
import { runMarkdownImages } from '../markdown/images.js';
export function createMarkdownCommand() {
    const markdown = new Command('markdown').description('Generate and insert images for Markdown/MDX files');
    markdown
        .command('images')
        .description('Generate images and insert them into a Markdown/MDX file')
        .argument('<file>', 'Markdown or MDX file path')
        .option('--count <count>', 'Number of section images', '3')
        .option('--cover', 'Generate and write a cover image')
        .option('--assets-dir <dir>', 'Directory for generated image files')
        .option('--public-url-prefix <prefix>', 'URL prefix used in Markdown links')
        .option('--project-id <projectId>', 'Project id')
        .option('--provider-id <providerId>', 'Provider id')
        .option('--model-id <modelId>', 'Model id')
        .option('--channel <channel>', 'Generation channel')
        .option('--ratio <ratio>', 'Image aspect ratio')
        .option('--resolution <resolution>', 'Image resolution')
        .option('--output-format <format>', 'Image output format')
        .action(async (file, options) => {
        const config = await resolveConfig();
        const projectId = options.projectId || config.projectId;
        if (!projectId) {
            throw new CliError('Missing project id. Pass --project-id or set XIANCHOU_PROJECT_ID.');
        }
        const client = new XianchouClient(config);
        const result = await runMarkdownImages(client, {
            file,
            count: Number.parseInt(options.count, 10) || 0,
            includeCover: Boolean(options.cover),
            assetsDir: options.assetsDir,
            publicUrlPrefix: options.publicUrlPrefix,
            projectId,
            providerId: options.providerId,
            modelId: options.modelId,
            channel: options.channel,
            ratio: options.ratio,
            resolution: options.resolution,
            outputFormat: options.outputFormat,
        });
        printJson(result);
    });
    return markdown;
}
//# sourceMappingURL=markdown.js.map
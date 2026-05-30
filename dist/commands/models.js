import { Command } from 'commander';
import { resolveConfig } from '../config.js';
import { XianchouClient } from '../api/client.js';
import { CliError } from '../errors.js';
import { printJson } from '../utils/json.js';
export function createModelsCommand() {
    const models = new Command('models').description('List Xianchou model catalogs');
    models
        .command('image')
        .description('List image generation models')
        .option('--project-id <projectId>', 'Project id for permissions and quotas')
        .action(async (options) => {
        const config = await resolveConfig();
        const projectId = options.projectId || config.projectId;
        if (!projectId) {
            throw new CliError('Missing project id. Pass --project-id or set XIANCHOU_PROJECT_ID.');
        }
        const client = new XianchouClient(config);
        const result = await client.getImageModels(projectId);
        printJson(result);
    });
    models
        .command('video')
        .description('List video generation models')
        .option('--project-id <projectId>', 'Project id for permissions and quotas')
        .action(async (options) => {
        const config = await resolveConfig();
        const projectId = options.projectId || config.projectId;
        if (!projectId) {
            throw new CliError('Missing project id. Pass --project-id or set XIANCHOU_PROJECT_ID.');
        }
        const client = new XianchouClient(config);
        const result = await client.getVideoModels(projectId);
        printJson(result);
    });
    return models;
}
//# sourceMappingURL=models.js.map
import { Command } from 'commander';
import { getConfigPath, saveAuthConfig } from '../config.js';
import { CliError } from '../errors.js';
import { printJson, printText } from '../utils/json.js';
export function createAuthCommand() {
    const auth = new Command('auth').description('Manage Xianchou CLI credentials');
    auth
        .command('login')
        .description('Persist an Access Key for later CLI calls')
        .requiredOption('--key <key>', 'Xianchou Access Key')
        .option('--project-id <projectId>', 'Default project id')
        .option('--api-url <url>', 'API base URL')
        .option('-o, --output <format>', 'Output format: text or json', 'text')
        .action(async (options) => {
        const key = String(options.key || '').trim();
        if (!key)
            throw new CliError('Access Key cannot be empty.');
        const saved = await saveAuthConfig({
            key,
            projectId: options.projectId,
            apiUrl: options.apiUrl,
        });
        if (options.output === 'json') {
            printJson({ success: true, config_path: getConfigPath(), ...saved });
        }
        else {
            printText(`Saved credentials to ${getConfigPath()}`);
        }
    });
    return auth;
}
//# sourceMappingURL=auth.js.map
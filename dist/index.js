#!/usr/bin/env node
import { Command } from 'commander';
import { createAuthCommand } from './commands/auth.js';
import { createGenerateCommand } from './commands/generate.js';
import { createMarkdownCommand } from './commands/markdown.js';
import { createModelsCommand } from './commands/models.js';
import { CliError, getErrorMessage } from './errors.js';
const program = new Command();
program
    .name('xianchou')
    .description('Xianchou CLI for AI image/video generation and Markdown image insertion')
    .version('0.1.2');
program.addCommand(createAuthCommand());
program.addCommand(createModelsCommand());
program.addCommand(createGenerateCommand());
program.addCommand(createMarkdownCommand());
try {
    await program.parseAsync(process.argv);
}
catch (error) {
    const exitCode = error instanceof CliError ? error.exitCode : 1;
    process.stderr.write(`Error: ${getErrorMessage(error)}\n`);
    process.exit(exitCode);
}
//# sourceMappingURL=index.js.map
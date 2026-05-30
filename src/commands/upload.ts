import { Command } from 'commander'
import { resolveConfig } from '../config.js'
import { XianchouClient } from '../api/client.js'
import { CliError } from '../errors.js'
import { printJson } from '../utils/json.js'
import { access } from 'node:fs/promises'

export function createUploadCommand(): Command {
  const upload = new Command('upload')
    .description('Upload a local file and get a public URL')
    .argument('<file>', 'Local file path to upload')
    .action(async (file: string) => {
      try {
        await access(file)
      } catch {
        throw new CliError(`File not found: ${file}`)
      }

      const config = await resolveConfig()
      const client = new XianchouClient(config)
      const result = await client.uploadFile(file)

      if (!result.success) {
        throw new CliError(result.error_message || 'Upload failed.')
      }

      printJson(result)
    })

  return upload
}

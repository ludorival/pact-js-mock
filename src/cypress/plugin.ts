import { readPact } from '../utils'
const checkRead: Record<string, boolean> = {}
export default (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
) => {
  on('task', {
    readPact(fileName: string) {
      if (!checkRead[fileName]) {
        checkRead[fileName] = true
        return null
      }
      return readPact(fileName)
    },
  })

  return config // Return the updated config
}

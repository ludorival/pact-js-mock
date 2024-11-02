import { readPact } from '../utils'
let firstRead = true
export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  on('task', {
    readPact(fileName: string) {
      if (firstRead) {
        firstRead = false
        return null
      }
      return readPact(fileName)
    },
  })

  on('before:run', () => {
    firstRead = true
  })

  return config // Return the updated config
}

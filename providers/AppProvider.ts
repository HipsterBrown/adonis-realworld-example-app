import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import sanitizeHTML from 'sanitize-html'
import { marked } from 'marked'
import { DateTime } from 'luxon'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings
  }

  public async boot() {
    const View = this.app.container.use('Adonis/Core/View')
    View.global('markdownToHTML', (content: string) => {
      return sanitizeHTML(marked(content))
    })
    View.global('formatDate', (date: DateTime) => {
      return date.toLocaleString({ month: 'long', day: 'numeric', year: 'numeric' })
    })
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}

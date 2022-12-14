/**
 * File source: https://bit.ly/3ukaHTz
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import type { Config, PluginFn } from '@japa/runner'
import TestUtils from '@ioc:Adonis/Core/TestUtils'
import { assert, runFailedTests, specReporter, apiClient } from '@japa/preset-adonis'
import playwright from 'playwright'
import type { Browser, Page } from 'playwright'
import { getDocument, getQueriesForElement, queries } from 'playwright-testing-library'

declare module '@japa/runner' {
  // Interface must match the class name
  interface TestContext {
    page: Page
    login(email: string, password: string): Promise<void>
    getScreen(): Promise<ReturnType<typeof getQueriesForElement>>
  }
}

type BrowserName = 'firefox' | 'webkit' | 'chromium'
type PlaywrightClientArgs = {
  /** defaults to firefox */
  browser?: BrowserName
  suiteName?: string
}

function playwrightClient({
  browser: browserName = 'firefox',
  suiteName = 'e2e',
}: PlaywrightClientArgs = {}) {
  return async function (_config, runner) {
    runner.onSuite((suite) => {
      if (suite.name === suiteName) {
        let browser: Browser
        suite.setup(async () => {
          browser = await playwright[browserName].launch({ headless: process.env.HEADLESS !== '0' })
          return () => browser.close()
        })
        suite.onGroup((group) => {
          group.each.setup(async (test) => {
            test.context.page = await browser.newPage({
              baseURL: `http://${process.env.HOST}:${process.env.PORT}`,
            })
            test.context.login = async (email, password) => {
              await test.context.page.goto(test.context.route('login'))
              const loginDoc = await getDocument(test.context.page)
              const emailInput = await queries.getByLabelText(loginDoc, 'email')
              const passwordInput = await queries.getByLabelText(loginDoc, 'password')

              await emailInput.fill(email)
              await passwordInput.fill(password)

              await (await queries.findByRole(loginDoc, 'button', { name: 'Sign in' })).click()
            }
            test.context.getScreen = async () => {
              return getQueriesForElement(await getDocument(test.context.page))
            }

            return async () => {
              await test.context.page.close()
            }
          })
        })
      }
    })
  } as PluginFn
}

/*
|--------------------------------------------------------------------------
| Japa Plugins
|--------------------------------------------------------------------------
|
| Japa plugins allows you to add additional features to Japa. By default
| we register the assertion plugin.
|
| Feel free to remove existing plugins or add more.
|
*/
export const plugins: Config['plugins'] = [
  assert(),
  runFailedTests(),
  apiClient(),
  playwrightClient(),
]

/*
|--------------------------------------------------------------------------
| Japa Reporters
|--------------------------------------------------------------------------
|
| Japa reporters displays/saves the progress of tests as they are executed.
| By default, we register the spec reporter to show a detailed report
| of tests on the terminal.
|
*/
export const reporters: Config['reporters'] = [specReporter()]

/*
|--------------------------------------------------------------------------
| Runner hooks
|--------------------------------------------------------------------------
|
| Runner hooks are executed after booting the AdonisJS app and
| before the test files are imported.
|
| You can perform actions like starting the HTTP server or running migrations
| within the runner hooks
|
*/
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [() => TestUtils.ace().loadCommands(), () => TestUtils.db().migrate()],
  teardown: [],
}

/*
|--------------------------------------------------------------------------
| Configure individual suites
|--------------------------------------------------------------------------
|
| The configureSuite method gets called for every test suite registered
| within ".adonisrc.json" file.
|
| You can use this method to configure suites. For example: Only start
| the HTTP server when it is a functional suite.
*/
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (suite.name === 'functional') {
    suite.setup(() => TestUtils.httpServer().start())
  }
  if (suite.name === 'e2e') {
    suite.setup(() => TestUtils.httpServer().start())
  }
}

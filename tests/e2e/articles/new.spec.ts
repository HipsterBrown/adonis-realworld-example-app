import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { ProfileFactory } from 'Database/factories/ProfileFactory'

test.group('articles/new', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()

    return async () => {
      await Database.rollbackGlobalTransaction()
    }
  })

  test('creates new articles for logged in user', async ({ browserContext, visit }) => {
    const profile = await ProfileFactory.with('user', 1, (user) =>
      user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
    ).create()

    await browserContext.login('test.person@example.com', 'SuperSecret123')

    const screen = await visit('/')

    await screen.getByRole('link', { name: 'New Article' }).click()

    const title = screen.getByLabel('article title')
    const description = screen.getByLabel("What's this article about?")
    const content = screen.getByLabel('article content')
    const tags = screen.getByLabel('enter tags (comma separated)')
    const publishButton = screen.getByRole('button', { name: 'Publish Article' })

    await title.fill('My new article')
    await description.fill('This is a brand new article')
    await content.fill(
      `## New Article\n\nRendering markdown is no problem [here](http://example.com)`
    )
    await tags.fill('new, test, article')
    await publishButton.click()

    await screen.assertExists(screen.getByRole('heading', { level: 1, name: 'My new article' }))
    await screen.assertExists(screen.getByRole('heading', { level: 2, name: 'New Article' }))
    await screen.assertExists(screen.getByRole('link', { name: 'here' }))
    await screen.assertElementsCount(screen.getByRole('link', { name: profile.name }), 3)
  })
})

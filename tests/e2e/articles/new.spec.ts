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

  test('creates new articles for logged in user', async ({ assert, page, login, getScreen }) => {
    const profile = await ProfileFactory.with('user', 1, (user) =>
      user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
    ).create()

    await login('test.person@example.com', 'SuperSecret123')

    await page.goto('/')
    let screen = await getScreen()

    await screen.findByRole('link', { name: 'New Article' }).then((el) => el.click())

    screen = await getScreen()

    const title = await screen.findByLabelText('article title')
    const description = await screen.findByLabelText("What's this article about?")
    const content = await screen.findByLabelText('article content')
    const tags = await screen.findByLabelText('enter tags (comma separated)')
    const publishButton = await screen.findByRole('button', { name: 'Publish Article' })

    await title.fill('My new article')
    await description.fill('This is a brand new article')
    await content.fill(
      `## New Article\n\nRendering markdown is no problem [here](http://example.com)`
    )
    await tags.fill('new, test, article')
    await publishButton.click()

    screen = await getScreen()
    assert.exists(await screen.findByRole('heading', { level: 1, name: 'My new article' }))
    assert.exists(await screen.findByRole('heading', { level: 2, name: 'New Article' }))
    assert.exists(await screen.findByRole('link', { name: 'here' }))
    assert.lengthOf(await screen.findAllByRole('link', { name: profile.name }), 3)
  })
})

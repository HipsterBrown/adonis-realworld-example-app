import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { ArticleFactory } from 'Database/factories/ArticleFactory'
import { ProfileFactory } from 'Database/factories/ProfileFactory'

test.group('articles/edit', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()

    return async () => {
      await Database.rollbackGlobalTransaction()
    }
  })

  test('logged in user can update article fields', async ({
    assert,
    browserContext,
    route,
    visit,
  }) => {
    const profile = await ProfileFactory.with('user', 1, (user) =>
      user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
    ).create()
    const article = await ArticleFactory.merge({
      userId: profile.userId,
      title: 'Original title',
      body: 'This is the original content',
    }).create()

    let screen = await visit(route('articles.show', article))

    await screen.assertExists(screen.getByRole('heading', { level: 1, name: 'Original title' }))
    await screen.assertExists(screen.getByText('This is the original content'))
    await screen.assertNotExists(screen.getByRole('link', { name: /Edit Article/ }))

    await browserContext.login('test.person@example.com', 'SuperSecret123')

    screen = await visit(route('articles.show', article))

    const [editLink] = await screen.getByRole('link', { name: /Edit Article/ }).all()
    await editLink.click()

    const title = screen.getByLabel('article title')
    const content = screen.getByLabel('article content')

    assert.equal(await title.inputValue(), 'Original title')
    assert.equal(await content.inputValue(), 'This is the original content')

    await title.fill('New title')
    await content.fill('The article has been updated with new content')

    const updateButton = screen.getByRole('button', { name: 'Update Article' })
    await updateButton.click()

    await screen.assertExists(screen.getByRole('heading', { level: 1, name: 'New title' }))
    await screen.assertExists(screen.getByText('The article has been updated with new content'))
  })
})

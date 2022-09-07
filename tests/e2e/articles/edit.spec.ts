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
    page,
    route,
    login,
    getScreen,
  }) => {
    const profile = await ProfileFactory.with('user', 1, (user) =>
      user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
    ).create()
    const article = await ArticleFactory.merge({
      userId: profile.userId,
      title: 'Original title',
      body: 'This is the original content',
    }).create()

    await page.goto(route('articles.show', article))
    let screen = await getScreen()

    assert.exists(await screen.findByRole('heading', { level: 1, name: 'Original title' }))
    assert.exists(await screen.findByText('This is the original content'))
    assert.notExists(await screen.queryByRole('link', { name: /Edit Article/ }))

    await login('test.person@example.com', 'SuperSecret123')

    await page.goto(route('articles.show', article))
    screen = await getScreen()

    const [editLink] = await screen.findAllByRole('link', { name: /Edit Article/ })
    await editLink.click()

    screen = await getScreen()

    const title = await screen.findByLabelText('article title')
    const content = await screen.findByLabelText('article content')

    assert.equal(await title.inputValue(), 'Original title')
    assert.equal(await content.inputValue(), 'This is the original content')

    await title.fill('New title')
    await content.fill('The article has been updated with new content')

    const updateButton = await screen.findByRole('button', { name: 'Update Article' })
    await updateButton.click()

    screen = await getScreen()

    assert.exists(await screen.findByRole('heading', { level: 1, name: 'New title' }))
    assert.exists(await screen.findByText('The article has been updated with new content'))
  })
})

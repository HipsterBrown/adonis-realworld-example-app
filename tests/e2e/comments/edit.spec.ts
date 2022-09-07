import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { ArticleFactory } from 'Database/factories/ArticleFactory'
import { CommentFactory } from 'Database/factories/CommentFactory'
import { ProfileFactory } from 'Database/factories/ProfileFactory'

test.group('comments/edit', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()

    return () => Database.rollbackGlobalTransaction()
  })

  test('comment author can edit body', async ({ assert, page, login, route, getScreen }) => {
    const commenter = await ProfileFactory.with('user', 1, (user) =>
      user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
    ).create()
    const article = await ArticleFactory.with('profile', 1, (profile) =>
      profile.with('user')
    ).create()
    await CommentFactory.merge({
      authorId: commenter.id,
      articleId: article.id,
      body: 'The original comment text',
    }).create()

    await login('test.person@example.com', 'SuperSecret123')

    await page.goto(route('articles.show', article))
    let screen = await getScreen()

    const editLink = await screen.getByRole('link', { name: /Edit your comment/ })
    await editLink.click()

    screen = await getScreen()

    assert.exists(await screen.findByRole('heading', { level: 1, name: 'Update comment' }))

    const bodyInput = await screen.findByLabelText('Comment body')
    const updateButton = await screen.findByRole('button', { name: 'Update Comment' })

    assert.equal(await bodyInput.inputValue(), 'The original comment text')
    await bodyInput.fill('Brand new comment content!')
    await updateButton.click()

    screen = await getScreen()
    assert.exists(await screen.findByText('Brand new comment content!'))
  })
})

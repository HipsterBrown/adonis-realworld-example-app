import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import { ArticleFactory } from '#database/factories/ArticleFactory'
import { CommentFactory } from '#database/factories/CommentFactory'
import { ProfileFactory } from '#database/factories/ProfileFactory'

test.group('comments/edit', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()

    return () => db.rollbackGlobalTransaction()
  })

  test('comment author can edit body', async ({ assert, browserContext, route, visit }) => {
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

    await browserContext.login('test.person@example.com', 'SuperSecret123')

    const screen = await visit(route('articles.show', article))

    const editLink = screen.getByRole('link', { name: /Edit your comment/ })
    await editLink.click()

    await screen.assertExists(screen.getByRole('heading', { level: 1, name: 'Update comment' }))

    const bodyInput = screen.getByLabel('Comment body')
    const updateButton = screen.getByRole('button', { name: 'Update Comment' })

    assert.equal(await bodyInput.inputValue(), 'The original comment text')
    await bodyInput.fill('Brand new comment content!')
    await updateButton.click()

    await screen.assertExists(screen.getByText('Brand new comment content!'))
  })
})

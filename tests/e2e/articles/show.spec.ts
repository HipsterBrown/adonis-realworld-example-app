import { getDocument, getQueriesForElement } from 'playwright-testing-library'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { ArticleFactory } from 'Database/factories/ArticleFactory'
import { ProfileFactory } from 'Database/factories/ProfileFactory'

test.group('articles/show', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()

    return async () => {
      await Database.rollbackGlobalTransaction()
    }
  })

  test('displays article content', async ({ assert, page, route }) => {
    const profile = await ProfileFactory.with('user').create()
    const article = await ArticleFactory.merge({ userId: profile.userId }).create()

    await page.goto(route('articles.show', article))
    const $document = await getDocument(page)
    const { findByRole, findAllByRole, findByText } = getQueriesForElement($document)

    assert.exists(await findByRole('heading', { level: 1, name: article.title }))
    assert.lengthOf(await findAllByRole('link', { name: profile.name }), 2)
    assert.lengthOf(await findAllByRole('button', { name: /Follow / }), 2)
    assert.lengthOf(await findAllByRole('button', { name: /Favorite post/ }), 2)
    assert.exists(await findByText(/to add comments on this article/))
  })
})

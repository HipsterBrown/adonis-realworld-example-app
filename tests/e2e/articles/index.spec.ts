import { getDocument, queries } from 'playwright-testing-library'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import TagFactory from 'Database/factories/TagFactory'

test.group('articles/index', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()

    return async () => {
      await Database.rollbackGlobalTransaction()
    }
  })

  test('display home page', async ({ assert, page }) => {
    // create with TagFactory to ensure unique tag values
    await TagFactory.with('articles', 5, (article) =>
      article
        .with('profile', 1, (profile) => profile.with('user'))
        .with('comments', 3, (comment) =>
          comment.with('author', 1, (profile) => profile.with('user'))
        )
    ).createMany(5)

    await page.goto(`/`)
    const $document = await getDocument(page)

    assert.exists(await queries.findByRole($document, 'link', { name: 'Home' }))
  })
})

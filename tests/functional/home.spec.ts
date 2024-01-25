import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import TagFactory from '../../database/factories/TagFactory'

test.group('home', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('display home page', async ({ client }) => {
    // create with TagFactory to ensure unique tag values
    await TagFactory.with('articles', 5, (article) =>
      article
        .with('profile', 1, (profile) => profile.with('user'))
        .with('comments', 3, (comment) =>
          comment.with('author', 1, (profile) => profile.with('user'))
        )
    ).createMany(5)
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('<h1 class="logo-font">conduit</h1>')
  })
})

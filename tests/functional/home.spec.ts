import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'

test.group('home', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('display home page', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('<h1 class="logo-font">conduit</h1>')
  })
})

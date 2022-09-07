import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { ProfileFactory } from 'Database/factories/ProfileFactory'

test.group('sessions/new', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()

    return () => Database.rollbackGlobalTransaction()
  })

  test('user can log in', async ({ assert, page, getScreen }) => {
    const profile = await ProfileFactory.with('user', 1, (user) =>
      user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
    ).create()

    await page.goto('/')
    let screen = await getScreen()

    const loginLink = await screen.findByRole('link', { name: /Sign in/ })
    await loginLink.click()

    screen = await getScreen()

    assert.exists(await screen.findByRole('heading', { level: 1, name: 'Sign in' }))
    assert.exists(await screen.findByRole('link', { name: "Don't have an account?" }))

    const emailInput = await screen.findByLabelText('email')
    const passwordInput = await screen.findByLabelText('password')

    await emailInput.fill('test.person@example.com')
    await passwordInput.fill('SuperSecret123')

    const signInButton = await screen.findByRole('button', { name: /Sign in/ })
    await signInButton.click()

    screen = await getScreen()

    assert.exists(await screen.findByRole('link', { name: profile.name }))
  })
})

import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { ProfileFactory } from '#database/factories/ProfileFactory'

test.group('sessions/new', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()

    return () => Database.rollbackGlobalTransaction()
  })

  test('user can log in', async ({ visit }) => {
    const profile = await ProfileFactory.with('user', 1, (user) =>
      user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
    ).create()

    const screen = await visit('/')

    const loginLink = screen.getByRole('link', { name: /Sign in/ })
    await loginLink.click()

    await screen.assertExists(screen.getByRole('heading', { level: 1, name: 'Sign in' }))
    await screen.assertExists(screen.getByRole('link', { name: "Don't have an account?" }))

    const emailInput = screen.getByLabel('email')
    const passwordInput = screen.getByLabel('password')

    await emailInput.fill('test.person@example.com')
    await passwordInput.fill('SuperSecret123')

    const signInButton = screen.getByRole('button', { name: /Sign in/ })
    await signInButton.click()

    await screen.assertExists(screen.getByRole('link', { name: profile.name }))
  })
})

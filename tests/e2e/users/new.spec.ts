import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import User from '#app/Models/User'

test.group('users/new', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()

    return () => Database.rollbackGlobalTransaction()
  })

  test('user can sign up and be authenticated', async ({ assert, visit }) => {
    assert.lengthOf(await User.all(), 0)

    const screen = await visit('/')

    const signupLink = screen.getByRole('link', { name: /Sign up/ })
    await signupLink.click()

    await screen.assertExists(screen.getByRole('heading', { level: 1, name: 'Sign up' }))
    await screen.assertExists(screen.getByRole('link', { name: 'Have an account?' }))

    const nameInput = screen.getByLabel('name')
    const emailInput = screen.getByLabel('email')
    const passwordInput = screen.getByLabel('password')

    await nameInput.fill('TestPerson')
    await emailInput.fill('test.person@example.com')
    await passwordInput.fill('SuperSecret123')

    const signUpButton = screen.getByRole('button', { name: /Sign up/ })
    await signUpButton.click()

    await screen.assertExists(screen.getByRole('link', { name: 'TestPerson' }))
    assert.lengthOf(await User.all(), 1)
  })
})

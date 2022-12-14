import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { faker } from '@faker-js/faker'
import Profile from '../../app/Models/Profile'
import User from '../../app/Models/User'

export default class extends BaseSeeder {
  public static developmentOnly = true

  public async run() {
    const range = Array.from(Array(10).keys())
    const users = await User.createMany(
      range.map(() => ({
        email: faker.internet.email(),
        password: 'SuperSecret123',
      }))
    )
    await Profile.createMany(
      users.map((user) => ({
        userId: user.id,
        name: faker.internet.userName(),
        bio: faker.lorem.sentence(),
        avatar: faker.internet.avatar(),
      }))
    )
  }
}

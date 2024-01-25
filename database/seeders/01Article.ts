import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
import BaseSeeder from '@adonisjs/lucid/seeders'
import Article from '../../app/Models/Article'
import Profile from '../../app/Models/Profile'
import Tag from '../../app/Models/Tag'
import Follow from '../../app/Models/Follow'

export default class extends BaseSeeder {
  public async run() {
    const profiles = await Profile.all()
    const tags = await Tag.createMany(
      Array.from(Array(10).keys()).map(() => ({
        value: faker.random.word().toLowerCase(),
      }))
    )
    const articles = await Article.createMany(
      profiles.flatMap((profile) => {
        return Array.from(Array(faker.datatype.number({ max: 10 })).keys()).map(() => ({
          userId: profile.userId,
          body: faker.lorem.paragraphs(),
          title: faker.lorem.words(),
          description: faker.lorem.sentence(),
          createdAt: DateTime.fromJSDate(faker.date.recent(100)),
          updatedAt: DateTime.fromJSDate(faker.date.recent(100)),
        }))
      })
    )
    await Promise.all([
      Promise.all(
        articles.map(async (article) => {
          const randomTags = tags.slice(
            faker.datatype.number({ max: 8 }),
            faker.datatype.number({ min: 1, max: 9 })
          )
          await article.related('tags').sync(randomTags.map((tag) => tag.id))
        })
      ),
      Promise.all(
        articles.map(async (article) => {
          await article.related('comments').createMany(
            Array.from(Array(faker.datatype.number({ max: 5 })).keys()).map(() => ({
              authorId: profiles[faker.datatype.number({ max: profiles.length - 1 })].id,
              body: faker.lorem.sentences(),
            }))
          )
        })
      ),
      Promise.all(
        articles.map(async (article) => {
          await article.related('favorites').createMany(
            Array.from(Array(faker.datatype.number({ max: profiles.length })).keys()).map(() => ({
              profileId: profiles[faker.datatype.number({ max: profiles.length - 1 })].id,
            }))
          )
        })
      ),
      Promise.all(
        profiles.map(async (profile) => {
          const unrelatedProfiles = profiles.filter(({ id }) => id !== profile.id)
          await Follow.createMany(
            Array.from(Array(faker.datatype.number({ max: 5 })).keys()).map(() => ({
              followingId: profile.id,
              followerId:
                unrelatedProfiles[faker.datatype.number({ max: unrelatedProfiles.length - 1 })].id,
            }))
          )
        })
      ),
    ])
  }
}

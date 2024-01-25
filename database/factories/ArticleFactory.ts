import Article from '../../app/Models/Article'
import Factory from '@adonisjs/lucid/factories'
import { ProfileFactory, UserFactory } from './ProfileFactory'
import TagFactory from './TagFactory'
import { CommentFactory } from './CommentFactory'
import Favorite from '../../app/Models/Favorite'

export const FavoriteFactory = Factory.define(Favorite, () => {
  return {}
})
  .relation('profile', () => ProfileFactory)
  .relation('article', () => ArticleFactory)
  .build()

export const ArticleFactory = Factory.define(Article, ({ faker }) => {
  return {
    title: faker.lorem.words(),
    description: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(),
  }
})
  .relation('profile', () => ProfileFactory)
  .relation('user', () => UserFactory)
  .relation('tags', () => TagFactory)
  .relation('comments', () => CommentFactory)
  .relation('favorites', () => FavoriteFactory)
  .build()

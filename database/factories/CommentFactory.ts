import Comment from '../../app/Models/Comment'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { ArticleFactory } from './ArticleFactory'
import { ProfileFactory } from './ProfileFactory'

export const CommentFactory = Factory.define(Comment, ({ faker }) => {
  return {
    body: faker.lorem.paragraph(),
  }
})
  .relation('article', () => ArticleFactory)
  .relation('author', () => ProfileFactory)
  .build()

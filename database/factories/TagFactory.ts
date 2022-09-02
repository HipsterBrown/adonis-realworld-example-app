import Tag from '../../app/Models/Tag'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { ArticleFactory } from './ArticleFactory'

export default Factory.define(Tag, ({ faker }) => {
  return {
    value: faker.random.word(),
  }
})
  .relation('articles', () => ArticleFactory)
  .build()

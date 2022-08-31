import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import Tag from './Tag'
import Profile from './Profile'
import Comment from './Comment'

export default class Article extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @manyToMany(() => Tag)
  public tags: ManyToMany<typeof Tag>

  @belongsTo(() => Profile, { localKey: 'userId', foreignKey: 'userId' })
  public profile: BelongsTo<typeof Profile>

  @hasMany(() => Comment)
  public comments: HasMany<typeof Comment>

  @column()
  public body: string

  @column()
  public title: string

  @column()
  public description: string

  @column()
  @slugify({
    strategy: 'shortId',
    fields: ['title'],
  })
  public slug: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

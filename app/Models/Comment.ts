import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Article from './Article'
import Profile from './Profile'
import { BelongsTo } from "@adonisjs/lucid/types/relations";

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public articleId: number

  @column()
  public authorId: number

  @column()
  public body: string

  @belongsTo(() => Article)
  public article: BelongsTo<typeof Article>

  @belongsTo(() => Profile, { localKey: 'id', foreignKey: 'authorId' })
  public author: BelongsTo<typeof Profile>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

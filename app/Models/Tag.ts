import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Article from './Article'
import { ManyToMany } from "@adonisjs/lucid/types/relations";

export default class Tag extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public value: string

  @manyToMany(() => Article)
  public articles: ManyToMany<typeof Article>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'articles'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('slug').notNullable().defaultTo('test')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('slug')
    })
  }
}

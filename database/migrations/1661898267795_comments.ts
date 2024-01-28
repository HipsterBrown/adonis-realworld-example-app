import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comments'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('author_id')
        .unsigned()
        .references('profiles.id')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('article_id')
        .unsigned()
        .references('articles.id')
        .onDelete('CASCADE')
        .notNullable()
      table.text('body').notNullable()
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

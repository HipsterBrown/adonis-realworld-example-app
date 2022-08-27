import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ArticlesController {
  public async index({ view }: HttpContextContract) {
    return view.render('articles/index')
  }

  public async create({}: HttpContextContract) {}

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}

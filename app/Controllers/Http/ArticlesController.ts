import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Article from '../../Models/Article'
import CreateArticleValidator from '../../Validators/CreateArticleValidator'

export default class ArticlesController {
  public async index({ view }: HttpContextContract) {
    const articles = await Article.all()
    return view.render('articles/index', { articles })
  }

  public async new({ view }: HttpContextContract) {
    return view.render('articles/new')
  }

  public async create({ auth, request, response }: HttpContextContract) {
    const { tags, ...values } = await request.validate(CreateArticleValidator)
    const article = await auth.user.related('articles').create(values)
    return response.redirect().toRoute('articles.show', article)
  }

  public async show({ request, view }: HttpContextContract) {
    const article = await Article.findBy('slug', request.param('slug'))
    article?.load('user')
    return view.render('articles/show', { article })
  }

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}

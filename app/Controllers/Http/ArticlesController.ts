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
    await article?.load('user')
    return view.render('articles/show', { article })
  }

  public async edit({ auth, request, view, session, response }: HttpContextContract) {
    const article: Article | null = await auth.user
      .related('articles')
      .query()
      .where('slug', request.param('slug'))
      .first()

    if (article === null) {
      session.flashMessages.set('error', 'Unauthorized access of editor')
      return response.redirect().toRoute('articles.show', { slug: request.param('slug') })
    }

    return view.render('articles/edit', { article })
  }

  public async update({ auth, request, session, response }: HttpContextContract) {
    const article: Article | null = await auth.user
      .related('articles')
      .query()
      .where('slug', request.param('slug'))
      .first()

    if (article === null) {
      session.flashMessages.set('error', 'Unauthorized update of article')
    } else {
      const { tags, ...values } = await request.validate(CreateArticleValidator)
      await article.merge(values).save()
    }

    return response.redirect().toRoute('articles.show', { slug: request.param('slug') })
  }

  public async destroy({ auth, request, session, response }: HttpContextContract) {
    const article: Article | null = await auth.user
      .related('articles')
      .query()
      .where('slug', request.param('slug'))
      .first()

    if (article === null) {
      session.flashMessages.set('error', 'Unauthorized delete of article')
    } else {
      await article.delete()
      session.flashMessages.set('success', 'Successfully removed article')
    }

    return response.redirect().toPath('/')
  }
}

import type { HttpContext } from '@adonisjs/core/http'
import Article from '../../Models/Article.js'
import Comment from '../../Models/Comment.js'

export default class CommentsController {
  public async index({}: HttpContext) {}

  public async create({ params, request, response, auth }: HttpContext) {
    const article = await Article.findByOrFail('slug', params.slug)
    const author = await auth.user?.related('profile').query().first()
    const body = request.input('body')
    await article.related('comments').create({ body, authorId: author?.id })
    return response.redirect().back()
  }

  public async edit({ view, params }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)
    await comment.load('article')
    return view.render('comments/edit', { comment })
  }

  public async update({ params, request, response, auth }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)

    const currentProfile = await auth.user?.related('profile').query().first()
    if (comment.authorId !== currentProfile?.id) {
      return response.unauthorized()
    }

    const body = request.input('body')
    await comment.merge({ body }).save()
    return response
      .redirect()
      .toRoute('articles.show', await comment.related('article').query().firstOrFail())
  }

  public async destroy({ params, response, auth }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)

    const currentProfile = await auth.user?.related('profile').query().first()
    if (comment.authorId !== currentProfile?.id) {
      return response.unauthorized()
    }

    await comment.delete()
    return response.redirect().back()
  }
}

import type { HttpContext } from '@adonisjs/core/http'
import User from '../../Models/User.js'
import CreateUserValidator from '../../Validators/CreateUserValidator.js'

export default class UsersController {
  public async index({}: HttpContext) {}

  public async new({ view }: HttpContext) {
    return view.render('users/new')
  }

  public async create({ auth, request, response }: HttpContext) {
    const { email, password, name } = await request.validate(CreateUserValidator)

    const user = await User.create({ email, password })
    await user.related('profile').create({ name })

    await auth.login(user)

    return response.redirect().toPath('/')
  }

  public async show({}: HttpContext) {}

  public async edit({}: HttpContext) {}

  public async update({}: HttpContext) {}

  public async destroy({}: HttpContext) {}
}

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from '../../Models/User'
import CreateUserValidator from '../../Validators/CreateUserValidator'

export default class UsersController {
  public async index({}: HttpContextContract) {}

  public async new({ view }: HttpContextContract) {
    return view.render('users/new')
  }

  public async create({ auth, request, response }: HttpContextContract) {
    const { email, password, name } = await request.validate(CreateUserValidator)

    const user = await User.create({ email, password })
    await user.related('profile').create({ name })

    await auth.login(user)

    return response.redirect().toPath('/')
  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}

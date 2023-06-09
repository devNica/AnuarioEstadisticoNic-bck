import { FastifyReply, FastifyRequest } from 'fastify'
import { createdUser, findUserByEmail } from './auth.service'
import { verifyPassword } from '../shared/utils/hash'
import { generateToken } from '../shared/utils/jwt'
import { CreateUserInputModel, LoginInputModel } from '../models/auth.model'

export async function registerAuthHandler (
  request: FastifyRequest<{
    Body: CreateUserInputModel
  }>, reply: FastifyReply): Promise<void> {
  try {
    const user = await createdUser(request.body)
    return await reply.code(201).send(user)
  } catch (error) {
    console.error(error)
    return await reply.code(400).send({ message: error })
  }
}

export async function loginAuthHandler (
  requets: FastifyRequest<{
    Body: LoginInputModel
  }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { email, password } = requets.body

    const user = await findUserByEmail(email)

    if (user == null) {
      return await reply.code(401).send({
        message: 'User not found!'
      })
    }

    const verify = await verifyPassword(user.password, password)
    if (!verify) {
      return await reply.code(403).send({
        message: 'Password is wrong'
      })
    }

    const accessToken = generateToken({ id: user.id, email: user.email })
    console.log(accessToken)
    return await reply.code(200).send({
      ...user,
      accessToken
    })
  } catch (error) {
    return await reply.code(500).send(error)
  }
}

import { createUser, findUserByUsername } from '../services/user.service'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

export const register = async (c: any) => {
  try {
    const body = await c.req.json()

    const result = await createUser(c.env.movie_db, body)

    return c.json({
      success: true,
      message: 'Register success',
      result
    })
  } catch (err: any) {
    return c.json({ message: err.message }, 400)
  }
}

export const login = async (c: any) => {
  try {
    const body = await c.req.json()

    const user: any = await findUserByUsername(c.env.movie_db, body.username)

    if (!user) {
      return c.json({ message: 'User not found' }, 404)
    }

    const isMatch = await bcrypt.compare(body.password, user.password)

    if (!isMatch) {
      return c.json({ message: 'Wrong password' }, 401)
    }

    const secret = new TextEncoder().encode(c.env.JWT_SECRET) 
   
    const token = await new SignJWT({ 
      userId: user.id,
      role: user.role  
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret)

    delete user.password
    delete user.recovery_code

    return c.json({ token, user })
  } catch (err) {
    return c.json({ message: 'Login failed' }, 500)
  }
}
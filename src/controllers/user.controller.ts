import { createUser, findUserByUsername, getAllUsers,updateUser } from '../services/user.service'
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
      .setExpirationTime('30d')
      .sign(secret)

    delete user.password
    delete user.recovery_code

    return c.json({ token, user })
  } catch (err) {
    return c.json({ message: 'Login failed' }, 500)
  }
}

export const getUsers = async (c: any) => {
  const users = await getAllUsers(c.env.movie_db)
  return c.json(users)
}


export const updateProfile = async (c: any) => {
  try {
    const body = await c.req.json();
    const user = c.get('user');

    if (!body.display_name && !body.avatar) {
      return c.json({
        success: false,
        message: 'Nothing to update'
      }, 400);
    }

    const currentUser = await c.env.movie_db.prepare(`
      SELECT display_name, avatar
      FROM users
      WHERE id = ?
    `).bind(user.userId).first();

    if (
      body.display_name === currentUser?.display_name &&
      body.avatar === currentUser?.avatar
    ) {
      return c.json({
        success: false,
        message: "Không có thay đổi"
      }, 400);
    }

    await updateUser(c.env.movie_db, user.userId, body);

    const updatedUser = await c.env.movie_db.prepare(`
      SELECT id, username, display_name, avatar
      FROM users
      WHERE id = ?
    `).bind(user.userId).first();

    return c.json({
      success: true,
      message: "Update success",
      user: updatedUser
    }, 200);

  } catch (err: any) {
    return c.json({
      success: false,
      message: err.message
    }, 400);
  }
};
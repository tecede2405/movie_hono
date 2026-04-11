import { jwtVerify } from 'jose'


export const authMiddleware = async (c: any, next: any) => {
  try {
    const authHeader = c.req.header('Authorization')

    if (!authHeader) {
      return c.json({ message: 'Missing token' }, 401)
    }

    const token = authHeader.split(' ')[1]

    const secret = new TextEncoder().encode(c.env.JWT_SECRET)

    const { payload } = await jwtVerify(token, secret)

    c.set('user', {
      userId: payload.userId,   // ✅ FIX HERE
      role: payload.role
    })

    return await next()
  } catch (err) {
    console.log("JWT ERROR:", err)
    return c.json({ message: 'Unauthorized' }, 401)
  }
}
export const adminMiddleware = async (c: any, next: any) => {
  const user = c.get('user')

  if (!user || user.role !== 'admin') {
    return c.json({ message: 'Forbidden' }, 403)
  }

  await next()
}
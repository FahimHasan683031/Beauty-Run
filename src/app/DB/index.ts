import config from '../../config'
import { USER_ROLES } from '../../enum/user'
import { User } from '../modules/user/user.model'

const seedAdmin = async () => {
  const isExistAdmin = await User.findOne({ role: USER_ROLES.ADMIN })
  if (!isExistAdmin) {
    await User.create({
      fullName: 'Admin',
      email: config.super_admin.email,
      password: config.super_admin.password,
      phone: '0123456789', // Placeholder phone for admin
      role: USER_ROLES.ADMIN,
      verified: true,
    })
    console.log('Admin created successfully')
  }
}

export default seedAdmin

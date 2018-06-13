const bcrypt = require('bcrypt')

const User = require('../models/user')
const { success, fail } = require('../utils')

module.exports = (app, logger, config) => {
    app.post('/api/register', async (req, res) => {
        const { email, password } = req.body 
        try {
            const hashedPassword = await bcrypt.hash(password, config.SALT_ROUNDS)
            const user = new User({ email, password: hashedPassword, created_on: new Date() })
            await user.save()
            const userJson = {
                _id: user._id,
                email: user.email,
                created_on: user.created_on
            }
            success(res, userJson)
        } catch (err) {
            fail(res, err)
        }
    })
}
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

const { success, fail } = require('../utils')


module.exports = (app, logger) => {
    app.post('/api/register', async (req, res) => {
        const { email, password } = req.body 
        try {
            const hashedPassword = await bcrypt.hash(password, config.SALT_ROUNDS)
            const user = new User({ email, password: hashedPassword })
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

    app.post('/api/login', async (req, res) => {
        const { email, password } = req.body
        try {
            const user = await User.findOne({ email })
            const match = await bcrypt.compare(password, user.password)
            if (match) {
                const signedJwt = jwt.sign({ _id: user._id, email: email }, config.JWT_SECRET, { expiresIn: '1d' })
                const authJson = {
                    _id: user._id,
                    email: email, 
                    token: signedJwt
                }
                success(res, authJson)
            } else {
                throw new Error(`Error authenticating ${email}`)
            }
        } catch (err) {
            fail(res, err)
        }
    })
}
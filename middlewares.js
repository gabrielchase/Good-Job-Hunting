const jwt = require('jsonwebtoken')

const { fail } = require('./utils')

module.exports = function({ JWT_SECRET }) {
    checkJWT = async (req, res, next) => {
        try {
            const token  = req.headers.authorization.split(' ')[1]
            if (token) {
                const decodedUser = await jwt.verify(token, JWT_SECRET)
                req.user = decodedUser
                next()
            }
        } catch (err) {
            fail(res, err)
        }
    }
}
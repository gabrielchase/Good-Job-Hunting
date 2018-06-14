const jwt = require('jsonwebtoken')

const { fail } = require('./utils')

module.exports = function({ JWT_SECRET }) {
    checkJWT = async (req, res, next) => {
        try {
            const token  = req.headers.authorization.split(' ')[1]
            if (token) {
                req.user = await jwt.verify(token, JWT_SECRET)
                next()
            }
        } catch (err) {
            fail(res, err)
        }
    },
    checkIfSameUser = async(req, res, next) => {
        const { _id } = req.user
        const { user_id } = req.params

        if (_id !== user_id) 
            fail(res, new Error('Unauthorized'))
        else    
            next()
    }
}
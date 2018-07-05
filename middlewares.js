const jwt = require('jsonwebtoken')

const Job = require('./models/job')
const User = require('./models/user')

const { fail } = require('./utils')
const { JWT_SECRET } = require('./config/config')(require('winston'))

module.exports = {
    checkJWT: async (req, res, next) => {
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
    checkUser: async (req, res, next) => {
        const { user_id } = req.params
        
        const user = await User.findById(user_id) 
        if (user.deleted_on) fail(res, new Error('User deleted'))

        if (req.user._id !== user_id) 
            fail(res, new Error('Unauthorized'))
        else    
            next()
    },
    checkJobUser: async (req, res, next) => {
        const { job_id } = req.params

        const job = await Job.findById(job_id)
        if (job.deleted_on) fail(res, new Error('Job deleted'))

        if (req.user._id !== job.user_id) 
            fail(res, new Error('Unauthorized'))
        else 
            next()
    }
}

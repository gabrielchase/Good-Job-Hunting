const { success, fail } = require('../utils')

const User = require('../models/user')

module.exports = (app, logger, config) => {    
    app.get('/api/user/:user_id', checkJWT, checkIfSameUser, async (req, res) => {
        const { user_id } = req.params
        try {
            const user = await User.findById({ _id: user_id })
            success(res, user)
        } catch (err) {
            fail(res, err)
        }
    })
}
const { success, fail } = require('../utils')

module.exports = (app, logger, config) => {    
    app.get('/api/user/:user_id/jobs', checkJWT, async (req, res) => {
        try {
            console.log(req.params)
            console.log(req.user)
            success(res)
        } catch (err) {
            fail(res, err)
        }
    })
}
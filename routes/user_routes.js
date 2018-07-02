const User = require('../models/user')

const { success, fail } = require('../utils')
const { checkJWT, checkUser} = require('../middlewares')


module.exports = (app, logger) => {    
    app.get('/api/user/:user_id', checkJWT, checkUser, async (req, res) => {
        const { user_id } = req.params
        try {
            const user = await User.findById({ _id: user_id })
            success(res, user)
        } catch (err) {
            fail(res, err)
        }
    })

    app.put('/api/user/:user_id', checkJWT, checkUser, async (req, res) => {
        const { user_id } = req.params
        const { first_name, last_name, birthday, city, country, occupation } = req.body
        try {
            const newUserData = {
                first_name,
                last_name, 
                city,
                country,
                birthday: new Date(birthday),
                modified_on: new Date(),
                occupation
            }
            const updatedUser = await User.findByIdAndUpdate(user_id, { $set: newUserData }, { new: true, multi: true})
            success(res, updatedUser)
        } catch (err) {
            fail(res, err)
        }
    })

    app.delete('/api/user/:user_id', checkJWT, checkUser, async (req, res) => {
        const { user_id } = req.params
        try {
            await User.findByIdAndRemove(user_id)
            success(res)
        } catch (err) {
            fail(res, err)
        }
    })
}

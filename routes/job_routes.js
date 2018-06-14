const { success, fail } = require('../utils')

const Job = require('../models/job')

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

    app.post('/api/job', checkJWT, async (req, res) => {
        try {
            req.body.created_on = new Date()
            req.body.due_date = new Date(req.body.due_date)
            req.body.user_id = req.user._id 
            const job = new Job(req.body)
            job.save()
            success(res, job)
        } catch (error) {
            fail(res, err)
        }
    })
}

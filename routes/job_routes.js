const Job = require('../models/job')

const { checkJWT, checkUser, checkJobUser } = require('../middlewares')
const { success, fail, handleSalary, queryByDate } = require('../utils')


module.exports = (app, logger) => {    
    app.get('/api/user/:user_id/jobs', checkJWT, checkUser, checkJobUser, async (req, res) => {
        const { user_id } = req.params
        const { 
            city, company, country, created_on, due_date, 
            position, priority, salary, skills, status } = req.query 
        try {
            let query = { user_id }

            if (city) query.city = city
            if (company) query.company = company
            if (country) query.country = country
            if (created_on) query.created_on = queryByDate(created_on)
            if (due_date) query.due_date = queryByDate(due_date)
            if (position) query.position = position
            if (priority) query.priority = priority
            if (salary)  {
                let { currency, value } = handleSalary(salary)
                query.salary_currency = currency
                query.salary = { $gte: value }
            }
            if (skills) query.skills = { $all: JSON.parse(skills) }
            if (status) query.status = status
            
            const jobs = await Job.find(query)
            success(res, jobs)
        } catch (err) {
            fail(res, err)
        }
    })

    app.post('/api/job', checkJWT, async (req, res) => {
        try {
            if (req.body.salary) {
                let { currency, value } = handleSalary(req.body.salary)
                req.body.salary_currency = currency
                req.body.salary = value
            }
            if (req.body.due_date) req.body.due_date = new Date(req.body.due_date)
            req.body.user_id = req.user._id 
            const job = new Job(req.body)
            job.save()
            success(res, job)
        } catch (err) {
            fail(res, err)
        }
    })

    app.get('/api/job/:job_id', checkJWT, checkJobUser, async (req, res) => {
        const { job_id } = req.params 
        try {
            const job = await Job.findById(job_id)
            
            if (job.user_id !== req.user._id) throw new Error('Unauthorized')

            success(res, job)
        } catch (err) {
            fail(res, err)
        }
    })

    app.put('/api/job/:job_id', checkJWT, checkJobUser, async (req, res) => {
        const { job_id } = req.params
        try {
            let job = await Job.findById(job_id)
            
            if (job.user_id !== req.user._id) throw new Error('Unauthorized')
            
            req.body.due_date = new Date(due_date)
            if (req.body.salary) {
                let { currency, value } = handleSalary(salary)
                req.body.currency = currency
                req.body.salary = value
            }
            req.body.modified_on = new Date()
            req.body.modified_by = req.user
            
            let updatedJob = await Job.findByIdAndUpdate(job_id, { $set: req.body }, { new: true })

            success(res, updatedJob)
        } catch (err) {
            fail(res, err)
        }
    })

    app.delete('/api/job/:job_id', checkJWT, checkJobUser, async (req, res) => {
        const { job_id } = req.params
        try {
            let job = await Job.findById(job_id)
            
            if (job.user_id !== req.user._id) throw new Error('Unauthorized')

            await job.remove()

            success(res)
        } catch (err) {
            fail(res, err)
        }
    })
}

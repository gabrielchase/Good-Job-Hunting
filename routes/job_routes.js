const Job = require('../models/job')

const { checkJWT, checkIfSameUser} = require('../middlewares')
const { success, fail, handleSalary, queryByDate } = require('../utils')


module.exports = (app, logger) => {    
    app.get('/api/user/:user_id/jobs', checkJWT, checkIfSameUser, async (req, res) => {
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

    app.get('/api/job/:job_id', checkJWT, async (req, res) => {
        const { job_id } = req.params 
        try {
            const job = await Job.findById(job_id)
            
            if (job.user_id !== req.user._id) throw new Error('Unauthorized')

            success(res, job)
        } catch (err) {
            fail(res, err)
        }
    })

    app.put('/api/job/:job_id', checkJWT, async (req, res) => {
        const { job_id } = req.params
        const { city, company, country, cover_letter, due_date, 
            link, notes, position, priority, salary, 
            skills, status } = req.body
        try {
            let job = await Job.findById(job_id)
            
            if (job.user_id !== req.user._id) throw new Error('Unauthorized')
            
            if (city) job.city = city
            if (company) job.company = company
            if (country) job.country = country
            if (cover_letter) job.cover_letter = cover_letter
            if (due_date) job.due_date = new Date(due_date)
            if (link) job.link = link
            if (notes) job.notes = notes
            if (position) job.position = position
            if (priority) job.priority = priority
            if (salary) {
                let { currency, value } = handleSalary(salary)
                job.salary_currency = currency
                job.salary = value
            }
            if (skills) job.skills = skills
            if (status) job.status = status
            
            job.modified_by = req.user
            job.modified_on = new Date()
            job.save()

            success(res, job)
        } catch (err) {
            fail(res, err)
        }
    })

    app.delete('/api/job/:job_id', checkJWT, async (req, res) => {
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

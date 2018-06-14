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
            if (due_date) job.due_date = due_date
            if (link) job.link = link
            if (notes) job.notes = notes
            if (position) job.position = position
            if (priority) job.priority = priority
            if (salary) {
                let [salary_currency, salary_value] = salary.split(' ')
                salary_value = salary_value.replace(/,/g, '')
                salary_value = parseInt(salary_value)
                job.salary = salary_value
                job.salary_currency = salary_currency
            }
            if (skills) job.skills = skills
            if (status) job.status = status
            
            job.modified_on = new Date()
            job.save()

            success(res, job)
        } catch (err) {
            fail(res, err)
        }
    })
}

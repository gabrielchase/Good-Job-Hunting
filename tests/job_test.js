const request = require('supertest')
const assert = require('chai').assert

const User = require('../models/user')
const Job = require('../models/job')

const app = require('../app')

const { user_email_password_data, jobs_fixture, job_update_fixture } = require('./fixtures.json')
const { handleSalary } = require('../utils')

describe('Job tests', () => {
    let token 
    let fixtureUserId
    let otherToken

    before(async () => {
        await User.remove({})
        await Job.remove({})

        const registerUser =  await request(app)
                                        .post('/api/register')
                                        .send(user_email_password_data)
        
        fixtureUserId = registerUser.body.data._id 
        assert.exists(fixtureUserId)

        const { statusCode, body } = await request(app)
                                        .post('/api/login')
                                        .send(user_email_password_data)

        assert.equal(statusCode, 200)
        assert.equal(body.data._id, fixtureUserId)
        assert.equal(body.data.email, body.data.email)
        token = body.data.token
        assert.exists(token)

        const otherUser =  await request(app)
                                        .post('/api/register')
                                        .send({ email: 'other@email.com', password: 'otherpassword'})
        
        assert.exists(otherUser.body.data._id)

        const otherUserRes = await request(app)
                                        .post('/api/login')
                                        .send({ email: 'other@email.com', password: 'otherpassword'})

        assert.equal(statusCode, 200)
        assert.equal(otherUserRes.body.data._id, otherUser.body.data._id )
        otherToken = otherUserRes.body.data.token
        assert.exists(otherToken)
    })

    it('Should create jobs', async () => {
        let jobIds = []
        for (let companyName in jobs_fixture) {
            let jobInfo = jobs_fixture[`${companyName}`]
            const { statusCode, body } = await request(app)
                                        .post('/api/job')
                                        .set('Authorization', `Bearer ${token}`)
                                        .send(jobInfo)

            assert.equal(statusCode, 200)
            jobIds.push(body.data._id)
            assert.exists(body.data._id)
        }

        const userJobs = await Job.find({})
        assert.equal(userJobs.length, 3)

        for (let i = 0; i < userJobs.length; i++) {
            let job = userJobs[i]
            let jobInfo = jobs_fixture[`${job.company}`]
            assert.equal(userJobs[i]._id, jobIds[i])
            assert.equal(userJobs[i].company, jobInfo.company)
            assert.equal(userJobs[i].country, jobInfo.country)
            assert.equal(userJobs[i].city, jobInfo.city)
            assert.equal(userJobs[i].notes, jobInfo.notes)
            assert.equal(userJobs[i].link, jobInfo.link)
            assert.equal(userJobs[i].position, jobInfo.position)
            assert.equal(userJobs[i].priority, jobInfo.priority)
            let { currency, value } = handleSalary(jobInfo.salary)
            assert.equal(userJobs[i].salary_currency, currency)
            assert.equal(userJobs[i].salary, value)
            assert.equal(userJobs[i].due_date.toISOString(), new Date(jobInfo.due_date).toISOString())
            assert.equal(userJobs[i].user_id, fixtureUserId)
        }
    })

    it('Should get a job', async () => {
        const userJobs = await Job.find({})
        const job = userJobs[0]
        const { statusCode, body } = await request(app)
                                        .get(`/api/job/${job._id}`)
                                        .set('Authorization', `Bearer ${token}`)

        assert.equal(statusCode, 200)
        assert.equal(body.data._id, job._id)
        assert.equal(body.data.company, job.company)
        assert.equal(body.data.country, job.country)
        assert.equal(body.data.city, job.city)
        assert.equal(body.data.notes, job.notes)
        assert.equal(body.data.position, job.position)
        assert.equal(body.data.priority, job.priority)
        assert.equal(body.data.salary_currency, job.salary_currency)
        assert.equal(body.data.salary, job.salary)
        assert.equal(new Date(body.data.due_date).toISOString(), job.due_date.toISOString())
        assert.equal(body.data.user_id, fixtureUserId)
    })

    it('Should update a job', async () => {
        let userJobs = await Job.find({})
        let job = userJobs[0]
        const { statusCode, body } = await request(app)
                                            .put(`/api/job/${job._id}`)
                                            .set('Authorization', `Bearer ${token}`)
                                            .send(job_update_fixture)

        assert.equal(statusCode, 200)
        assert.equal(body.data._id, job._id)
        let updatedUserJobs = await Job.find({})
        let updatedJob = updatedUserJobs[0]
        assert.equal(updatedJob.company, job_update_fixture.company)
        assert.equal(updatedJob.country, job_update_fixture.country)
        assert.equal(updatedJob.city, job_update_fixture.city)
        assert.equal(updatedJob.notes, job_update_fixture.notes)
        assert.equal(updatedJob.position, job_update_fixture.position)
        assert.equal(updatedJob.priority, job_update_fixture.priority)
        let { currency, value } = handleSalary(job_update_fixture.salary)
        assert.equal(updatedJob.salary_currency, currency)
        assert.equal(updatedJob.salary, value)
        assert.equal(updatedJob.due_date.toISOString(), new Date(job_update_fixture.due_date).toISOString())
        assert.equal(updatedJob.user_id, fixtureUserId)
    })

    it('Should delete a job', async () => {
        const userJobs = await Job.find({})
        const job = userJobs[0]
        const { statusCode, body } = await request(app)
                                        .delete(`/api/job/${job._id}`)
                                        .set('Authorization', `Bearer ${token}`)

        assert.equal(statusCode, 200)
        assert.equal(body.success, true)
        const deletedJob = await Job.findById(job._id) 
        assert.exists(deletedJob.deleted_on)
        assert.equal(deletedJob.deleted_by, fixtureUserId)
    })
})


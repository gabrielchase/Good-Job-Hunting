const request = require('supertest')
const assert = require('chai').assert

const User = require('../models/user')
const Job = require('../models/job')

const app = require('../app')

const { user_email_password_data, jobs_fixture } = require('./fixtures.json')
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
            assert.equal(userJobs[i].position, jobInfo.position)
            assert.equal(userJobs[i].priority, jobInfo.priority)
            let { currency, value } = handleSalary(jobInfo.salary)
            assert.equal(userJobs[i].salary_currency, currency)
            assert.equal(userJobs[i].salary, value)
            assert.equal(userJobs[i].due_date.toISOString(), new Date(jobInfo.due_date).toISOString())
            assert.equal(userJobs[i].user_id, fixtureUserId)
        }
    })
})


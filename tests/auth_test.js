const assert = require('chai').assert
const jwt = require('jsonwebtoken')
const request = require('supertest')

const User  = require('../models/user')
const app = require('../app')

const { JWT_SECRET } = require('../config/config')(require('winston'))
const { user_email_password_data } = require('./fixtures.json')

describe('Authentication tests', () => {

    before(async () => {
        await User.remove({})
    })

    it('Should register a user to the db', async () => {
        const { statusCode, body } =  await request(app)
                                        .post('/api/register')
                                        .send(user_email_password_data)
        
        const userID = body.data._id
        assert.equal(statusCode, 200)
        assert.exists(userID)
        assert.equal(body.data.email, user_email_password_data.email)

        const user = await User.findOne({ email: user_email_password_data.email })
        assert.equal(user._id, userID)
        assert.notEqual(user.password, user_email_password_data.password)
        assert.exists(user.created_on)
    })

    it('Should log a user in and return a verified JWT', async () => {
        const { statusCode, body } =  await request(app)
                                        .post('/api/login')
                                        .send(user_email_password_data)
                                
        const token = body.data.token
        assert.equal(statusCode, 200)
        assert.exists(body.data._id)
        assert.exists(body.data.token)
        assert.equal(body.data.email, user_email_password_data.email)
        
        const decoded = jwt.verify(token, JWT_SECRET)
        assert.exists(decoded._id)
        assert.equal(decoded.email, user_email_password_data.email)
        assert.exists(decoded.iat)
        assert.exists(decoded.exp)
    })

    it('Should fail login from a delete user', async () => {
        
        const user = await User.findOne({ email: user_email_password_data.email })
        user.deleted_on = new Date()
        await user.save()
        
        const { statusCode, body } =  await request(app)
                                        .post('/api/login')
                                        .send(user_email_password_data)
        
        assert.equal(statusCode, 200)
        assert.equal(body.success, false)
        assert.equal(body.message, 'User deleted')
    })
})


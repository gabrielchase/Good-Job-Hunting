const assert = require('chai').assert
const jwt = require('jsonwebtoken')
const request = require('supertest')

const app = require('../app')
const { JWT_SECRET } = require('../config/config')(require('winston'))
const User  = require('../models/user')

describe('Authentication tests', () => {
    const data = {
        email: 'user1@email.com',
        password: 'password12'
    }

    before(async () => {
        await User.remove({})
    })

    it('Should register a user to the db', async () => {
        const { statusCode, body } =  await request(app)
                                        .post('/api/register')
                                        .send(data)
        
        const userID = body.data._id
        assert.equal(statusCode, 200)
        assert.exists(userID)
        assert.equal(body.data.email, data.email)

        const user = await User.findOne({ email: data.email })
        assert.equal(user._id, userID)
        assert.notEqual(user.password, data.password)
        assert.exists(user.created_on)
    })

    it('Should log a user in and return a verified JWT', async () => {
        const { statusCode, body } =  await request(app)
                                        .post('/api/login')
                                        .send(data)
                                
        const token = body.data.token
        assert.equal(statusCode, 200)
        assert.exists(body.data._id)
        assert.exists(body.data.token)
        assert.equal(body.data.email, data.email)
        
        const decoded = jwt.verify(token, JWT_SECRET)
        assert.exists(decoded._id)
        assert.equal(decoded.email, data.email)
        assert.exists(decoded.iat)
        assert.exists(decoded.exp)
    })

    it('Should fail login from a delete user', async () => {
        
        const user = await User.findOne({ email: data.email })
        user.deleted_on = new Date()
        await user.save()
        
        const { statusCode, body } =  await request(app)
                                        .post('/api/login')
                                        .send(data)
        
        console.log('body: ', body)
        assert.equal(statusCode, 200)
        assert.equal(body.success, false)
        assert.equal(body.message, 'User deleted')
    })
})


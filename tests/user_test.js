const request = require('supertest')
const assert = require('chai').assert

const User = require('../models/user')
const app = require('../app')

const { user_email_password_data, user_update_data } = require('./fixtures.json')


describe('User tests', () => {
    let token
    let fixtureUserId
    let otherToken
    user_update_data.birthday = new Date()

    before(async () => {
        await User.remove({})
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

    it('User can update their own info', async () => {
        const { statusCode, body } = await request(app)
                                        .put(`/api/user/${fixtureUserId}`)
                                        .set('Authorization', `Bearer ${token}`)
                                        .send(user_update_data)

        assert.equal(statusCode, 200)
        assert.equal(body.data._id, fixtureUserId)
        assert.equal(body.data.email, user_update_data.email)
        // Check other attributes in the test below
    })

    it('User can get their own info', async () => {
        const { statusCode, body } = await request(app)
                                            .get(`/api/user/${fixtureUserId}`)
                                            .set('Authorization', `Bearer ${token}`)
                                            .send(user_email_password_data)

        assert.equal(statusCode, 200)
        assert.equal(body.data._id, fixtureUserId)
        assert.equal(body.data.email, user_email_password_data.email)
        assert.exists(body.data.created_on)
        assert.exists(body.data.modified_on)
        assert.equal(body.data.first_name, user_update_data.first_name)
        assert.equal(body.data.last_name, user_update_data.last_name)
        assert.equal(body.data.birthday, user_update_data.birthday)
        assert.equal(body.data.city, user_update_data.city)
        assert.equal(body.data.country, user_update_data.country)
        assert.equal(body.data.occupation, user_update_data.occupation)

        const user = await User.findById(fixtureUserId)
        assert.equal(user.email, body.data.email)
        assert.exists(user.created_on)
        assert.exists(user.modified_on)
        assert.equal(user.first_name, body.data.first_name)
        assert.equal(user.last_name, body.data.last_name)
        assert.equal(user.birthday, body.data.birthday)
        assert.equal(user.city, body.data.city)
        assert.equal(user.country, body.data.country)
        assert.equal(user.occupation, body.data.occupation)
    })

    it('Other user should not be able to access user data', async () => {
        const { statusCode, body } = await request(app)
                                            .get(`/api/user/${fixtureUserId}`)
                                            .set('Authorization', `Bearer ${otherToken}`)
                                            
        assert.equal(statusCode, 200)
        assert.equal(body.success, false)
        assert.equal(body.message, 'Unauthorized')
    })

    it('Other user should not be able to update user data', async () => {
        const { statusCode, body } = await request(app)
                                            .get(`/api/user/${fixtureUserId}`)
                                            .set('Authorization', `Bearer ${otherToken}`)
                                            .send(user_update_data)
                                            
        assert.equal(statusCode, 200)
        assert.equal(body.success, false)
        assert.equal(body.message, 'Unauthorized')
    })
    
    it('Other user should not be able to delete user', async () => {
        const { statusCode, body } = await request(app)
                                            .delete(`/api/user/${fixtureUserId}`)
                                            .set('Authorization', `Bearer ${otherToken}`)
                                            
        assert.equal(statusCode, 200)
        assert.equal(body.success, false)
        assert.equal(body.message, 'Unauthorized')
    })

    it('User should be able to delete itself', async () => {
        const { statusCode, body } = await request(app)
                                            .delete(`/api/user/${fixtureUserId}`)
                                            .set('Authorization', `Bearer ${token}`)

        assert.equal(statusCode, 200)
        assert.equal(body.success, true)
        const user = await User.findById(fixtureUserId)
        assert.exists(user.deleted_on)
    })

    it('User should not be able to get itself when deleted', async () => {
        const { statusCode, body } = await request(app)
                                            .get(`/api/user/${fixtureUserId}`)
                                            .set('Authorization', `Bearer ${token}`)
                                            
        assert.equal(statusCode, 200)
        assert.equal(body.success, false)
        assert.equal(body.message, 'User deleted')
    })

    it('User should not be able to update itself when deleted', async () => {
        const { statusCode, body } = await request(app)
                                            .put(`/api/user/${fixtureUserId}`)
                                            .set('Authorization', `Bearer ${token}`)
                                            .send(user_update_data)
                                            
        assert.equal(statusCode, 200)
        assert.equal(body.success, false)
        assert.equal(body.message, 'User deleted')
    })
})
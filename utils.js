const logger = require('winston')

module.exports = {
    success: (res, data={}) => {
        const obj = {
            success: true,
            data: data
        }
        res.json(obj)
    },
    fail: (res, err) => {
        logger.error(err)
        const obj = {
            success: false,
            message: err.message
        }
        res.json(obj)
    }
}
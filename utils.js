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
    },
    handleSalary: (salary) => {
        // Input: 'SGD 3,600' or 'PHP 35,000'
        // Output: { currency: SGD, value: 3600 } or { currency: PHP, value: 35000 }
        
        let [currency, value] = salary.split(' ')
        value = value.replace(/,/g, '')
        value = parseInt(value)
        return { currency, value }
    }
}
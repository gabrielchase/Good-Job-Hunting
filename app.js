const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const chalk = require('chalk')
const winston = require('winston')
const expressLogger = require('express-winston')
const logger = new (winston.Logger)({
    level: 'debug',
    formatter: (opts) => {
        return opts.timestamp() + ' [' + opts.level + '] ' +
            (undefined !== opts.message ? opts.message : '')
    },
    transports: [
        new (winston.transports.Console)({
            json: false,
            timestamp: () => {
                return (new Date()).toISOString().replace('T',' ').replace('Z','')
            },
            formatter: (opts) => {
                return opts.timestamp() + ' [' + opts.level + '] ' +
                    (undefined !== opts.message ? opts.message : '')
            }
        }),
        new winston.transports.File({ filename: 'app-logs.log' })
    ]
})
logger.setLevels(winston.config.syslog.levels)

const app = express()

app.use(bodyParser.json({ limit: '192mb' })) 
app.use(bodyParser.urlencoded({ extended: true })) 

app.use(expressLogger.logger({
	winstonInstance: logger,
	msg: chalk.grey("{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms {{req.ip}}"),
	colorize: true,
	meta: false
}))

app.listen(3000, () => console.log(`Server running on PORT ${3000}`))

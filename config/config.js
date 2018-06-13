module.exports = (logger) => {
    let config = {}
    const nodeEnv = process.env.NODE_ENV || 'development'
    const configFile = `./${nodeEnv}.json`
    
    logger.info(`node environment: ${nodeEnv}`)
    logger.info(`config file: ${configFile}`)

    try {
        config = require(configFile)
        config.PORT = process.env.PORT || config.PORT
        config.DB_URL = process.env.DB_URL || config.DB_URL 
        config.DB_PORT = process.env.DB_PORT || config.DB_PORT
    } catch (err) {
        logger.error('Failed to load configuration file', configFile, err.message)
		config = {} // And thus config will be empty so that the app will fail hard.
    }

    return config
}

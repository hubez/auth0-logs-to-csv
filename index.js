const nconf = require('nconf');
const Auth0 = require('auth0');
const request = require('request');
const winston = require('winston');
const fs = require('fs');
const CSV = require('comma-separated-values');

const logger = new winston.Logger({
    transports : [
        new winston.transports.Console({
            timestamp       : true,
            level           : 'debug',
            handleExceptions: true,
            json            : false,
            colorize        : true
        })
    ],
    exitOnError: false
});

nconf.argv()
    .env()
    .file({file: './config.json'});

const auth0 = new Auth0({
    domain      : nconf.get('AUTH0_DOMAIN'),
    clientID    : nconf.get('AUTH0_CLIENT_ID'),
    clientSecret: nconf.get('AUTH0_CLIENT_SECRET')
});

const logs = [];

const done = function () {
    logger.info('All logs have been downloaded, total: ' + logs.length);

    var data = logs
        .filter(function (record) {
            // we're only interested in successful logins.
            // see https://auth0.com/docs/api/management/v2#!/Logs/get_logs for event acronym mappings
            return record.type === 's';
        })
        .map(function (record) {
            return {
                'date'       : record.date,
                'connection' : record.connection,
                'user_name'  : record.user_name,
                'user_id'    : record.user_id,
                'login_count': record.details.stats.loginsCount,
                'ip'         : record.ip,
                'user_agent' : record.user_agent,
                'client_name': record.client_name,
                'client_id'  : record.client_id
            }
        });

    logger.info('Exporting ' + data.length + ' successful login records');
    var output = new CSV(data, {header: true, cellDelimiter: ','}).encode();
    fs.writeFileSync('./auth0-logs.csv', output);
};

const getLogs = function (checkPoint) {
    auth0.getLogs({take: 200, from: checkPoint}, function (err, result) {

        if (err) {
            return logger.error('Error getting logs', err);
        }

        if (result && result.length > 0) {
            result.forEach(function (log) {
                logs.push(log);
            });

            logger.info('Processed ' + logs.length + ' logs.');
            setTimeout(
                function () {
                    getLogs(logs[logs.length - 1]._id);
                },
                5000 // wait 5 seconds between requests to ensure we aren't rate-limited
            );
        }
        else {
            done();
        }
    });
};

logger.info('Starting export...');

auth0.getAccessToken(function (err, newToken) {
    logger.debug('Authenticating...');

    if (err) {
        logger.error('Error authenticating', err);
        return;
    }

    logger.debug('Authentication success.');
    getLogs();
});
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
const yaml = require('js-yaml');
const urlencoder = require('urlencode');

var settings = yaml.safeLoad(fs.readFileSync('settings.yml', 'utf8'));

let salt = crypto.randomBytes(16).toString('hex');
let text = process.argv.splice(2);
let keyStr = settings.appid +
    text +
    salt +
    settings.appkey;

let key = crypto.createHash('md5').update(keyStr).digest().toString('hex').toUpperCase();

const options = {
    hostname: 'openapi.youdao.com',
    path: '/api?q=' + urlencoder(text) +
        '&from=auto&to=auto&appKey=' + settings.appid +
        '&salt=' + urlencoder(salt) +
        '&sign=' + urlencoder(key),
    method: 'GET',
    headers: {
        Content: 'text/plain'
    }
};

const req = https.request(options, (res) => {
    //console.log(`STATUS: ${res.statusCode}`);
    //console.log(`HEADERS: ${JSON.stringify(res.headers)}\n`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        let result = JSON.parse(chunk);
        if (result.errorCode != 0) {
            console.log(`Error Code: ${result.errorCode}`);
            return;
        }
        if (result.basic) {
            let ukPhonetic = result.basic['uk-phonetic'];
            let usPhonetic = result.basic['us-phonetic'];
            if (ukPhonetic) console.log(`UK: /${ukPhonetic}/`);
            if (usPhonetic) console.log(`US: /${usPhonetic}/`);
            let explains = result.basic.explains;
            if (explains) {
                let i = 1;
                explains.forEach((explain) => {
                    console.log(`[${i}] ${explain}`);
                    i += 1;
                });
            }
        }
    });
    //res.on('end', () => {
    //    console.log('No more data in response.');
    //});
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
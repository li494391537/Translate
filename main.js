const https = require('https');
const crypto = require('crypto');
const yaml = require('js-yaml');
const fs = require('fs');
const urlencoder = require('urlencode');

var settings = yaml.safeLoad(fs.readFileSync('settings.yml', 'utf8'));

let salt = crypto.randomBytes(8).toString('hex');
let text = process.argv.splice(2);
let str = settings.appid
    + text
    + salt
    + settings.appkey;

let key = crypto.createHash('md5').update(str).digest().toString('hex').toUpperCase();

const options = {
    hostname: 'openapi.youdao.com',
    path: '/api?q=' + urlencoder(text) 
    + '&from=auto&to=auto&appKey=' + settings.appid
    + '&salt=' + urlencoder(salt) 
    + '&sign=' + urlencoder(key),
    method: 'GET',
    headers: {
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}\n`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        let result = JSON.parse(chunk);
        if (!result.basic) {
            console.log(JSON.stringify(result));
            console.log('No result');
            return;
        }
        let dict = result.dict;
        let explains = result.basic.explains;
        let us = result.basic['us-phonetic'];
        let uk = result.basic['uk-phonetic'];

        console.log(`US: [${us}], UK: [${uk}]`)
        explains.forEach((item) => {
            console.log(item);
        })
    });
    res.on('end', () => {
        //console.log('No more data in response.');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
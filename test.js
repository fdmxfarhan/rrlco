const https = require('https');

const data = JSON.stringify({
    'from': '50004001448037',
    'to': '09336448037',
    'text': 'test sms'
});

const options = {
    hostname: 'console.melipayamak.com',
    port: 443,
    path: '/api/send/simple/c39c9f345eed44589146645ec66919a1',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, res => {
    console.log('statusCode: ' + res.statusCode);

    res.on('data', d => {
        process.stdout.write(d)
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();
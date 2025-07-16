var request = require('request');
// Meli payamak
// module.exports = (phone, text) => {
//     var options = {
//         method: 'POST',
//         url: 'https://rest.payamak-panel.com/api/SendSMS/SendSMS',
//         headers: {
//             'Content-Type': 'application/json',
//             'X-API-KEY': '86fc2ed7-477d-4ea0-92f1-3a263d88d148',
//             // 'X-SANDBOX': 0,
//         },
//         body: {
//             username: '09336448037',
//             password: '2240@fdmxFDMX',
//             to: phone,
//             from: '50004001448037',
//             text: text,
//             isFlash: false,
//         },
//         json: true,
//     };
//     request(options, function(error, response, body) {
//         if (error) console.log(error);
//         console.log(body);
//     });
// }



///   Faraz SMS
module.exports = (phone, text) => {
    var options = {
        method: 'POST',
        url: 'https://api2.ippanel.com/api/v1/sms/send/webservice/single',
        headers: {
            'Content-Type': 'application/json',
            'apikey': 'OWY2NWM5ZjktNDk2Mi00ZmEwLWI5OTUtMzdkOTk3NjM0ZTlkYWQ0N2M4ZjhmYzJmMzU4ZDdjZDcwMmQxNmMzZWI1MTE=',
            // 'X-SANDBOX': 0,
        },
        body: {
            "recipient": [
              phone
            ],
            "sender": "+983000505",
            "message": text
        },
        json: true,
    };
    request(options, function(error, response, body) {
        if (error) console.log(error);
        console.log(body);
    });
};


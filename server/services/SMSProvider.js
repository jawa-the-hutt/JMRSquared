const request = require('request');

export default class SMSProvider {
    constructor() {
        this.username = "37CFFF9538674149B59D70C2EA5A5EB7-01-3";
        this.password = "7C0BJbUiAJh!BW3yr3fAL6nlL0eW#";
    }

    ConvertNumbers(numbers) {
        if (numbers && numbers.indexOf('0') == 0) {
            numbers = '+27' + numbers.slice(1);
        }
        return numbers;
    }

    sendSMS(to, message) {
        return new Promise((resolve, reject) => {
            if (process.env.ENABLE_SEND_SMS) {
                request({
                        url: 'https://api.bulksms.com/v1/messages',
                        headers: {
                            "Content-Type": "application/json"
                        },
                        auth: {
                            user: this.username,
                            password: this.password
                        },
                        method: 'POST',
                        body: JSON.stringify([{
                            to: this.ConvertNumbers(to),
                            body: message
                        }])
                    },
                    function (error, response, body) {
                        if (error) {
                            return reject(error)
                        }
                        return resolve(response);
                    })
            } else {
                return resolve(true);
            }
        })
    }
}
const request = require('request');
const { config } = require('./config');

class Sender {

	send(pid, message) {
		const body = this.prepareBody(pid, message);

		return new Promise( (resolve, reject) => {
			request({
				uri: 'https://graph.facebook.com/v2.6/me/messages',
				qs: { 'access_token': config.token },
				method: 'POST',
				json: body

			}, (error, response, body) => {
				resolve({
					err: error,
					response: response,
					body: body
				});
			});
		});
	}

	prepareBody(pid, message) {
		return {
			messaging_type: "RESPONSE",
			recipient: {
				"id": pid
			},
			message:{
				text: message
			}
		}
	}
}

module.exports = { Sender };
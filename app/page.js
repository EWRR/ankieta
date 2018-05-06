const request = require('request');
const { webankietaAPIConfig } = require('./config');

class Page {

	constructor() {
		this.path = '/pages';
	}

	fetch() {

		return new Promise( resolve => {

			request({
				uri: webankietaAPIConfig.url + this.path + '/' + webankietaAPIConfig.survey_id,
				oauth: {
					consumer_key: webankietaAPIConfig.consumer_key,
					consumer_secret: webankietaAPIConfig.consumer_secret,
					token: webankietaAPIConfig.oauth_token,
					token_secret: webankietaAPIConfig.oauth_token_secret
				},
				method: 'GET',
				json: true,
				ecdhCurve: 'auto'
			}, (error, response, body) => {
				resolve(body[0].id);
			});
		});
	}

}

module.exports = { Page };
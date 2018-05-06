const request = require('request');
const { webankietaAPIConfig } = require('./config');

class Question {

	constructor(pageId) {
		this.path = '/questions';
		this.pageId = pageId;
	}

	fetch() {

		return new Promise( resolve => {

			request({
				uri: webankietaAPIConfig.url + this.path + '/' + webankietaAPIConfig.survey_id + '/' + this.pageId,
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
				resolve({
					questions: body,
					page: this.pageId
				});
			});
		});
	}

}

module.exports = { Question };
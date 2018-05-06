const { StateStorage } = require('./stateStorage');
const { config } = require('./config');
const { webankietaAPIConfig } = require('./config');
const request = require('request');

class QuestionViewer {

	constructor(userId, questions, pageId, reply) {
		this.userId = userId;
		this.questions = questions;
		this.reply = reply;
		this.pageId = pageId;

		this.storage = new StateStorage(this.userId);
	}

	handleFill() {
		if (this.reply) {
			this.fill();
		}

		if (this.storage.getLength() === this.questions.length) {
			this.finishFilling();
			return;
		}

		const isEmpty = this.storage.isEmpty();

		if (isEmpty) {
			this.startFilling()
				.then(() => {
					this.handleQuestion(this.questions[0]);
				});
		} else {
			const key = this.questions.findIndex(question => {
				return Number(question.id) === Number(this.storage.getLast().id);
			});

			this.handleQuestion(this.questions[key + 1]);
		}

	}

	startFilling() {

		return new Promise( resolve => {
			request({
				uri: webankietaAPIConfig.url + '/responses/getaccess/' + webankietaAPIConfig.survey_id,
				method: 'POST',
				oauth: {
					consumer_key: webankietaAPIConfig.consumer_key,
					consumer_secret: webankietaAPIConfig.consumer_secret,
					token: webankietaAPIConfig.oauth_token,
					token_secret: webankietaAPIConfig.oauth_token_secret
				},
				ecdhCurve: 'auto',
				form: {
					url_title: 'bot'
				},
				json: true
			}, (error, response, body) => {
				this.storage.addResponseId(body.id_response);
				this.storage.addRespondentKey(body.respondent_key);
				resolve();
			});
		});

	}

	finishFilling() {
		const questions = this.storage.getJSON().questions;

		const body = {
			id_page: this.pageId,
			respondent_key: this.storage.getRespondentKey(),
			questions: {}
		};

		questions.forEach( answer => {
			body.questions[answer.id] = {
				type: 0,
				answer: answer.index
			}
		});

		request({
			uri: webankietaAPIConfig.url + '/responses/answer/' + webankietaAPIConfig.survey_id + '/' + this.storage.getResponseId(),
			method: 'POST',
			oauth: {
				consumer_key: webankietaAPIConfig.consumer_key,
				consumer_secret: webankietaAPIConfig.consumer_secret,
				token: webankietaAPIConfig.oauth_token,
				token_secret: webankietaAPIConfig.oauth_token_secret
			},
			ecdhCurve: 'auto',
			form: body,
			json: true
		}, (error, response, body) => {

			request({
				uri: 'https://graph.facebook.com/v2.6/me/messages',
				qs: { 'access_token': config.token },
				method: 'POST',
				json: {
					messaging_type: "RESPONSE",
					recipient: {
						'id': this.userId
					},
					message: {
						text: 'Dzięki za wypełnienie! :)',
					}
				}
			}, (error, response, body) => { });
		});
	}

	fill() {
		const reply = JSON.parse(this.reply.payload);

		this.storage.addElement({
			id: reply.question_id,
			index: reply.index
		});
	}

}

module.exports = { QuestionViewer };
const { QuestionViewer } = require('./questionViewer');
const { config } = require('./config');
const request = require('request');


class SingleChoiceViewer extends QuestionViewer {

	handleQuestion(question) {
		const body = this.prepareBody(question);

		request({
			uri: 'https://graph.facebook.com/v2.6/me/messages',
			qs: { 'access_token': config.token },
			method: 'POST',
			json: body

		}, (error, response, body) => { });
	}


	prepareBody(question) {
		let replies = [];

		question.answers.forEach( (answer, index)=> {
			replies.push({
				content_type: "text",
				title: answer.text,
				payload: JSON.stringify({
					index: index + 1,
					question_id: question.id})
			});
		});

		return {
			messaging_type: "RESPONSE",
			recipient: {
				'id': this.userId
			},
			message: {
				text: question.text,
				quick_replies: replies
			}
		}
	}
}

module.exports = { SingleChoiceViewer };
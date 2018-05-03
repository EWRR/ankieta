'use strict';

// Imports dependencies and set up http server
const
	express = require('express'),
	bodyParser = require('body-parser'),
	config = require('./config').config,
	request = require('request'),
	app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 3000, () => console.log('webhook is listening'));

const send = (pid, message) => {

	return new Promise( (resolve, reject) => {
		const requestBody = {
			messaging_type: "RESPONSE",
			recipient: {
				"id": pid
			},
			message:{
				text: message,
				quick_replies: [
					{
						content_type: 'text',
						title: 'Wojtek',
						payload: 1
					}, {
						content_type: 'text',
						title: 'Emil',
						payload: 2
					}
				]
			}
		};

		request({
			uri: 'https://graph.facebook.com/v2.6/me/messages',
			qs: { 'access_token': config.token },
			method: 'POST',
			json: requestBody

		}, (error, response, body) => {
				resolve({
					err: error,
					response: response,
					body: body
				});
		});
	});

};



app.post('/webhook', (req, res) => {

	let body = req.body;

	if (body.object === 'page') {

		body.entry.forEach(function(entry) {
			if (!entry.messaging || entry.messaging.length === 0) {
				res.sendStatus(404);
				return;
			}

			let webhook_event = entry.messaging[0];

			console.log(webhook_event);

			if (webhook_event.sender && webhook_event.message) {
				send(webhook_event.sender.id, webhook_event.message.text)
					.then( (data) => {
						if (!data.error && Number(data.response.statusCode) === 200) {
							res.status(200).send('EVENT_RECEIVED');
						} else {
							res.sendStatus(404);
						}
					}, () => {});
			}

		});
	} else {
		res.sendStatus(404);
	}

});

app.get('/webhook', (req, res) => {

	// Your verify token. Should be a random string.
	let VERIFY_TOKEN = config.secret;

	// Parse the query params
	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];

	// Checks if a token and mode is in the query string of the request
	if (mode && token) {

		// Checks the mode and token sent is correct
		if (mode === 'subscribe' && token === VERIFY_TOKEN) {

			// Responds with the challenge token from the request
			console.log('WEBHOOK_VERIFIED');
			res.status(200).send(challenge);

		} else {
			// Responds with '403 Forbidden' if verify tokens do not match
			res.sendStatus(403);
		}
	}
});
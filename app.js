'use strict';

const { Sender } =  require('./app/sender');

const
	express = require('express'),
	bodyParser = require('body-parser'),
	{ config } = require('./app/config'),
	app = express().use(bodyParser.json());

app.listen(process.env.PORT || 3000, () => console.log('webhook is listening'));

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
				const sender = new Sender();

				sender.send(webhook_event.sender.id, webhook_event.message.text)
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

	let VERIFY_TOKEN = config.secret;

	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];

	if (mode && token) {

		if (mode === 'subscribe' && token === VERIFY_TOKEN) {
			console.log('WEBHOOK_VERIFIED');
			res.status(200).send(challenge);
		} else {
			res.sendStatus(403);
		}
	}
});
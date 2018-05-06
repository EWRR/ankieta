const fs = require('fs');

class StateStorage {
	constructor(userId) {
		this.path = __dirname + '/../storage/';
		this.userId = userId;

		this.fileName = this.path + this.userId + '.json';
		this.createIfNotExists();
	}

	createIfNotExists() {
		if (!fs.existsSync(this.fileName,)) {
			fs.writeFileSync(this.fileName, '{"questions": []}');
		}
	}

	addRespondentKey(respondentKey) {
		const fill = this.getJSON();

		fill.respondentKey = respondentKey;

		fs.writeFileSync(this.fileName, JSON.stringify(fill));
	}

	addResponseId(reponseId) {
		const fill = this.getJSON();

		fill.responseId = reponseId;

		fs.writeFileSync(this.fileName, JSON.stringify(fill));
	}

	getResponseId() {
		return this.getJSON().responseId;
	}

	getRespondentKey() {
		return this.getJSON().respondentKey;
	}

	addElement(question) {
		const fill = this.getJSON();

		fill.questions.push(question);

		fs.writeFileSync(this.fileName, JSON.stringify(fill));
	}

	isEmpty() {
		return this.getJSON().questions.length === 0;
	}

	getLast() {
		const fill = this.getJSON();
		return fill.questions.pop();
	}

	getLength() {
		return this.getJSON().questions.length;
	}

	getJSON() {
		return JSON.parse(fs.readFileSync(this.fileName));
	}

}

module.exports = { StateStorage };
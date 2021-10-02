const request = require('node-superfetch');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Chat with the bot!',
			category: 'Fun'
		});
	}

	async run(message, args) {
		const baseUrl = `https://api.monkedev.com/fun/chat`;

		if (!args) {
			const emptyResponses = ['Huh? At least try to say something!', 'Got nothing to say?'];
			const emptyMessageResponse = Math.floor(Math.random() * emptyResponses.length);
			return message.reply({ content: `${emptyMessageResponse}` });
		}

		try {
			const { body } = await request.get(`${baseUrl}?msg=${encodeURIComponent(args.join(' '))}&uid=${message.author.id}`);

			if (!body) {
				return message.channel.send(`I'm sorry, could you say that again?`);
			}

			return message.reply(body.response);
		} catch (err) {
			return console.log(err);
		}
	}

};

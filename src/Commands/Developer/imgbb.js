const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: "Provides all guild's the bot is currently in.",
			category: 'Developer',
			devOnly: true
		});
	}

	async run(message) {
		const image = message.attachments.first()?.url;

		if (!image) return message.channel.send('Please provide an image.');

		const url = `https://api.imgbb.com/1/upload?expiration=600&key=f1c54776936b20761886b07a5574a522&image=${image}`;

		return fetch(url)
			.then(res => res.json())
			.then(file => message.channel.send({ content: `${file.data.url}` }));
	}

};

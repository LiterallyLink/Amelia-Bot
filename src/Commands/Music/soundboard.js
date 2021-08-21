const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			category: 'Music',
			guildOnly: true
		});
	}

	async run(message, [track]) {
		const listOfAudioFiles = this.fetchAudioFiles();

		if (!track || !listOfAudioFiles.includes(track.toLowerCase())) {
			const avaliableAudioFiles = new MessageEmbed()
				.setTitle('Avaliable Audio Files')
				.setDescription(listOfAudioFiles.join('\n'))
				.setColor(this.client.embed.color.default);
			return message.channel.send({ embeds: [avaliableAudioFiles] });
		}
	}

	fetchAudioFiles() {
		const directoryPath = path.join(`${__dirname}../../../../assets`, 'audioFiles');

		return fs.readdirSync(directoryPath);
	}

};

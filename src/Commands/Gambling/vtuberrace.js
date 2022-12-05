const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const { ameRun, guraRun, inaRun, moriRun, kiaraRun } = require('../../../assets/jsons/emotes.json');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Put the members of hololive EN head to head in a footrace!',
			category: 'Gambling',
			guildOnly: true
		});
	}

	async run(message) {
		const current = this.client.games.get(message.channel.id);

		if (current) {
			const gameInProgress = new MessageEmbed()
				.setDescription(`Please wait until the current game of \`${current.name}\` is finished.`)
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(this.client.embed.color.error);
			return message.reply({ embeds: [gameInProgress] });
		}

		this.client.games.set(message.channel.id, { name: this.name });

		const raceEmotesArr = this.client.utils.shuffle([ameRun, guraRun, inaRun, moriRun, kiaraRun]);

		const raceDashes = Array(5).fill(' - - - - -');
		const initialDescription = [];

		for (let i = 0; i < raceDashes.length; i++) {
			initialDescription.push(`🏁${raceDashes[i]} ${raceEmotesArr[i]} **${i + 1}.**`);
		}

		const raceEmbed = new MessageEmbed()
			.setTitle(`Vtuber Race - Ready?`)
			.setDescription(`${initialDescription.join('\n\n')}`)
			.setColor('#B81D13');
		const vtuberRacingEmbed = await message.channel.send({ embeds: [raceEmbed] });

		await this.getReady(raceEmbed, vtuberRacingEmbed);

		const arrayisEmpty = (arr) => arr.length === 0;

		while (!raceDashes.some(arrayisEmpty)) {
			const raceWayArray = [];

			for (let i = 0; i < raceDashes.length; i++) {
				const randomNumber = this.client.utils.randomRange(0, 1);

				if (randomNumber === 1) {
					raceDashes[i] = raceDashes[i].slice(0, randomNumber * -2);
				}

				raceWayArray.push(`🏁${raceDashes[i]} ${raceEmotesArr[i]} **${i + 1}.**`);

				if (!raceWayArray[i].includes('-')) break;
			}

			await this.client.utils.sleep(1700);
			raceEmbed.setDescription(raceWayArray.join('\n\n'));
			vtuberRacingEmbed.edit({ embeds: [raceEmbed] });
		}


		const raceWinner = raceEmotesArr[raceDashes.indexOf('')];
		const winnerName = raceWinner.substring(raceWinner.indexOf(':') + 1, raceWinner.lastIndexOf('Run'));
		const emojiIDs = raceWinner.replace(/\D/g, '');

		const winnerEmbed = new MessageEmbed()
			.setTitle(`${winnerName} has won the race!`)
			.setThumbnail(`https://cdn.discordapp.com/emojis/${emojiIDs}.gif?size=64`)
			.addField('You Won', 'X Credits', true)
			.addField('New Balance', 'X Credits', true)
			.setColor(this.client.embed.color.default);
		vtuberRacingEmbed.reply({ embeds: [winnerEmbed] });
		return this.client.games.delete(message.channel.id);
	}

	async getReady(raceEmbed, vtuberRacingEmbed) {
		const raceStatus = ['Set. . .', 'Go!'];
		const statusColor = ['#EFB700', 'GREEN'];

		for (let i = 0; i < raceStatus.length; i++) {
			await this.client.utils.sleep(1700);
			raceEmbed.setTitle(`Vtuber Race - ${raceStatus[i]}`).setColor(statusColor[i]);
			vtuberRacingEmbed.edit({ embeds: [raceEmbed] });
		}
	}

};

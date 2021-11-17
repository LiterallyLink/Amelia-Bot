/* eslint-disable consistent-return */
const { MessageEmbed } = require('discord.js');

module.exports = class Music {

	constructor(client) {
		this.client = client;
	}

	isInChannel(message) {
		const { channel } = message.member.voice;

		if (!channel) {
			const voiceEmbed = new MessageEmbed()
				.setDescription('To use this command, you must be in a voice channel!')
				.setColor(this.client.embed.color.default);
			message.channel.send({ embeds: [voiceEmbed] });

			return false;
		}

		return true;
	}

	canModifyQueue(message) {
		if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) {
			const resultsEmbed = new MessageEmbed()
				.setTitle('You must be in the same voice channel as me to use this command.')
				.setColor(this.client.embed.color.error);
			message.reply({ embeds: [resultsEmbed] });

			return false;
		}

		return true;
	}

	getDuration(str) {
		const duration = {
			hours: 0,
			minutes: 0,
			seconds: 0
		};

		const occurences = str.replace(/[^:]/g, '').length;
		const hours = occurences > 1;
		let indexToGrab = 0;
		const split = str.split(':');

		if (hours) {
			duration.hours = Number.parseInt(split[0]);
			indexToGrab++;
		}

		duration.minutes = Number.parseInt(split[indexToGrab]);
		duration.seconds = Number.parseInt(split[indexToGrab + 1]);
		return duration;
	}

	getSeconds(duration) {
		return (duration.hours * 3600) + (duration.minutes * 60) + duration.seconds;
	}

	durationAsString(duration) {
		const secondDuration = this.getSeconds(duration) * 1000;

		return this.client.utils.msToTime(secondDuration);
	}

	format(str) {
		return this.durationAsString(this.getDuration(str));
	}

};

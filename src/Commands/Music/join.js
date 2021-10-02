const Command = require('../../Structures/Command');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['j'],
			description: 'Make amelia join your current voice channel',
			category: 'Music',
			guildOnly: true
		});
	}

	async run(message) {
		if (!this.client.music.isInChannel(message)) return;

		if (message.member.voice.channel.id !== message.guild.me.voice.channel?.id) {
			joinVoiceChannel({
				channelId: message.member.voice.channel.id,
				guildId: message.guild.id,
				adapterCreator: message.guild.voiceAdapterCreator
			});
		}
	}

};

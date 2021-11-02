/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { QueryType } = require('discord-player');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Searches and plays songs of your choice',
			category: 'Music',
			guildOnly: true
		});
	}

	async run(message, args) {
		if (!this.client.music.canModifyQueue(message)) return;

		const { player, embed } = this.client;

		if (!args) {
			const songNotFound = new MessageEmbed()
				.setDescription('Please provide a valid link or song name')
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(embed.color.error);
			return message.reply({ embeds: [songNotFound] });
		}

		const searchResult = await player.search(args.join(' '), {
			requestedBy: message.author,
			searchEngine: QueryType.AUTO
		}).catch(() => {
			console.log('he');
		});

		if (!searchResult || !searchResult.tracks.length) {
			const songNotFound = new MessageEmbed()
				.setDescription('Please provide a valid link or song name')
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(embed.color.error);
			return message.reply({ embeds: [songNotFound] });
		}

		const queue = await player.createQueue(message.guild, {
			fetchBeforeQueued: true,
			leaveOnEnd: false,
			leaveOnEmpty: true,
			ytdlOptions: {
				quality: 'highest',
				filter: 'audioonly',
				dlChunkSize: 0
			},
			initialVolume: 85,
			leaveOnEmptyCooldown: 200000,
			bufferingTimeout: 2000,
			metadata: { channel: message.channel }
		});

		const maxTracks = searchResult.tracks.slice(0, 10);

		const songOptions = () => {
			const optionsArray = [];

			for (let i = 0; i < maxTracks.length; i++) {
				const songObj = {
					label: `${maxTracks[i].author}`,
					value: maxTracks[i].id,
					description: maxTracks[i].title
				};

				optionsArray.push(songObj);
			}

			return optionsArray;
		};

		const songRow = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setPlaceholder("Please select what song you'd like to play")
					.setCustomId('songList')
					.addOptions(songOptions())
			);

		const searchResultEmbed = new MessageEmbed()
			.setAuthor(`Results for ${args.join(' ')}`, this.client.user.displayAvatarURL({ size: 1024, dynamic: true }))
			.setDescription(`\`\`\`Select a track to add to the queue\`\`\``)
			.setColor(this.client.embed.color.default);
		const searchResultMsg = await message.channel.send({ embeds: [searchResultEmbed], components: [songRow] });

		const optionFilter = i => {
			i.deferUpdate();
			return i.user.id === message.author.id;
		};

		const songSelector = await searchResultMsg.awaitMessageComponent({ filter: optionFilter, componentType: 'SELECT_MENU', time: 120000 }).catch(() => null);

		if (songSelector?.values) {
			try {
				if (!queue.connection) await queue.connect(message.member.voice.channel);
			} catch {
				await player.deleteQueue(message.guild.id);

				const unableToJoinVC = new MessageEmbed()
					.setDescription('I was unable to join your voice channel.')
					.setThumbnail(this.client.embed.thumbnails.ameShake)
					.setColor(embed.color.error);
				return message.reply({ embeds: [unableToJoinVC] });
			}

			const selectedSong = maxTracks.filter(song => song.id === songSelector.values[0]);

			queue.addTrack(selectedSong[0]);

			if (!queue.playing) await queue.play();
		} else {
			const searchTimeoutEmbed = new MessageEmbed()
				.setDescription('```Search timed out due to inactivity.```')
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(this.client.embed.color.default);
			return message.reply({ embeds: [searchTimeoutEmbed] });
		}
	}

};

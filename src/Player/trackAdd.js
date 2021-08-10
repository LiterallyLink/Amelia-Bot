const { MessageEmbed } = require('discord.js');

module.exports = (client, queue, track) => {
	const { title, url, thumbnail, author, duration, requestedBy } = track;

	if (queue.playing) {
		const formattedTimeTillNextSong = client.utils.formatMS(queue.totalTime - queue.streamTime);

		const queueLength = queue.tracks.length;

		const addedToQueue = new MessageEmbed()
			.setAuthor('Added to queue', requestedBy.displayAvatarURL())
			.setDescription(`[${title}](${url})`)
			.setThumbnail(thumbnail)
			.setColor(client.embed.color.default)
			.addFields(
				{ name: 'Channel', value: `${author}`, inline: true },
				{ name: 'Song Duration', value: `${client.music.format(duration)}`, inline: true },
				{ name: 'Estimated time until playing', value: `${formattedTimeTillNextSong}`, inline: true },
				{ name: 'Position in queue', value: `${queueLength}`, inline: true });

		return queue.metadata.channel.send({ embeds: [addedToQueue] });
	}

	const songEmbed = new MessageEmbed()
		.setDescription(`🎶 Playing [**${title}**](${url}) - Now!`)
		.setThumbnail(client.embed.thumbnails.ameGuitar)
		.setColor(client.embed.color.default);
	return queue.metadata.channel.send({ embeds: [songEmbed] });
};

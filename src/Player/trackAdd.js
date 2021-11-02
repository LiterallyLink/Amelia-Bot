const { MessageEmbed } = require('discord.js');

module.exports = (client, queue, track) => {
	if (queue.playing) {
		const formattedTimeTillNextSong = client.utils.formatMS(queue.totalTime - queue.streamTime);

		const queueLength = queue.tracks.length;

		const addedToQueue = new MessageEmbed()
			.setAuthor('Added to queue', track.requestedBy.displayAvatarURL())
			.setDescription(`[${track?.title}](${track.url})`)
			.setThumbnail(track.thumbnail)
			.addField('Channel', `${track.author}`, true)
			.addField('Song Duration', `${client.music.format(track.duration)}`, true)
			.addField('Estimated time until playing', `${formattedTimeTillNextSong || 'Unavaliable'}`, true)
			.addField('Position in queue', `${queueLength}`, true)
			.setColor(client.embed.color.default);
		return queue.metadata.channel.send({ embeds: [addedToQueue] });
	}

	const songEmbed = new MessageEmbed()
		.setDescription(`🎶 Playing [**${track.title}**](${track.url}) - Now!`)
		.setThumbnail(client.embed.thumbnails.ameGuitar)
		.setColor(client.embed.color.default);
	return queue.metadata.channel.send({ embeds: [songEmbed] });
};

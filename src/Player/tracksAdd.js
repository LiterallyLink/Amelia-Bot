const { MessageEmbed } = require('discord.js');

module.exports = (client, queue, tracks) => {
	const { thumbnail, requestedBy } = tracks[0];

	const playlistAddedToQueue = new MessageEmbed()
		.setAuthor('Playlist added to queue', requestedBy.displayAvatarURL())
		.setThumbnail(thumbnail)
		.addField('Enqueued', `${tracks.length} songs`, true)
		.setColor(client.embed.color.default);
	return queue.metadata.channel.send({ embeds: [playlistAddedToQueue] });
};

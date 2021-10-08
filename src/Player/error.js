module.exports = (client, queue, error) => {
	if (queue) queue.play();
	console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
};

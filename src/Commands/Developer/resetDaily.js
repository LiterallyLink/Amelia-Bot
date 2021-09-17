const Command = require('../../Structures/Command');
const profileSchema = require('../../Models/profileSchema');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Reset a specified users daily cooldown',
			category: 'Economy',
			devOnly: true,
			guildOnly: true
		});
	}

	async run(message) {
		const mention = message.mentions.users.first() || message.author;
		const user = await profileSchema.findOneAndUpdate({ guildId: message.guild.id, userId: mention.id }, { dailyClaimed: 0 });
		user.save().catch(err => console.log(err));

		return message.reply(`${mention}'s daily has been reset.`);
	}

};

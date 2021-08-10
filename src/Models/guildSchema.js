const mongoose = require('mongoose');
const config = require('../../config.json');

const guildSchema = new mongoose.Schema({
	guildID: { type: String, required: true, unique: true },
	guildName: { type: String, required: true, unique: true },
	disabledModules: { type: Array, default: [] },
	disabledCommands: { type: Array, default: [] },
	prefix: { type: String, required: true, default: config.prefix },
	xpSettings: { guildId: String, minXPGain: { type: Number, default: 1 }, maxXPGain: { type: Number, default: 30 } },
	levelUpMsg: { type: Boolean, default: true },
	antiInvites: { type: Boolean, default: false },
	antiLinks: { type: Boolean, default: false },
	dailyAmount: { type: Number, default: 150 }
});

module.exports = mongoose.model('Guild', guildSchema, 'guilds');

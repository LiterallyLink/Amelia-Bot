const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
	guildId: { type: String, required: true },
	userId: { type: String, required: true },
	credits: { type: Number, required: true, default: 0 },
	badges: { type: Array, default: [] },
	xp: { type: Number, default: 0 },
	level: { type: Number, default: 0 },
	dailyClaimed: { type: Number, default: 0 },
	dailyClaimedStreak: { type: Number, default: 0 },
	lastUpdated: { type: Date, default: new Date().getTime() },
	isBlacklisted: { type: Boolean, default: false },
	rankcards: { type: Array, default: [] },
	currentCard: { type: String, default: 'default' }

});

module.exports = mongoose.model('profile', profileSchema, 'profiles');

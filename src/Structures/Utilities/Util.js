/* eslint-disable array-callback-return */
const Command = require('../Command.js');
const { MessageEmbed, Collection } = require('discord.js');
const Event = require('../Event.js');
const { token } = require('../../../config.json');
const path = require('path');
const { promisify } = require('util');
const emojis = require('../../../assets/jsons/emotes.json');
const glob = promisify(require('glob'));
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = class Util {

	constructor(client) {
		this.client = client;
	}

	// Returns if the input is a type of class.
	isClass(input) {
		return typeof input === 'function' &&
            typeof input.prototype === 'object' &&
            input.toString().substring(0, 5) === 'class';
	}

	// fetches specified directories.
	get directory() {
		return `${path.dirname(require.main.filename)}${path.sep}`;
	}

	async sleep(ms) {
		await new Promise(resolve => setTimeout(resolve, ms));
	}

	// trim's array lengths
	trimArray(arr, maxLen = 10) {
		if (arr.length > maxLen) {
			const len = arr.length - maxLen;
			arr = arr.slice(0, maxLen);
			arr.push(`${len} more...`);
		}
		return arr;
	}

	// removes duplicate properties from arrays.
	removeDuplicates(arr) {
		return [...new Set(arr)];
	}

	// turns strings to lowercase, then uppercases the first letter.
	capitalise(string) {
		return string[0].toUpperCase() + string.slice(1).toLowerCase();
	}

	// Checks if the user is an owner.
	userIsADev(author) {
		return this.client.devs.includes(author.id);
	}

	// Compares the member and targets permissions based on their highest role.
	comparePerms(member, target) {
		return member.roles.highest.position < target.roles.highest.position;
	}

	getRole(role, guild) {
		if (!role) return null;

		if (/^[0-9]+$/.test(role)) {
			return guild.roles.cache.get(role);
		} else if (/^<@&[0-9]+>$/.test(role)) {
			const id = role.substring(3, role.length - 1);
			return guild.roles.cache.get(id);
		}

		return guild.roles.cache.find(mention => mention.name.toLowerCase() === role.toLowerCase());
	}

	getChannel(ch, guild) {
		if (!ch) return null;
		let channel;

		if (/^[0-9]+$/.test(ch)) {
			channel = guild.channels.cache.get(ch);
			if (!channel || ['dm', 'voice', 'category', 'store'].includes(channel.type)) return null;
			return channel;
		} else if (/^<#[0-9]+>$/.test(ch)) {
			const id = ch.substring(2, ch.length - 1);
			channel = guild.channels.cache.get(id);
			if (!channel || ['dm', 'voice', 'category', 'store'].includes(channel.type)) return null;
			return channel;
		}

		return guild.channels.cache.find(chl => (chl.type === 'text') && chl.name.toLowerCase() === ch);
	}

	// Format's numbers with commas.
	formatNumber(num) {
		return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
	}

	msToTime(ms) {
		const totalSeconds = ms / 1000;
		const hr = (totalSeconds % 86400) / 3600;
		const min = (totalSeconds % 3600) / 60;
		const sec = totalSeconds % 60;

		return `${(hr > 0 ? `${Math.floor(hr)}h ` : '') + (min > 0 ? `${Math.floor(min)}m ` : '')}${Math.floor(sec)}s`;
	}

	formatPermissions(perm) {
		return perm
			.toLowerCase()
			.replace(/(^|"|_)(\S)/g, (letter) => letter.toUpperCase())
			.replace(/_/g, ' ')
			.replace(/Guild/g, 'Server')
			.replace(/Use Vad/g, 'Use Voice Acitvity');
	}

	formatArray(array, type = 'conjunction') {
		return new Intl.ListFormat('en-GB', {
			style: 'short',
			type: type
		}).format(array);
	}

	arrayRemove(arr, value) {
		return arr.filter((ele) => ele !== value);
	}

	/* Checks if the command requires argumnents, and if arguments were not provided.
		If none were provided, it returns a message and a boolean based on this value.
	*/

	commandRequiresArguments(message, command, args) {
		const argumentsBoolean = !!(command.args && !args.length);

		if (argumentsBoolean) {
			const noArgumentsGiven = new MessageEmbed()
				.setAuthor(`${message.author.username}`, message.member.user.displayAvatarURL())
				.setDescription(`${emojis.fail} Lack of arguments given.\n** **\nUsage: \`${command.usage}\``)
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(this.client.embed.color.error);
			message.reply({ embeds: [noArgumentsGiven] });
		}

		return argumentsBoolean;
	}

	// Shuffles and returns the given array.
	shuffle(array) {
		const arr = array.slice(0);
		for (let i = arr.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
		return arr;
	}

	// Returns a number between the minimum and maximum integers provided.
	randomRange(min, max) {
		return Math.round(Math.random() * (max - min)) + min;
	}

	abbreviateNumber(value) {
		let newValue = value;

		if (value >= 1000) {
			const suffixes = ['', 'k', 'm', 'b', 't'];
			const suffixNum = Math.floor(`${value}`.length / 3);

			let shortValue = '';

			for (let precision = 2; precision >= 1; precision--) {
				shortValue = parseFloat((suffixNum !== 0 ? value / Math.pow(1000, suffixNum) : value).toPrecision(precision));
				var dotLessShortValue = `${shortValue}`.replace(/[^a-zA-Z 0-9]+/g, '');
				if (dotLessShortValue.length <= 2) { break; }
			}
			if (shortValue % 1 !== 0) shortValue = shortValue.toFixed(1);
			newValue = shortValue + suffixes[suffixNum];
		}

		return newValue;
	}

	// Detects if the number is whole.

	msToDate(ms) {
		const date = new Date(ms);
		return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
	}

	// number must not contain anything but numbers, must be greater than zero, and must be a whole number.
	isInt(num) {
		return /^[0-9]+$/.test(num) && num > 0 && Number.isInteger(parseInt(num));
	}

	async getMember(message, memberToFind = '', returnToAuthor) {
		// Fetches the user from their mention
		if (memberToFind && message.mentions.members.size > 0) {
			memberToFind = message.mentions.members.first();

			return memberToFind.user;
		}

		// Fetch via ID
		const fetchedByID = await this.client.users.fetch(memberToFind).catch(() => null);

		if (memberToFind && fetchedByID !== null) return fetchedByID;

		// Fetch by username, then display name (server nicknames), then tags

		memberToFind = memberToFind.toLowerCase();

		const findByNickname = message.guild.members.cache.find(member => member.user.username.toLowerCase() === memberToFind) ||
		message.guild.members.cache.find(member => member.displayName.toLowerCase().includes(memberToFind) || member.user.tag.toLowerCase().includes(memberToFind));

		if (memberToFind && findByNickname) {
			return findByNickname.user;
		}

		if (!memberToFind && returnToAuthor === true) {
			return message.author;
		}

		return null;
	}

	userCooldown(message, command) {
		if (this.userIsADev(message.author)) return false;

		if (!this.client.cooldowns.has(command.name)) {
			this.client.cooldowns.set(command.name, new Collection());
		}

		const currentTime = Date.now();
		const timeout = this.client.cooldowns.get(command.name);
		const commandCooldown = command.cooldown ? command.cooldown : 3;

		if (timeout.has(message.author.id)) {
			const expirationTime = timeout.get(message.author.id) + (commandCooldown * 1000);
			const isCooldownOver = currentTime < expirationTime;

			if (isCooldownOver) {
				const timeLeft = (expirationTime - currentTime) / 1000;
				message.reply(`Please wait ${timeLeft.toFixed(1)}s to use ${command.name} again!`);
				return isCooldownOver;
			}
		}

		timeout.set(message.author.id, currentTime);
		return this.isCooldownOver;
	}


	// Custom asynchronous message collection function
	async createAsyncMessageCollector(message, input, maxEntries, time) {
		const filter = res => res.author.id === message.author.id && input.includes(res.content.toLowerCase());

		const caughtMessages = await message.channel.awaitMessages({ filter, max: maxEntries, time: time });

		return caughtMessages.size > 0 ? caughtMessages.first().content.toLowerCase() : false;
	}

	async buttonCollector(message, collectorMsg, collectorTime) {
		const optionFilter = i => {
			i.deferUpdate();
			return i.user.id === message.author.id;
		};

		const optionID = await collectorMsg.awaitMessageComponent({ filter: optionFilter, time: collectorTime })
			.then(interaction => interaction.customId)
			.catch(() => null);

		return optionID;
	}


	async clearSlashCommands() {
		const clientId = '724481965000228886';
		const rest = new REST({ version: '9' }).setToken(token);
		rest.get(Routes.applicationCommands(clientId)).then(data => {
			const promises = [];
			for (const command of data) {
				const deleteUrl = `${Routes.applicationCommands(clientId)}/${command.id}`;
				promises.push(rest.delete(deleteUrl));
			}
			return Promise.all(promises);
		});
	}
	// Loads and sets all commands to a collection for the bot to interpret.
	async loadCommands() {
		return glob(`${this.directory}commands/**/*.js`).then(commands => {
			for (const commandFile of commands) {
				delete require.cache[commandFile];
				const { name } = path.parse(commandFile);
				const File = require(commandFile);
				if (!this.isClass(File)) throw new TypeError(`Command ${name} doesn't export a class.`);
				const command = new File(this.client, name.toLowerCase());
				if (!(command instanceof Command)) throw new TypeError(`Comamnd ${name} doesnt belong in Commands.`);
				this.client.commands.set(command.name, command);
				if (command.aliases.length) {
					for (const alias of command.aliases) {
						this.client.aliases.set(alias, command.name);
					}
				}
			}
		});
	}

	// Loads all of the discord bot events using file directories, collections and the Event.js file
	async loadEvents() {
		return glob(`${this.directory}events/**/*.js`).then(events => {
			for (const eventFile of events) {
				delete require.cache[eventFile];
				const { name } = path.parse(eventFile);
				const File = require(eventFile);
				if (!this.isClass(File)) throw new TypeError(`Event ${name} doesn't export a class!`);
				const event = new File(this.client, name);
				if (!(event instanceof Event)) throw new TypeError(`Event ${name} doesn't belong in Events`);
				this.client.events.set(event.name, event);
				event.emitter[event.type](name, (...args) => event.run(...args));
			}
		});
	}

	async loadPlayerEvents() {
		return glob(`${this.directory}Player/**/*.js`).then(events => {
			for (const file of events) {
				const event = require(`${file}`);
				this.client.player.on(file.split('/').pop().split('.')[0], event.bind(null, this.client));
			}
		});
	}

};


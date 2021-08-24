const Command = require('../Command.js');
const { MessageEmbed, Collection } = require('discord.js');
const Event = require('../Event.js');
const path = require('path');
const { promisify } = require('util');
const emojis = require('../../../assets/jsons/emotes.json');
const glob = promisify(require('glob'));

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
	checkOwner(author) {
		return this.client.owners.includes(author.id);
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

	// Format's numbers e.g if num = 15000, it formats to 15,000.
	formatNumber(num) {
		return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
	}

	formatMS(milliseconds) {
		const totalSeconds = milliseconds / 1000;
		const hr = (totalSeconds % 86400) / 3600;
		const min = (totalSeconds % 3600) / 60;
		const sec = totalSeconds % 60;
		const mili = milliseconds % 1000;

		return (hr > 1 ? `${Math.floor(hr)}h ` : '') + (min > 1 ? `${Math.floor(min)}m ` : '') +
		((min === 0) || sec > 1 || mili > 0 ? `${Math.floor(sec)}s` : '');
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

	// Shuffles and returns any given array.
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

	async getMember(message, memberToFind = '', returnToAuthor) {
		if (!memberToFind && returnToAuthor === true) {
			return message.author;
		}


		if (message.mentions.members.size !== 0) {
			memberToFind = message.mentions.members.first();

			return memberToFind.user;
		}

		const fetchById = await this.client.users.fetch(memberToFind).catch(() => null);


		if (fetchById) {
			return fetchById.user;
		}

		const findMyNickname = message.guild.members.cache.find(member => member.user.username.toLowerCase() === memberToFind) ||
		message.guild.members.cache.find(user => user.displayName.toLowerCase() === memberToFind);

		if (findMyNickname) {
			return findMyNickname.user;
		}

		return message.author;
	}

	userCooldown(message, command) {
		if (this.checkOwner(message.author)) return false;

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
		const optionFilter = i => i.user.id === message.author.id;
		const optionID = await collectorMsg.awaitMessageComponent({ filter: optionFilter, time: collectorTime })
			.then(interaction => interaction.customId)
			.catch(() => null);

		return optionID;
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


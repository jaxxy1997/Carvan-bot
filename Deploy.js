const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('report')
        .setDescription('Report een speler')
        .addUserOption(o => o.setName('speler').setRequired(true))
        .addStringOption(o => o.setName('reden').setRequired(true))
        .addAttachmentOption(o => o.setName('bewijs').setDescription('Bewijs')),

    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Geef warning')
        .addUserOption(o => o.setName('speler').setRequired(true))
        .addStringOption(o => o.setName('reden').setRequired(true)),

    new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Bekijk warnings')
        .addUserOption(o => o.setName('speler').setRequired(true)),

    new SlashCommandBuilder()
        .setName('clearwarnings')
        .setDescription('Reset warnings')
        .addUserOption(o => o.setName('speler').setRequired(true))
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
    );

    console.log('Commands geregistreerd');
})();

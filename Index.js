require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField
} = require('discord.js');
const mongoose = require('mongoose');
const User = require('./models/User');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'));

client.once('ready', () => {
    console.log(`Online als ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {

    if (interaction.isChatInputCommand()) {

        // REPORT
        if (interaction.commandName === 'report') {
            const target = interaction.options.getUser('speler');
            const reason = interaction.options.getString('reden');
            const bewijs = interaction.options.getAttachment('bewijs');

            const embed = new EmbedBuilder()
                .setTitle('🚨 Caravan Report')
                .addFields(
                    { name: 'Reporter', value: interaction.user.tag },
                    { name: 'Overtreder', value: target.tag },
                    { name: 'Reden', value: reason }
                )
                .setColor('Red');

            if (bewijs) embed.setImage(bewijs.url);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`approve_${target.id}`)
                    .setLabel('Approve')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId(`deny_${target.id}`)
                    .setLabel('Deny')
                    .setStyle(ButtonStyle.Danger)
            );

            const channel = interaction.guild.channels.cache.get(process.env.STAFF_CHANNEL_ID);
            await channel.send({ embeds: [embed], components: [row] });

            await interaction.reply({ content: 'Report ingediend!', ephemeral: true });
        }

        // WARN
        if (interaction.commandName === 'warn') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
                return interaction.reply({ content: 'Geen permission!', ephemeral: true });
            }

            const target = interaction.options.getUser('speler');
            const reason = interaction.options.getString('reden');

            let user = await User.findOne({ userId: target.id });
            if (!user) user = new User({ userId: target.id });

            user.warnings.push({ reason });
            await user.save();

            await interaction.reply(`⚠️ ${target.tag} warned. Totaal: ${user.warnings.length}`);
        }

        // WARNINGS
        if (interaction.commandName === 'warnings') {
            const target = interaction.options.getUser('speler');
            const user = await User.findOne({ userId: target.id });

            if (!user || user.warnings.length === 0) {
                return interaction.reply(`${target.tag} heeft geen warnings.`);
            }

            const list = user.warnings.map((w, i) => `${i + 1}. ${w.reason}`).join('\n');
            await interaction.reply(`⚠️ Warnings van ${target.tag}:\n${list}`);
        }

        // CLEAR
        if (interaction.commandName === 'clearwarnings') {
            const target = interaction.options.getUser('speler');
            await User.findOneAndDelete({ userId: target.id });

            await interaction.reply(`${target.tag} warnings gereset.`);
        }
    }

    // BUTTONS
    if (interaction.isButton()) {
        const [action, userId] = interaction.customId.split('_');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: 'Geen permission!', ephemeral: true });
        }

        const target = await interaction.guild.members.fetch(userId);

        if (action === 'approve') {
            let user = await User.findOne({ userId });
            if (!user) user = new User({ userId });

            user.warnings.push({ reason: 'Approved report' });
            await user.save();

            await interaction.update({
                content: `Report goedgekeurd. ${target.user.tag} warned.`,
                components: []
            });
        }

        if (action === 'deny') {
            await interaction.update({
                content: 'Report afgewezen.',
                components: []
            });
        }
    }
});

client.login(process.env.TOKEN);

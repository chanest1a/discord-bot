const { Client, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const prefix = 's!';
const token = 'YOUR_BOT_TOKEN'; // Bot tokeninizi buraya ekleyin

client.once('ready', () => {
  console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Komut: s!help
  if (command === 'help') {
    const embed = new EmbedBuilder()
      .setTitle('Yardım Menüsü')
      .setDescription(`
        **Komutlar:**
        - **s!mute <kullanıcı> [süre]** - Kullanıcıyı susturur.
        - **s!ban <kullanıcı> [sebep]** - Kullanıcıyı banlar.
        - **s!lock** - Kanalı kilitler.
        - **s!sil <miktar>** - Belirtilen miktarda mesaj siler.
        - **s!rolbuton <açıklama> #kanal @rol butonismi** - Rol butonu oluşturur.
        - **s!rolal <kullanıcı> <rol>** - Kullanıcıdan rol alır.
        - **s!rolver <kullanıcı> <rol>** - Kullanıcıya rol verir.
      `)
      .setColor('#0099ff');
    message.channel.send({ embeds: [embed] });
  }

  // Komut: s!mute
  if (command === 'mute') {
    if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers)) return message.reply('Bu komutu kullanmak için yetkin yok!');
    const user = message.mentions.members.first();
    if (!user) return message.reply('Lütfen bir kullanıcı etiketle!');
    let duration = args[1] ? parseInt(args[1]) : null;
    if (duration && isNaN(duration)) return message.reply('Geçerli bir süre gir (saniye cinsinden)!');
    try {
      await user.timeout(duration ? duration * 1000 : null, 'Susturma işlemi');
      message.channel.send(`${user} ${duration ? `${duration} saniye boyunca` : 'süresiz'} susturuldu!`);
    } catch (error) {
      message.reply('Susturma işlemi başarısız oldu!');
    }
  }

  // Komut: s!ban
  if (command === 'ban') {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply('Bu komutu kullanmak için yetkin yok!');
    const user = message.mentions.members.first();
    if (!user) return message.reply('Lütfen bir kullanıcı etiketle!');
    const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi';
    try {
      await user.ban({ reason });
      message.channel.send(`${user} banlandı! Sebep: ${reason}`);
    } catch (error) {
      message.reply('Banlama işlemi başarısız oldu!');
    }
  }

  // Komut: s!lock
  if (command === 'lock') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply('Bu komutu kullanmak için yetkin yok!');
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
      message.channel.send('Kanal kilitlendi!');
    } catch (error) {
      message.reply('Kanal kilitlenemedi!');
    }
  }

  // Komut: s!sil
  if (command === 'sil') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply('Bu komutu kullanmak için yetkin yok!');
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) return message.reply('1-100 arasında bir sayı gir!');
    try {
      await message.channel.bulkDelete(amount, true);
      message.channel.send(`${amount} mesaj silindi!`);
    } catch (error) {
      message.reply('Mesaj silme işlemi başarısız oldu!');
    }
  }

  // Komut: s!rolbuton
  if (command === 'rolbuton') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply('Bu komutu kullanmak için yetkin yok!');
    const description = args[0];
    const channel = message.mentions.channels.first();
    const role = message.mentions.roles.first();
    const buttonName = args.slice(3).join(' ');
    if (!description || !channel || !role || !buttonName) return message.reply('Eksik parametre! Kullanım: s!rolbuton <açıklama> #kanal @rol butonismi');

    const embed = new EmbedBuilder()
      .setTitle('Rol Butonu')
      .setDescription(description)
      .setColor('#00ff00');

    const button = new ButtonBuilder()
      .setCustomId(`rol_${role.id}`)
      .setLabel(buttonName)
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    try {
      await channel.send({ embeds: [embed], components: [row] });
      message.reply('Rol butonu başarıyla oluşturuldu!');
    } catch (error) {
      message.reply('Rol butonu oluşturulamadı!');
    }
  }

  // Komut: s!rolal
  if (command === 'rolal') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply('Bu komutu kullanmak için yetkin yok!');
    const user = message.mentions.members.first();
    const role = message.mentions.roles.first();
    if (!user || !role) return message.reply('Lütfen bir kullanıcı ve rol etiketle!');
    try {
      await user.roles.remove(role);
      message.channel.send(`${user}'dan ${role} rolü alındı!`);
    } catch (error) {
      message.reply('Rol alma işlemi başarısız oldu!');
    }
  }

  // Komut: s!rolver
  if (command === 'rolver') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply('Bu komutu kullanmak için yetkin yok!');
    const user = message.mentions.members.first();
    const role = message.mentions.roles.first();
    if (!user || !role) return message.reply('Lütfen bir kullanıcı ve rol etiketle!');
    try {
      await user.roles.add(role);
      message.channel.send(`${user}'a ${role} rolü verildi!`);
    } catch (error) {
      message.reply('Rol verme işlemi başarısız oldu!');
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId.startsWith('rol_')) {
    const roleId = interaction.customId.split('_')[1];
    const role = interaction.guild.roles.cache.get(roleId);
    if (!role) return interaction.reply({ content: 'Rol bulunamadı!', ephemeral: true });
    try {
      await interaction.member.roles.add(role);
      interaction.reply({ content: `${role} rolü sana verildi!`, ephemeral: true });
    } catch (error) {
      interaction.reply({ content: 'Rol verilemedi!', ephemeral: true });
    }
  }
});

client.login(MTM2OTMwMjkwMzM5MDQ3MDE0NA.Go3-B8.OxqMJzLiaeh3JZLIt1ul1Bg0q03-GhjGzQyDAM);

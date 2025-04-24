require("dotenv").config();
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // For handling input

const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.STRING_SESSION);

(async () => {
  console.log("Loading interactive example...");

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () =>
      await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });

  console.log("You should now be connected.");
  console.log("Your session string:", client.session.save()); // Save this string to avoid logging in again

  const me = await client.getMe();
  console.log("Your account info:", me);
  console.log(
    "You joined Telegram on:",
    new Date(me.created * 1000).toLocaleString()
  );

  // Get all your dialogs (chats, groups, channels)
  const dialogs = await client.getDialogs();

  console.log("\nGroups you are in:");
  const groups = dialogs.filter((d) => d.isGroup);
  groups.forEach((group, i) => {
    console.log(`${i + 1}. ${group.title} (${group.id})`);
  });

  console.log("\nPeople you have chatted with:");
  const privateChats = dialogs.filter((d) => d.isUser);
  privateChats.forEach((chat, i) => {
    console.log(
      `${i + 1}. ${chat.name} (${chat.id}) - Last message: ${new Date(
        chat.date * 1000
      ).toLocaleString()}`
    );
  });

  // To get more detailed information about the last message in each chat
  console.log("\nDetailed last message times:");
  for (const dialog of dialogs) {
    const messages = await client.getMessages(dialog.entity, {
      limit: 1,
    });

    if (messages.length > 0) {
      const lastMsg = messages[0];
      console.log(
        `Chat: ${dialog.name || dialog.title} - Last message: ${new Date(
          lastMsg.date * 1000
        ).toLocaleString()}`
      );
    }
  }

  await client.disconnect();
})();

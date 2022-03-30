const { GoogleSpreadsheet } = require("google-spreadsheet");
const tmi = require("tmi.js");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);

const doc = new GoogleSpreadsheet(
  "1tMRHBU-_NGTSj9h2L6tONjBtVRiTPTkYPwpPq4O1Sis"
);

const initDoc = async () => {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });
  await doc.loadInfo(); // loads document properties and worksheets
};
initDoc();

const client = new tmi.Client({
  options: { debug: true, messagesLogLevel: "info" },
  connection: {
    reconnect: true,
    secure: true,
  },
  identity: {
    username: "opti_21",
    password: process.env.TWITCH_PASS,
  },
  channels: ["veryhandsomebilly"],
});
client.connect().catch(console.error);

client.on("message", async (channel, tags, message, self) => {
  if (self) return;
  if (tags.mod) {
    const command = message.split(" ")[0];

    if (command === "!tipevent") {
      const dataSplit = message.split(" ");
      const tipMessage = dataSplit.slice(3).join(" ");

      const sheet = doc.sheetsByIndex[0];
      await sheet.addRow({
        user: dataSplit[1],
        event: `tip`,
        raw_amount: dataSplit[2],
        amount: dataSplit[2],
        message: tipMessage,
        time: dayjs.utc().format(),
      });

      client.say(
        channel,
        `veryhaTingle veryhaTingle veryhaTingle ${dataSplit[1]} just tipped $${dataSplit[2]} veryhaFrick veryhaTingle veryhaTingle veryhaTingle `
      );
    }
  }
});

client.on(
  "submysterygift",
  async (channel, username, numbOfSubs, methods, userstate) => {
    // Do your stuff.
    let senderCount = ~~userstate["msg-param-sender-count"];
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow({
      user: username,
      event: `gifted_subs`,
      raw_amount: numbOfSubs,
      amount: numbOfSubs,
      time: dayjs.utc().format(),
    });
  }
);

client.on("cheer", async (channel, userstate, message) => {
  // Do your stuff.
  const sheet = doc.sheetsByIndex[0];
  await sheet.addRow({
    user: userstate.username,
    event: `bits`,
    raw_amount: userstate.bits,
    amount: userstate.bits,
    message: message,
    time: dayjs.utc().format(),
  });
});

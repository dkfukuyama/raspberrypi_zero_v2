const { IncomingWebhook } = require("@slack/webhook");

let webhook = null;

async function slacksend(text) {

  if(!webhook) webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK);

  await webhook.send({
    text: text,
    channel: "#general"
  });
};

exports.slacksend = slacksend;



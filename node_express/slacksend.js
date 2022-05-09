const { IncomingWebhook } = require("@slack/webhook");

const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK);

async function slacksend(text) {
  //console.log(process.env.SLACK_WEBHOOK);
  await webhook.send({
    text: text,
    channel: "#general"
  });
};

exports.slacksend = slacksend;



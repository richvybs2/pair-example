const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

const prefix = "CIPHER-MD*7";
const output = "./session/";

function generateSessionId(phoneNumber) {
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${prefix}${randomPart}`;
}

async function sendSessionId(sock, userJid, sessionId) {
  const sessionPath = path.join(output, `${userJid}/creds.json`);
  if (!fs.existsSync(path.dirname(sessionPath))) {
    fs.mkdirSync(path.dirname(sessionPath), { recursive: true });
  }

  fs.writeFileSync(sessionPath, JSON.stringify({ sessionId }));

  await sock.sendMessage(userJid, {
    text: `✅ Your session ID is:\n\n${sessionId}\n\nUse this to deploy your WhatsApp bot.`
  });
}

async function startBot() {
  const { state, saveState } = useSingleFileAuthState('./auth_info.json');
  const sock = makeWASocket({ auth: state, printQRInTerminal: true });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const userJid = msg.key.remoteJid; // User's WhatsApp number
    const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    if (messageText.toLowerCase().includes("link me")) {
      const sessionId = generateSessionId(userJid);
      await sendSessionId(sock, userJid, sessionId);
    }
  });

  sock.ev.on('creds.update', saveState);
}

startBot();

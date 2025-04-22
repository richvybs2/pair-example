const { File } = require('megajs');
const fs = require('fs');

const prefix = "CIPHER-MD*7"; // Your prefix
const output = "./session/"; // Where to save creds.json

async function saveCreds(id) {
  if (!id.startsWith(prefix)) {
    throw new Error(`Prefix doesn't match. Check if "${prefix}" is correct.`);
  }

  const megaIdAndKey = id.replace(prefix, "");
  const url = `https://mega.nz/file/${megaIdAndKey}`;
  const file = File.fromURL(url);
  
  await file.loadAttributes();

  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
  }

  const data = await file.downloadBuffer();
  fs.writeFileSync(`${output}creds.json`, data);

  console.log("Credentials saved successfully to session/creds.json");
}

// Call the function with your MEGA ID
saveCreds("CIPHER-MD*70s4RXaKS#L54_Iezf1TQAFaL2eomEkPrd4ZPO4R5yN9AiFLoouUk");

import process from 'node:process';
import { Readable } from 'node:stream';
import { google } from 'googleapis';
import fs from 'fs';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const IMAGE_FILE_TYPES = {
  "jpeg": "image/jpeg",
  "png": "image/png",
  "gif": "image/gif",
  "bmp": "image/bmp",
  "webp": "image/webp",
}

const LUMORA_APP_FOLDER_ID = "1wuuNdeJS_lpU69CN_npFyp8q-vrF7QBG";
const LUMORA_IMAGES_FOLDER_ID = "1dDnQ-fnDO6sOLSLvIccLEUcL4safS0Rh";

const credentials = JSON.parse(process.env.GOOGLE_CLOUD_OAUTH_CREDNTIALS);
const { client_id, client_secret, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Load saved refresh token
const token = JSON.parse(process.env.GOOGLE_CLOUD_OAUTH_TOKEN);
oAuth2Client.setCredentials(token);

const drive = google.drive({ version: 'v3', auth: oAuth2Client });


async function uploadFile() {
  const fileMetadata = {
    name: 'Lumoralogo.jpeg',
    parents: [LUMORA_IMAGES_FOLDER_ID], // optional: upload to specific folder
  };
  const media = { body: fs.createReadStream('../public/Lumoralogo.jpeg') };

  const file = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id',
  });

    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

  console.log('File uploaded, ID:', file.data.id);
}

/** Upload from in-memory buffer. Returns { id, url }. */
async function uploadFileFromBuffer(buffer, filename, mimeType) {
  const fileMetadata = {
    name: filename,
    parents: [LUMORA_IMAGES_FOLDER_ID],
  };
  const media = {
    mimeType: mimeType || 'application/octet-stream',
    body: Readable.from(buffer),
  };
  const file = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id',
  });
  await drive.permissions.create({
    fileId: file.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });
  
  const id = file.data.id;
  return { id, url: `https://drive.google.com/uc?id=${id}` };
}

if (process.argv[1]?.includes('imageHosting.js')) {
  uploadFile();
}

async function listImages() {
  const res = await drive.files.list({
    q: `'${LUMORA_IMAGES_FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`,
    fields: "files(id, name)"
  });

  return res.data.files.map(file => ({
    name: file.name,
    url: `https://drive.google.com/uc?id=${file.id}`
  }));
}

async function getImageUrl(fileId) {
  return `https://drive.google.com/uc?id=${fileId}`;
}


export default {
  listImages,
  getImageUrl,
  uploadFile,
  uploadFileFromBuffer,
};
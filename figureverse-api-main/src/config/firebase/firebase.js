const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
require('dotenv').config();

function init() {
  if (admin.apps.length) return admin.app();
  const credsPath = process.env.FIREBASE_CREDENTIALS_PATH;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (credsPath) {
    const json = fs.readFileSync(path.resolve(credsPath), 'utf8');
    const sa = JSON.parse(json);
    return admin.initializeApp({
      credential: admin.credential.cert(sa),
      projectId: projectId || sa.project_id,
    });
  }
  return admin.initializeApp();
}

const app = init();
const firestore = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

module.exports = { admin, app, firestore, auth, storage };
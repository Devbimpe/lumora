const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log('Using Firebase project:', serviceAccount.project_id); 

const db = admin.firestore();
module.exports = db;

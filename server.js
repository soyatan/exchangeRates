var Firebase = require("firebase");

const admin = require("firebase-admin");
const serviceAccount = require("../mullberry-fb.json");
const fs = require("fs");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://mullberry-af9a1-default-rtdb.europe-west1.firebasedatabase.app",
});

const db = admin.database();

var ref = db.ref("users");

ref.once("value", function (snapshot) {
  console.log(snapshot.val());
});

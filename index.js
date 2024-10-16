const express = require("express");
const webpush = require("web-push");
const cors = require("cors");
const app = express();

const data = [];

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
// Middleware pour parser le corps de la requête en JSON
app.use(express.json());
app.use(cors(corsOptions));
const port = 8000;

// VAPID keys should be generated only once.
const vapidKeys = webpush.generateVAPIDKeys();

webpush.setGCMAPIKey("<Your GCM API Key Here>");
webpush.setVapidDetails(
  "mailto:http://localhost:5173/",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// This is the same output of calling JSON.stringify on a PushSubscription
const pushSubscription = {
  endpoint: ".....",
  keys: {
    auth: ".....",
    p256dh: ".....",
  },
};

// webpush.sendNotification(pushSubscription, 'Your Push Payload Text');

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/notifications-key", (req, res) => {
  res.send(vapidKeys.publicKey);
});

app.post("/save-subscription", (req, res) => {
  console.log(req.body);
  if (pushSubscription.endpoint !== req.body.endpoint) {
    pushSubscription.endpoint = req.body.endpoint;
    pushSubscription.keys.auth = req.body.keys.auth;
    pushSubscription.keys.p256dh = req.body.keys.p256dh;
  }
  res.send({ resolvetext: "ok I have save subscription" });
});

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});

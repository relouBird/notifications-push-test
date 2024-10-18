import express, { Express, Request, Response } from "express";
import webpush from "web-push";
import dotenv from "dotenv";
import cors from "cors";
import { PushSubscriptionProps } from "./NotificationsTypes";
import {
  DatabaseGetSubcription,
  DatabaseSaveSubscriptionInstance,
  DatabaseTest,
  SubscriptionTable,
  syncSubscriptionTable,
} from "./DatabasesInit";

// configuration de base du serveur
dotenv.config();
const app = express();
const port = process.env.PORT;
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(express.json()); // Middleware pour parser le corps de la requête en JSON
app.use(cors(corsOptions));

// configuration du webPush pour la notification
const vapidKeys = webpush.generateVAPIDKeys();
// webpush.setGCMAPIKey("<Your GCM API Key Here>");
// VAPID keys should be generated only once.
webpush.setVapidDetails(
  "mailto:ulrichkwamou@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

DatabaseTest(); // permet de tester la connexion à la base de donnée
const SubscriptionTableConnection = SubscriptionTable;
syncSubscriptionTable();

let pushSubscription: PushSubscriptionProps = {
  // This is the same output of calling JSON.stringify on a PushSubscription
  endpoint: ".....",
  keys: {
    auth: ".....",
    p256dh: ".....",
  },
};

// webpush.sendNotification(pushSubscription, 'Your Push Payload Text');

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome Push Notifications Test....");
});

app.get("/notifications-key", (req: Request, res: Response) => {
  res.send(vapidKeys.publicKey);
});

app.post("/save-subscription", async (req: Request, res: Response) => {
  console.log(req.body);
  if (pushSubscription.endpoint !== req.body.endpoint) {
    pushSubscription = await DatabaseSaveSubscriptionInstance(
      req.body as PushSubscriptionProps,
      pushSubscription
    );
  }
  res.send({ resolvetext: "ok I have save subscription" });
});

app.get("/send-notification", async (req: Request, res: Response) => {
  const payload = JSON.stringify({
    title: "Hello",
    body: "Hello World :)",
  });
  const allNotificationsPush = await DatabaseGetSubcription();
  for (const notif of allNotificationsPush) {
    try {
      await webpush.sendNotification(notif, payload);
    } catch (err) {
      console.error(`Error sending notification to ${notif.endpoint}:`, err);
    }
  }
  res.send({ resolvetext: "ok I have send notification" });
});

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});

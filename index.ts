import express, {Express, Request, Response} from "express";
import webpush from "web-push";
import dotenv from 'dotenv';
import cors from "cors";
import { PushSubscriptionProps } from "./NotificationsTypes";

dotenv.config();

const app = express();
const port = process.env.PORT;
const bd_url = process.env.URL_DATABASE;

const data : PushSubscriptionProps[] = [];

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
// Middleware pour parser le corps de la requête en JSON
app.use(express.json());
app.use(cors(corsOptions));

// VAPID keys should be generated only once.
const vapidKeys = webpush.generateVAPIDKeys();


webpush.setGCMAPIKey("<Your GCM API Key Here>");
webpush.setVapidDetails(
  "mailto:http://localhost:5173/",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);


// This is the same output of calling JSON.stringify on a PushSubscription
const pushSubscription : PushSubscriptionProps = {
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

app.post("/save-subscription", (req: Request, res: Response) => {
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

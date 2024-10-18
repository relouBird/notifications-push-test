import { Sequelize, DataTypes } from "sequelize";
import { PushSubscriptionProps } from "./NotificationsTypes";
import dotenv from "dotenv";

// configuration de base du serveur
dotenv.config();
const bd_url = String(process.env.URL_DATABASE);

// Initialisation du de Sql ORM pour la gestion de son SGBDR
const sequelize = new Sequelize(bd_url);

export const SubscriptionTable = sequelize.define(
  "subscription",
  {
    // Model attributes are defined here
    endpoint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    p256dhKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    // Other model options go here
  }
);

// Synchronisation de la table en dehors de la fonction
export async function syncSubscriptionTable() {
  // Synchroniser sans supprimer
  await SubscriptionTable.sync({ alter: true }) // Utilisez force: false ou alter selon vos besoins
    .then(() =>
      console.log(
        "The table for the Subscription model was just (re)created / altered!"
      )
    )
    .catch((err: Error) =>
      console.error("Error during table synchronization: ", err)
    );
}

// permet de tester si l'on est bien connecté à la base de données...
export async function DatabaseTest() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

// permet de synchroniser tout le ORM
export async function DatabaseSync() {
  await sequelize.sync({ force: false }).then(() => {
    console.log("Database & tables created!");
  });
}

export async function DatabaseSaveSubscriptionInstance(
  dataSubscription: PushSubscriptionProps,
  pushSubscription: PushSubscriptionProps
) {
    const allSub = SubscriptionTable.findAll();
    const booleanTab: boolean[] = [];
    (await allSub).every((sub) => {
      if (sub.getDataValue("endpoint") == dataSubscription.endpoint) {
        // continue seulement si le endpoint n'est pas deja enregistré
        booleanTab.push(false);
      } else {
        booleanTab.push(true);
      }
    });
    if (booleanTab.includes(false)) {
      // continue
      console.log("Deja dans la database");
    } else {
      const instanceSub = SubscriptionTable.create({
        endpoint: dataSubscription.endpoint,
        authKey: dataSubscription.keys.auth,
        p256dhKey: dataSubscription.keys.p256dh,
      });
      console.log("Instance" + instanceSub + " was saved to the database!");
    }
    pushSubscription.endpoint = dataSubscription.endpoint;
    pushSubscription.keys.auth = dataSubscription.keys.auth;
    pushSubscription.keys.p256dh = dataSubscription.keys.p256dh;
    
    return pushSubscription;
}

export async function DatabaseGetSubcription (){
    const tabSubscription : PushSubscriptionProps[] = []
    const allSub = SubscriptionTable.findAll();
    (await allSub).every((sub) => {
      if(sub){
        tabSubscription.push({
            endpoint : sub.getDataValue("endpoint"),
            keys :{
                auth : sub.getDataValue("authKey"),
                p256dh : sub.getDataValue("p256dhKey")
            }
        })
      }
    });
    return [...tabSubscription]
}
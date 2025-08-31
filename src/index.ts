import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import { configureExpress } from './app/config/express';
import {EventProvider, MessageModule} from "./app/config/MessageModule";
import {Redis} from "ioredis";
// import {redis_config} from "./app/config/config";
import {EventManager} from "./messages/utilsAndConfugrations/eventsConfig/EventManager";
import {UserSignedUp} from "./messages/events/UserSignedUp";
import {HandleUserSignedUp} from "./app/modules/handlers/HandleUserSignedUp";
import {SendAccountActivationEmailEvent} from "./messages/events/SendAccountActivationEmailEvent";
import {HandleSendAccountActivationEmailEvent} from "./app/modules/handlers/HandleSendAccountActivationEmailEvent";

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());

const container = configureExpress(app);

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    try {
        //await container.runSeeds();
        console.log('Seeding completed');
    } catch (error) {
        console.error('Seeding failed', error);
    }
});

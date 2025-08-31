import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();
import cors, { CorsOptions } from 'cors';
import express from 'express';
import { configureExpress } from './app/config/express';
import {EventProvider, MessageModule} from "./app/config/MessageModule";
import {Redis} from "ioredis";
import {redis_config} from "./app/config/config";
import {EventManager} from "./messages/utilsAndConfugrations/eventsConfig/EventManager";
import {UserSignedUp} from "./messages/events/UserSignedUp";
import {HandleUserSignedUp} from "./app/modules/handlers/HandleUserSignedUp";
import {SendAccountActivationEmailEvent} from "./messages/events/SendAccountActivationEmailEvent";
import {HandleSendAccountActivationEmailEvent} from "./app/modules/handlers/HandleSendAccountActivationEmailEvent";

const PORT = process.env.PORT || 3000;

const app = express();

const allowedOrigin: string = 'https://mc-focus.onrender.com';

// Configure CORS options
const corsOptions: CorsOptions = {
  // The origin property can be a string, a regex, or a function.
  // We use a function here for maximum control and security.
  origin: (origin, callback) => {
    // The 'origin' parameter is the origin of the incoming request (e.g., 'https://mc-focus.onrender.com').
    // It will be `undefined` for server-to-server requests or tools like Postman/curl.
    
    // We allow requests if they come from our specified origin or if they have no origin.
    if (!origin || origin === allowedOrigin) {
      callback(null, true);
    } else {
      // If the origin is not allowed, we reject the request.
      callback(new Error('Not allowed by CORS'));
    }
  },

  // Specify which HTTP methods are allowed. "all operations" typically means these.
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',

  // Specify which headers the client is allowed to send.
  // 'Authorization' is common for sending JWTs or other auth tokens.
  allowedHeaders: 'Content-Type, Authorization',

  // Allow the browser to send cookies and authorization headers with the request.
  credentials: true,
};

// --- Middleware ---

// 1. Enable CORS with our specific options for all routes
app.use(cors(corsOptions));

// 2. An OPTIONS pre-flight check handler for all routes
// Browsers send an OPTIONS request before "complex" requests (like PUT, DELETE, or POST with certain content-types)
// to see if the server will allow it.
app.options('*', cors(corsOptions));

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

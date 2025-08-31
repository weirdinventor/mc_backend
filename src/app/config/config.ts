import {PostgresConnectionOptions} from "typeorm/driver/postgres/PostgresConnectionOptions";
import {getStorage} from "firebase-admin/storage";
import admin from "firebase-admin";
import sgMail from "@sendgrid/mail";
import {AppleAuthConfig} from "../../adapters/gateways/apple/AppleAuthGateway";
import {OAuth2Client} from "google-auth-library";
import {androidpublisher_v3, google} from "googleapis";

export const jwtConfig = {
    secret: process.env.JWT_SECRET,
    config: {
        expiresIn: process.env.JWT_DURATION,
    },
};

export const dingConfiguration = {
    secretToken: process.env.DING_API_KEY,
    url: process.env.DING_URL,
    customerUUID: process.env.DING_CUSTOMER_UUID,
    bypass: process.env.SMS_OTP_BYPASS === "true",
    otpCodeBypass: process.env.SMS_CODE_OTP_BYPASS,
};

export const dataSourceConfig: PostgresConnectionOptions = process.env.DATABASE_URL
    ? {
          type: "postgres",
          url: process.env.DATABASE_URL,
          ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
          synchronize: true,
          logging: process.env.DB_LOGGING === "true",
          entities: ["dist/app/modules/**/*.entity.js"],
          migrations: ["dist/migrations/*.js"],
      }
    : {
          type: "postgres",
          host: process.env.DB_HOST,
          port: +process.env.DB_PORT,
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          logging: process.env.DB_LOGGING === "true",
          synchronize: true,
          entities: ["dist/app/modules/**/*.entity.js"],
          migrations: ["dist/migrations/*.js"],
      };

const base64EncodedFirebaseConfig = process.env.FIREBASE_CONFIG;
if (!base64EncodedFirebaseConfig) {
    throw new Error(
        'La variable d\'environnement "FIREBASE_CONFIG" est requise.'
    );
}
const firebaseConfigJson = Buffer.from(
    base64EncodedFirebaseConfig,
    "base64"
).toString("ascii");
const firebaseConfig = JSON.parse(firebaseConfigJson);
export const firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
});
export const firebaseStorage = {storage: getStorage(firebaseAdmin), bucketName: process.env.FIREBASE_STORAGE_BUCKET};

export const contentCount = +process.env.CONTENT_COUNT;

// export const redis_config = {
//     port: process.env.REDIS_PORT ? +process.env.REDIS_PORT : 6379,
//     host: process.env.REDIS_HOST ? process.env.REDIS_HOST : "localhost",
//     password: process.env.REDIS_PASSWORD,
//     username: process.env.REDIS_USERNAME,
// };

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export interface SendgridConfig {
    sgMail: typeof sgMail;
    from: string;
    bypass: boolean;
}

export const sendgridConfig: SendgridConfig = {
    sgMail,
    from: process.env.SENDGRID_EMAIL_FROM,
    bypass: process.env.SENDGRID_BYPASS === "true",
};


export const appleConfig: AppleAuthConfig = {
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY,
    keyIdentifier: process.env.APPLE_KEY_IDENTIFIER,
    redirectUri: process.env.BACKEND_URL + '/api/user/auth/apple/callback',
};
export const googleConfig =
    {
        oAuth2ClientHandle: new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "postmessage"
        ),

        oAuth2ClientVerify: new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URL
        ),

        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }


export type VideoSdkConfig = {
    baseUrl: string;
    secret: string;
    apiKey: string;
    webhookUrl: string;
}
export const videoSdkConfig: VideoSdkConfig = {
    apiKey: process.env.VIDEOSDK_API_KEY,
    secret: process.env.VIDEOSDK_SECRET_KEY,
    baseUrl: process.env.VIDEOSDK_BASE_URL,
    webhookUrl: process.env.VIDEOSDK_WEBHOOK_API
}

export async function initializeAndroidPublisher() {
    const keyfileContents = Buffer.from(process.env.GOOGLE_IAP_CREDENTIALS_BASE64, 'base64').toString('utf8');
    const client = new google.auth.GoogleAuth({
        credentials: JSON.parse(keyfileContents),
        scopes: ['https://www.googleapis.com/auth/androidpublisher']
    });

    const auth = await client.getClient();
    return new androidpublisher_v3.Androidpublisher({auth: client});
}
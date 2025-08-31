import "reflect-metadata";
import {Application, Request, Response} from "express";
import {useExpressServer, useContainer} from "routing-controllers";
import {AppDependencies} from "./AppDependencies";
import {UserController} from "../modules/authentication/UserController";
import {CommonController} from "../modules/common/CommonController";
import {LiveController} from "../modules/live/LiveController";
import {GroupController} from "../modules/group/GroupController";
import {RoleController} from "../modules/role/RoleController";
import {UserGroupRoleController} from "../modules/userGroupRole/UserGroupRoleController";
import {FeedController} from "../modules/feed/FeedController";
import {StreamController} from "../modules/stream/StreamController";
import {ConversationController} from "../modules/conversation/ConversationController";
import {LiveAdminController} from "../modules/live/LiveAdminController";
import {ConversationGroupController} from "../modules/conversationGroup/ConversationGroupController";
import {ResourcesController} from "../modules/resources/ResourcesController";
import {RecordController} from "../modules/record/RecordController";
import {ModuleController} from "../modules/module/ModuleController";
import {NotifyLiveWillStart30} from "../crons/NotifyLiveWillStart30";
import {SyncLiveRecording60} from "../crons/SyncLiveRecording60";
import {ResourcesAdminController} from "../modules/resources/ResourcesAdminController";
import {IapController} from "../modules/iap/IapController";
import morgan from 'morgan'
import bodyParser from "body-parser";
import {CheckSubscription} from "../crons/CheckSubscription";
import {TestNotificationController} from "../modules/notifications/TestNotificationController";
import {BadgeController} from "../modules/badge/BadgeController";
import {StripeController} from "../modules/stripe/StripeController";

export async function configureExpress(app: Application) {

    // Configuration spéciale pour les webhooks Stripe (body en raw)
    // IMPORTANT: doit être AVANT le middleware JSON global
    app.use('/api/stripe/webhook', bodyParser.raw({ 
        type: 'application/json',
        verify: function (req: Request, res: Response, buf: Buffer) {
            // Stocker le raw body pour Stripe
            req["rawBody"] = buf;
        }
    }));

    app.use(
        bodyParser.json({
            limit: "500kb",
            verify: function (req: Request, res: Response, buf: Buffer) {
                const url = req.originalUrl;
                if (url === `/`) {
                    req["rawBody"] = buf.toString();
                }
            },
        })
    );
    morgan.token('content-type', (req, res) => req.headers['content-type']);

    app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :content-type'));

    const routes = [
        UserController,
        CommonController,
        LiveController,
        GroupController,
        RoleController,
        UserGroupRoleController,
        FeedController,
        StreamController,
        LiveAdminController,
        ConversationController,
        ConversationGroupController,
        ResourcesController,
        RecordController,
        ModuleController,
        ResourcesAdminController,
        IapController,
        TestNotificationController,
        BadgeController,
        StripeController
    ];

    const container = await new AppDependencies().init();
    useContainer(container);
    await NotifyLiveWillStart30(container);
    await SyncLiveRecording60(container);
    await CheckSubscription(container);

    useExpressServer(app, {
        routePrefix: "api",
        controllers: routes,
    });
    return container;
}

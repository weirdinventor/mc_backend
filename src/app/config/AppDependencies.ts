import "reflect-metadata";
import dotenv from "dotenv";
import {Container} from "inversify";
import {JwtIdentityGateway} from "../../adapters/gateways/jwt/JwtIdentityGateway";
import {BcryptPasswordGateway} from "../../adapters/gateways/bcrypt/BcryptPasswordGateway";
import {Identifiers} from "../../core/Identifiers";
import {AuthenticationMiddleware} from "../middlewares/AuthenticationMiddleware";
import {
    appleConfig,
    dataSourceConfig,
    dingConfiguration,
    firebaseAdmin,
    firebaseStorage,
    googleConfig,
    initializeAndroidPublisher,
    jwtConfig,
    // redis_config,
    sendgridConfig,
    videoSdkConfig,
} from "./config";
import {DingSmsGateway} from "../../adapters/gateways/sms/DingSmsGateway";
import {DataSource} from "typeorm";
import {UserEntity} from "../../adapters/repositories/entities/UserEntity";
import {EventProvider, MessageModule} from "./MessageModule";
import {Redis} from "ioredis";
import {UserController} from "../modules/authentication/UserController";
import {Signup} from "../../core/write/usecases/authentication/Signup";
import {PostgresUserRepository} from "../../adapters/repositories/user/PostgresUserRepository";
import {EventManager} from "../../messages/utilsAndConfugrations/eventsConfig/EventManager";
import {SignIn} from "../../core/write/usecases/authentication/SignIn";
import {CreateProfile} from "../../core/write/usecases/user/CreateProfile";
import {PostgresProfileRepository} from "../../adapters/repositories/user/PostgresProfileRepository";
import {ProfileEntity} from "../../adapters/repositories/entities/ProfileEntity";
import {ActivateUser} from "../../core/write/usecases/authentication/ActivateUser";
import {SendAccountActivationEmail} from "../../core/write/usecases/notification/SendAccountActivationEmail";
import {SaveRecipient} from "../../core/write/usecases/notification/SaveRecipient";
import {PostgresRecipientRepository} from "../../adapters/repositories/user/PostgresRecipientRepository";
import {SendgridEmailGateway} from "../../adapters/gateways/sendgrid/SendgridEmailGateway";
import {RecipientEntity} from "../../adapters/repositories/entities/RecipientEntity";
import {CommonController} from "../modules/common/CommonController";
import {HandlersModule} from "../modules/handlers/HandlersModule";
import {PostgresLiveRepository} from "../../adapters/repositories/live/PostgresLiveRepository";
import {LiveEntity} from "../../adapters/repositories/entities/LiveEntity";
import {NotificationEntity} from "../../adapters/repositories/entities/NotificationEntity";
import {LiveController} from "../modules/live/LiveController";
import {CreateLive} from "../../core/write/usecases/live/CreateLive";
import {GetLiveById} from "../../core/write/usecases/live/GetLiveById";
import {UpdateLive} from "../../core/write/usecases/live/UpdateLive";
import {DeleteLive} from "../../core/write/usecases/live/DeleteLive";
import {CancelLive} from "../../core/write/usecases/live/CancelLive";
import {PublishLive} from "../../core/write/usecases/live/PublishLive";
import {GetUserOwnedGroups} from "../../core/write/usecases/group/GetUserOwnedGroups";
import {GroupController} from "../modules/group/GroupController";
import {GroupEntity} from "../../adapters/repositories/entities/GroupEntity";
import {UserGroupRoleEntity} from "../../adapters/repositories/entities/UserGroupRoleEntity";
import {PostgresGroupRepository} from "../../adapters/repositories/group/PostgresGroupRepository";
import {RoleEntity} from "../../adapters/repositories/entities/RoleEntity";
import {CreateGroup} from "../../core/write/usecases/group/CreateGroup";
import {UpdateGroup} from "../../core/write/usecases/group/UpdateGroup";
import {AddNewMember} from "../../core/write/usecases/group/AddNewMemeber";
import {GetUserJoinedGroups} from "../../core/write/usecases/group/GetUserJoinedGroups";
import {RoleController} from "../modules/role/RoleController";
import {CreateRole} from "../../core/write/usecases/role/CreateRole";
import {PostgresRoleRepository} from "../../adapters/repositories/role/PostgresRoleRepository";
import {DeleteRole} from "../../core/write/usecases/role/DeleteRole";
import {DeleteGroup} from "../../core/write/usecases/group/DeleteGroup";
import {UpdateRole} from "../../core/write/usecases/role/UpdateRole";
import {
    PostgresUserGroupRoleRepository
} from "../../adapters/repositories/userGroupRole/PostgresUserGroupRoleRepository";
import {AssignRoleToUser} from "../../core/write/usecases/userGroupRole/AssignRoleToUser";
import {UserGroupRoleController} from "../modules/userGroupRole/UserGroupRoleController";
import {SearchGroup} from "../../core/write/usecases/group/SearchGroup";
import {SignUpGoogleUser} from "../../core/write/usecases/google/SignUpGoogleUser";
import {SignInGoogleUser} from "../../core/write/usecases/google/SignInGoogleUser";
import {SignInAppleUser} from "../../core/write/usecases/apple/SignInAppleUser";
import {GoogleAuthenticationGateway} from "../../adapters/gateways/google/GoogleAuthenticationGateway";
import {AppleAuthGateway} from "../../adapters/gateways/apple/AppleAuthGateway";
import {FirebasePushNotificationGateway} from "../../adapters/gateways/firebase/FirebasePushNotificationGateway";
import {FirebaseStorageGateway} from "../../adapters/gateways/firebase/FirebaseStorageGateway";
import {GeneratePreSignedUrl} from "../../core/write/usecases/user/GeneratePreSignedUrl";
import {AddProfilePicture} from "../../core/write/usecases/user/AddProfilePicture";
import {
    PersonalInformationReadModelRepository
} from "../../adapters/repositories/user/PostgresPersonalInformationReadModelRepository";
import {GetPersonalInformation} from "../../core/read/queries/users/GetPersonalInformation";
import {EnrollDevice} from "../../core/write/usecases/notification/EnrollDevice";
import {PostgresDeviceRepository} from "../../adapters/repositories/user/PostgresDeviceRepository";
import {DeviceEntity} from "../../adapters/repositories/entities/DeviceEntity";
import {IsUsernameTaken} from "../../core/write/usecases/user/IsUsernameTaken";
import {IsEmailTaken} from "../../core/write/usecases/user/IsEmailTaken";
import {ConversationEntity} from "../../adapters/repositories/entities/ConversationEntity";
import {CreateConversation} from "../../core/write/usecases/conversation/CreateConversation";
import {PostgresConversationRepository} from "../../adapters/repositories/conversation/PostgresConversationRepository";
import {ConversationController} from "../modules/conversation/ConversationController";
import {FirebaseCustomTokenGateway} from "../../adapters/gateways/firebase/FirebaseCustomTokenGateway";
import {
    FirebaseInitiateConversationGateway
} from "../../adapters/gateways/firebase/FirebaseInitiateConversationGateway";
import {SignUpAppleUser} from "../../core/write/usecases/apple/SignUpAppleUser";
import {PostEntity} from "../../adapters/repositories/entities/PostEntity";
import {FeedController} from "../modules/feed/FeedController";
import {CreatePost} from "../../core/write/usecases/feed/CreatePost";
import {PostgresPostRepository} from "../../adapters/repositories/feed/PostgresPostRepository";
import {UpdatePost} from "../../core/write/usecases/feed/UpdatePost";
import {DeletePost} from "../../core/write/usecases/feed/DeletePost";
import {VideosSdkGateway} from "../../adapters/gateways/videoSdk/VideosSdkgateway";
import {
    PostgresGetUserByIdReadModelRepository
} from "../../adapters/repositories/user/PostgresGetUserByIdReadModelRepository";
import {GetUserById} from "../../core/read/queries/users/GetUserById";
import {MarkAsOngoing} from "../../core/write/usecases/live/MarkAsOngoing";
import {PostgresPostReadModelRepository} from "../../adapters/repositories/feed/PostgresPostReadModelRepository";
import {GetPosts} from "../../core/read/queries/posts/GetPosts";
import {GetPostById} from "../../core/read/queries/posts/GetPostById";
import {UpdateUsername} from "../../core/write/usecases/user/UpdateUsername";
import {SendEmail} from "../../core/write/usecases/notification/SendEmail";
import {GenerateRecoveryCode} from "../../core/write/usecases/user/GenerateRecoveryCode";
import {ResetPassword} from "../../core/write/usecases/user/ResetPassword";
import {ChangePassword} from "../../core/write/usecases/user/ChangePassword";
import {StartHlsStream} from "../../core/write/usecases/videoSdk/StartHlsStream";
import {StopHlsStream} from "../../core/write/usecases/videoSdk/StopHlsStream";
import {StreamController} from "../modules/stream/StreamController";
import {PostgresLiveCategoryRepository} from "../../adapters/repositories/liveCategory/PostgresLiveCategoryRepository";
import {CreateLiveCategory} from "../../core/write/usecases/liveCategory/CreateLiveCategory";
import {LiveCategoryEntity} from "../../adapters/repositories/entities/LiveCategoryEntity";
import {GetLiveCategories} from "../../core/write/usecases/liveCategory/GetLiveCategories";
import {DeleteLiveCategory} from "../../core/write/usecases/liveCategory/DeleteLiveCategory";
import {UpdateLiveCategory} from "../../core/write/usecases/liveCategory/UpdateLiveCategory";
import {JoinHlsStream} from "../../core/write/usecases/videoSdk/JoinHlsStream";
import {LiveAdminController} from "../modules/live/LiveAdminController";
import {GetLivesByStatusAndDate} from "../../core/write/usecases/live/GetLivesByStatusAndDate";
import {PostgresLiveReadModelRepository} from "../../adapters/repositories/live/PostgresLiveReadModelRepository";
import {GetLives} from "../../core/read/queries/lives/GetLives";
import {GetLivesByTimeframe} from "../../core/read/queries/lives/GetLivesByTimeframe";
import {AddUserInterestToLive} from "../../core/write/usecases/live/AddUserInterestToLive";
import {RemoveUserInterestFromLive} from "../../core/write/usecases/live/RemoveUserInterestFromLive";
import {GetNumberOfParticipants} from "../../core/write/usecases/videoSdk/GetNumberOfParticipants";
import {SearchUser} from "../../core/read/queries/users/SearchUser";
import {
    PostgresSearchUserReadModelRepository
} from "../../adapters/repositories/user/PostgresSearchUserReadModelRepository";
import {FirebaseConversationGroupGateway} from "../../adapters/gateways/firebase/FirebaseConversationGroupGateway";
import {PostgresGroupReadModelRepository} from "../../adapters/repositories/group/PostgresGroupReadModelRepository";
import {GetGroupMembers} from "../../core/read/queries/group/GetGroupMembers";
import {GetConversations} from "../../core/read/queries/conversations/GetConversations";
import {
    PostgresConversationReadModelRepository
} from "../../adapters/repositories/conversation/PostgresConversationReadModelRepository";
import {SendMessage} from "../../core/write/usecases/firebase/SendMessage";
import {FirebaseConversationGateway} from "../../adapters/gateways/firebase/FirebaseConversationGateway";
import {GetGroups} from "../../core/write/usecases/group/GetGroups";
import {GetGroupById} from "../../core/write/usecases/group/GetGroupById";
import {IsConversationExist} from "../../core/write/usecases/conversation/IsConversationExist";
import {DeleteConversation} from "../../core/write/usecases/conversation/DeleteConversation";
import {SendGroupMessage} from "../../core/write/usecases/firebase/SendGroupMessage";
import {ConversationGroupController} from "../modules/conversationGroup/ConversationGroupController";
import {GenerateFirebaseToken} from "../../core/write/usecases/firebase/GenerateFirebaseToken";
import {PostgresResourceRepository} from "../../adapters/repositories/resource/PostgresResourceRepository";
import {ResourcesController} from "../modules/resources/ResourcesController";
import {CreateResource} from "../../core/write/usecases/resource/CreateResource";
import {ResourceEntity} from "../../adapters/repositories/entities/ResourceEntity";
import {
    PostgresResourceReadModelRepository
} from "../../adapters/repositories/resource/PostgresResourceReadModelRepository";
import {GetGroupResources} from "../../core/read/queries/resource/GetGroupResources";
import {GetGroupResourceById} from "../../core/read/queries/resource/GetGroupResourceById";
import {UpdateResource} from "../../core/write/usecases/resource/UpdateResource";
import {DeleteResource} from "../../core/write/usecases/resource/DeleteResource";
import {MembershipsEntity} from "../../adapters/repositories/entities/MembershipsEntity";
import {RecordEntity} from "../../adapters/repositories/entities/RecordEntity";
import {PostgresRecordRepository} from "../../adapters/repositories/record/PostgresRecordRepository";
import {CreateRecord} from "../../core/write/usecases/record/CreateRecord";
import {SaveRecord} from "../../core/write/usecases/live/SaveRecord";
import {GetLiveRecords} from "../../core/write/usecases/live/GetLiveRecords";
import {UpdateRecord} from "../../core/write/usecases/record/UpdateRecord";
import {RecordController} from "../modules/record/RecordController";
import {JoinVoiceRoom} from "../../core/write/usecases/videoSdk/JoinVoiceRoom";
import {GetAllRecords} from "../../core/write/usecases/record/GetAllRecords";
import {GetPublishedRecords} from "../../core/read/queries/record/GetPublishedRecords";
import {PostgresRecordReadModelRepository} from "../../adapters/repositories/record/PostgresRecordReadModelRepository";
import {GetRecordById} from "../../core/read/queries/record/GetRecordById";
import {ModuleController} from "../modules/module/ModuleController";
import {GetModuleById} from "../../core/write/usecases/modules/GetModuleById";
import {DeleteAccount} from "../../core/write/usecases/user/DeleteAccount";
import {GetGroupLives} from "../../core/write/usecases/group/GetGroupLives";
import {GetModuleLives} from "../../core/write/usecases/modules/GetModuleLives";
import {ModulePurchaseEntity} from "../../adapters/repositories/entities/ModulePurchaseEntity";
import {
    PostgresModulePurchaseRepository
} from "../../adapters/repositories/modulePurchase/PostgresModulePurchaseRepository";
import {CreatePurchase} from "../../core/write/usecases/modulePurchase/CreatePurchase";
import {AdminGetResources} from "../../core/read/queries/resource/AdminGetResources";
import {AdminGetResourceById} from "../../core/read/queries/resource/AdminGetResourceById";
import {ResourcesAdminController} from "../modules/resources/ResourcesAdminController";
import {MoulaClubIAPPurchaseGateway} from "../../adapters/gateways/inAppPurchase/MoulaClubIAPPurchaseGateway";
import {IapController} from "../modules/iap/IapController";
import {ProcessReceipt} from "../../core/write/usecases/iap/ProcessReceipt";
import {GetAllUsers} from "../../core/read/queries/users/GetAllUsers";
import {BlockUser} from "../../core/write/usecases/user/BlockUser";
import {SubscriptionEntity} from "../../adapters/repositories/entities/SubscriptionEntity";
import {HandleSubscription} from "../../core/write/usecases/iap/HandleSubscription";
import {PostgresSubscriptionRepository} from "../../adapters/repositories/subscriptions/PostgresSubscriptionRepository";
import {ActivateAccount} from "../../core/write/usecases/user/ActivateAccount";
import {TestNotificationController} from "../modules/notifications/TestNotificationController";
import {ReactionEntity} from "../../adapters/repositories/entities/ReactionEntity";
import {AddReaction} from "../../core/write/usecases/feed/AddReaction";
import {GradeEntity} from "../../adapters/repositories/entities/GradeEntity";
import {UserBadgesEntity} from "../../adapters/repositories/entities/UserBadgesEntity";
import {UserModuleProgressEntity} from "../../adapters/repositories/entities/UserModuleProgressEntity";
import {BadgeEntity} from "../../adapters/repositories/entities/BadgeEntity";
import {PostgresGradeRepository} from "../../adapters/repositories/grade/PostgresGradeRepository";
import {PostgresUserModuleProgressRepository} from "../../adapters/repositories/userModuleProgress/PostgresUserModuleProgressRepository";
import {PostgresBadgeRepository} from "../../adapters/repositories/badge/PostgresBadgeRepository";
import {UserBadgesRepository} from "../../adapters/repositories/userBadge/PostgresUserBadgesRepository";
import {GamificationService} from "../../adapters/services/GamificationService";
import {BadgeController} from "../modules/badge/BadgeController";
import {AssignBadgeToUser} from "../../core/write/usecases/badge/AssignBadgeToUser";
import {RemoveBadgeFromUser} from "../../core/write/usecases/badge/RemoveBadgeFromUser";
import {DeleteBadge} from "../../core/write/usecases/badge/DeleteBadge";
import {GetUserBadges} from "../../core/read/queries/badges/GetUserBadges";
import {GetAllBadges} from "../../core/read/queries/badges/GetAllBadges";
import {CreateBadge} from "../../core/write/usecases/badge/CreateBadge";

// Stripe imports
import {StripeController} from "../modules/stripe/StripeController";
import {CreateStripeSubscription} from "../../core/write/usecases/stripe/CreateStripeSubscription";
import {CreateStripePaymentIntent} from "../../core/write/usecases/stripe/CreateStripePaymentIntent";
import {HandleStripeWebhook} from "../../core/write/usecases/stripe/HandleStripeWebhook";
import {CancelStripeSubscription} from "../../core/write/usecases/stripe/CancelStripeSubscription";
import {GetStripeSubscription} from "../../core/write/usecases/stripe/GetStripeSubscription";
import {StripePaymentGateway} from "../../adapters/gateways/stripe/StripePaymentGateway";
import {StripeService} from "../../adapters/services/StripeService";
import {PostgresStripeCustomerRepository} from "../../adapters/repositories/stripe/PostgresStripeCustomerRepository";
import {PostgresStripeSubscriptionRepository} from "../../adapters/repositories/stripe/PostgresStripeSubscriptionRepository";
import {StripeCustomerEntity} from "../../adapters/repositories/entities/StripeCustomerEntity";
import {StripeSubscriptionEntity} from "../../adapters/repositories/entities/StripeSubscriptionEntity";

dotenv.config();

export class AppDependencies extends Container {
    async init() {
        const messageModule = new MessageModule(this);
        // const redis = new Redis(redis_config.port, redis_config.host);

        const myDataSource = new DataSource({
            ...dataSourceConfig,
            entities: [
                UserEntity,
                ProfileEntity,
                RecipientEntity,
                LiveEntity,
                NotificationEntity,
                GroupEntity,
                RoleEntity,
                UserGroupRoleEntity,
                DeviceEntity,
                ConversationEntity,
                PostEntity,
                LiveCategoryEntity,
                ResourceEntity,
                MembershipsEntity,
                RecordEntity,
                ModulePurchaseEntity,
                SubscriptionEntity,
                ReactionEntity,
                GradeEntity,
                UserBadgesEntity,
                UserModuleProgressEntity,
                BadgeEntity,
                StripeCustomerEntity,
                StripeSubscriptionEntity,
            ],
        });

        const connection = await Promise.resolve(myDataSource.initialize());

        this.bind(Identifiers.entityManager).toConstantValue(connection.manager);
        this.bind(Identifiers.smsGateway).toConstantValue(
            new DingSmsGateway(dingConfiguration)
        );
        this.bind(Identifiers.identityGateway).toConstantValue(
            new JwtIdentityGateway(jwtConfig.secret, jwtConfig.config)
        );
        this.bind(Identifiers.passwordGateway).toConstantValue(
            new BcryptPasswordGateway()
        );
        this.bind(Identifiers.userRepository).toConstantValue(
            new PostgresUserRepository(myDataSource.manager)
        );
        this.bind(Identifiers.personalInformationReadModelRepository).toConstantValue(
            new PersonalInformationReadModelRepository(myDataSource.manager)
        );

        this.bind(Identifiers.getUserByIdReadModelRepository).toConstantValue(
            new PostgresGetUserByIdReadModelRepository(myDataSource.manager)
        );

        this.bind(Identifiers.getPostsReadModelRepository).toConstantValue(
            new PostgresPostReadModelRepository(myDataSource.manager)
        )

        this.bind(Identifiers.livesReadModelRepository).toConstantValue(
            new PostgresLiveReadModelRepository(myDataSource.manager)
        )

        this.bind(Identifiers.groupReadModelRepository).toConstantValue(
            new PostgresGroupReadModelRepository(myDataSource.manager)
        )

        this.bind(Identifiers.searchUserReadModelRepository).toConstantValue(
            new PostgresSearchUserReadModelRepository(myDataSource.manager)
        )

        this.bind(Identifiers.conversationReadModelRepository).toConstantValue(
            new PostgresConversationReadModelRepository(myDataSource.manager)
        )

        this.bind(Identifiers.deviceRepository).toConstantValue(
            new PostgresDeviceRepository(myDataSource.manager)
        );
        this.bind(Identifiers.profileRepository).toConstantValue(
            new PostgresProfileRepository(myDataSource.manager)
        );
        this.bind(Identifiers.recipientRepository).toConstantValue(
            new PostgresRecipientRepository(myDataSource.manager)
        );
        this.bind(Identifiers.liveRepository).toConstantValue(
            new PostgresLiveRepository(myDataSource.manager)
        );
        this.bind(Identifiers.subscriptionRepository).toConstantValue(
            new PostgresSubscriptionRepository(myDataSource.manager)
        );
        this.bind(Identifiers.emailGateway).toConstantValue(
            new SendgridEmailGateway(sendgridConfig)
        );

        this.bind(Identifiers.appleAuthGateway).toConstantValue(new AppleAuthGateway(appleConfig))
        this.bind(Identifiers.googleAuthGateway).toConstantValue(new GoogleAuthenticationGateway(
            googleConfig.oAuth2ClientHandle,
            googleConfig.oAuth2ClientVerify,
            googleConfig.clientId,
            googleConfig.clientSecret))
        this.bind(Identifiers.pushNotificationGateway).toConstantValue(new FirebasePushNotificationGateway(firebaseAdmin));
        this.bind(Identifiers.storageGateway).toConstantValue(new FirebaseStorageGateway(firebaseStorage));
        this.bind(Identifiers.customTokenGateway).toConstantValue(new FirebaseCustomTokenGateway(firebaseAdmin));
        this.bind(Identifiers.initiateConversationGateway).toConstantValue((new FirebaseInitiateConversationGateway(firebaseAdmin)));
        this.bind(Identifiers.conversationGroupGateway).toConstantValue(new FirebaseConversationGroupGateway(firebaseAdmin));
        this.bind(Identifiers.conversationGateway).toConstantValue(new FirebaseConversationGateway(firebaseAdmin));
        // this.bind(Identifiers.iapPurchaseGateway).toConstantValue(new MoulaClubIAPPurchaseGateway({
        //     google: await initializeAndroidPublisher()
        // }))
        this.bind(Identifiers.streamingGateway).toConstantValue(
            new VideosSdkGateway(videoSdkConfig, myDataSource.manager)
        );

        // Gamification repositories
        this.bind(Identifiers.gradeRepository).toConstantValue(
            new PostgresGradeRepository(myDataSource.manager)
        );
        this.bind(Identifiers.userModuleProgressRepository).toConstantValue(
            new PostgresUserModuleProgressRepository(myDataSource.manager)
        );
        this.bind(Identifiers.badgeRepository).toConstantValue(
            new PostgresBadgeRepository(myDataSource.manager)
        );
        this.bind(Identifiers.userBadgesRepository).toConstantValue(
            new UserBadgesRepository(myDataSource.manager)
        );

        // Gamification service
        this.bind(Identifiers.gamificationService).toConstantValue(
            new GamificationService(
                this.get(Identifiers.userRepository),
                this.get(Identifiers.gradeRepository),
                this.get(Identifiers.userModuleProgressRepository),
                this.get(Identifiers.badgeRepository),
                this.get(Identifiers.userBadgesRepository)
            )
        );

        // Group identifier
        this.bind(Identifiers.groupRepository).toConstantValue(
            new PostgresGroupRepository(myDataSource.manager)
        );

        // Role identifier
        this.bind(Identifiers.roleRepository).toConstantValue(
            new PostgresRoleRepository(myDataSource.manager)
        );

        // UserGroupRole identifier
        this.bind(Identifiers.userGroupRoleRepository).toConstantValue(
            new PostgresUserGroupRoleRepository(myDataSource.manager)
        );

        // Feed identifier
        this.bind(Identifiers.feedRepository).toConstantValue(
            new PostgresPostRepository(myDataSource.manager)
        )

        // Live category identifier
        this.bind(Identifiers.liveCategoryRepository).toConstantValue(
            new PostgresLiveCategoryRepository(myDataSource.manager)
        )
        // Conversation identifier
        this.bind(Identifiers.conversationRepository).toConstantValue(
            new PostgresConversationRepository(myDataSource.manager)
        );

        // Resource identifier
        this.bind(Identifiers.resourceRepository).toConstantValue(
            new PostgresResourceRepository(myDataSource.manager)
        );

        this.bind(Identifiers.resourceReadModelRepository).toConstantValue(
            new PostgresResourceReadModelRepository(myDataSource.manager)
        );

        // Record identifier

        this.bind(Identifiers.recordRepository).toConstantValue(
            new PostgresRecordRepository(myDataSource.manager)
        )

        this.bind(Identifiers.recordReadModelRepository).toConstantValue(
            new PostgresRecordReadModelRepository(myDataSource.manager)
        )

        this.bind(Identifiers.modulePurchaseRepository).toConstantValue(
            new PostgresModulePurchaseRepository(myDataSource.manager)
        )

        this.bind(Identifiers.stripeService).toConstantValue(new StripeService());
        this.bind(Identifiers.stripePaymentGateway).toConstantValue(new StripePaymentGateway(this.get(Identifiers.stripeService)));
        this.bind(Identifiers.stripeCustomerRepository).toConstantValue(new PostgresStripeCustomerRepository(myDataSource.manager));
        this.bind(Identifiers.stripeSubscriptionRepository).toConstantValue(new PostgresStripeSubscriptionRepository(myDataSource.manager));

        this.bind(AuthenticationMiddleware).toSelf();
        this.bind(UserController).toSelf();
        this.bind(CommonController).toSelf();
        this.bind(IapController).toSelf();
        this.bind(Signup).toSelf();
        this.bind(SignIn).toSelf();
        this.bind(CreateProfile).toSelf();
        this.bind(ActivateUser).toSelf();
        this.bind(SendAccountActivationEmail).toSelf();
        this.bind(SaveRecipient).toSelf();
        this.bind(SignUpAppleUser).toSelf()
        this.bind(SignInAppleUser).toSelf()
        this.bind(SignInGoogleUser).toSelf()
        this.bind(SignUpGoogleUser).toSelf()
        this.bind(GeneratePreSignedUrl).toSelf()
        this.bind(AddProfilePicture).toSelf()
        this.bind(GetPersonalInformation).toSelf();
        this.bind(EnrollDevice).toSelf()
        this.bind(IsUsernameTaken).toSelf()
        this.bind(IsEmailTaken).toSelf()
        this.bind(GetUserById).toSelf()
        this.bind(UpdateUsername).toSelf();
        this.bind(ResetPassword).toSelf();
        this.bind(GenerateRecoveryCode).toSelf();
        this.bind(SendEmail).toSelf()
        this.bind(ChangePassword).toSelf();
        this.bind(SearchUser).toSelf();
        this.bind(DeleteAccount).toSelf();
        this.bind(ProcessReceipt).toSelf();
        this.bind(GetAllUsers).toSelf();
        this.bind(BlockUser).toSelf();
        this.bind(ActivateAccount).toSelf();
        this.bind(HandleSubscription).toSelf();
        this.bind(TestNotificationController).toSelf();


        // Live bindings
        this.bind(LiveController).toSelf();
        this.bind(GetLives).toSelf();
        this.bind(LiveAdminController).toSelf();
        this.bind(GetLiveById).toSelf();
        this.bind(CreateLive).toSelf();
        this.bind(UpdateLive).toSelf();
        this.bind(DeleteLive).toSelf();
        this.bind(CancelLive).toSelf();
        this.bind(PublishLive).toSelf();
        this.bind(GetLivesByTimeframe).toSelf();
        this.bind(MarkAsOngoing).toSelf()
        this.bind(CreateLiveCategory).toSelf()
        this.bind(GetLiveCategories).toSelf()
        this.bind(DeleteLiveCategory).toSelf()
        this.bind(UpdateLiveCategory).toSelf()
        this.bind(GetLivesByStatusAndDate).toSelf()
        this.bind(AddUserInterestToLive).toSelf()
        this.bind(RemoveUserInterestFromLive).toSelf()
        this.bind(SaveRecord).toSelf();

        // Firebase bindings
        this.bind(GenerateFirebaseToken).toSelf();

        // Group bindings
        this.bind(GroupController).toSelf();
        this.bind(ModuleController).toSelf();
        this.bind(GetGroups).toSelf();
        this.bind(GetGroupById).toSelf();
        this.bind(SearchGroup).toSelf();
        this.bind(GetUserOwnedGroups).toSelf();
        this.bind(GetUserJoinedGroups).toSelf();
        this.bind(GetGroupMembers).toSelf();
        this.bind(CreateGroup).toSelf();
        this.bind(UpdateGroup).toSelf();
        this.bind(AddNewMember).toSelf();
        this.bind(DeleteGroup).toSelf();
        this.bind(GetModuleById).toSelf();
        this.bind(GetGroupLives).toSelf();
        this.bind(GetModuleLives).toSelf();

        // Role bindings
        this.bind(RoleController).toSelf();
        this.bind(CreateRole).toSelf();
        this.bind(DeleteRole).toSelf();
        this.bind(UpdateRole).toSelf();

        // UserGroupRole bindings
        this.bind(UserGroupRoleController).toSelf();
        this.bind(AssignRoleToUser).toSelf();

        // Conversation bindings
        this.bind(ConversationController).toSelf();
        this.bind(CreateConversation).toSelf();
        this.bind(GetConversations).toSelf();
        this.bind(SendMessage).toSelf();
        this.bind(IsConversationExist).toSelf();
        this.bind(DeleteConversation).toSelf()

        // Conversation group bindings
        this.bind(ConversationGroupController).toSelf();
        this.bind(SendGroupMessage).toSelf();

        // Feed bindings (Posts)
        this.bind(FeedController).toSelf()
        this.bind(CreatePost).toSelf()
        this.bind(GetPosts).toSelf()
        this.bind(GetPostById).toSelf()
        this.bind(UpdatePost).toSelf()
        this.bind(DeletePost).toSelf()
        this.bind(AddReaction).toSelf()

        // Badge bindings
        this.bind(BadgeController).toSelf();
        this.bind(CreateBadge).toSelf()
        this.bind(AssignBadgeToUser).toSelf()
        this.bind(RemoveBadgeFromUser).toSelf()
        this.bind(DeleteBadge).toSelf()
        this.bind(GetUserBadges).toSelf()
        this.bind(GetAllBadges).toSelf()

        // Stripe bindings
        this.bind(StripeController).toSelf();
        this.bind(CreateStripeSubscription).toSelf();
        this.bind(CreateStripePaymentIntent).toSelf();
        this.bind(HandleStripeWebhook).toSelf();
        this.bind(CancelStripeSubscription).toSelf();
        this.bind(GetStripeSubscription).toSelf();

        // Stream bindings
        this.bind(StreamController).toSelf();
        this.bind(StartHlsStream).toSelf();
        this.bind(StopHlsStream).toSelf();
        this.bind(JoinHlsStream).toSelf();
        this.bind(JoinVoiceRoom).toSelf();
        this.bind(GetNumberOfParticipants).toSelf();

        // Group resources bindings
        this.bind(ResourcesController).toSelf();
        this.bind(ResourcesAdminController).toSelf();
        this.bind(CreateResource).toSelf();
        this.bind(GetGroupResources).toSelf();
        this.bind(GetGroupResourceById).toSelf();
        this.bind(UpdateResource).toSelf();
        this.bind(DeleteResource).toSelf();
        this.bind(AdminGetResources).toSelf();
        this.bind(AdminGetResourceById).toSelf();
        // Record bindings
        this.bind(RecordController).toSelf();
        this.bind(GetLiveRecords).toSelf();
        this.bind(CreateRecord).toSelf();
        this.bind(UpdateRecord).toSelf();
        this.bind(GetPublishedRecords).toSelf();
        this.bind(GetAllRecords).toSelf();
        this.bind(GetRecordById).toSelf();

        this.bind(CreatePurchase).toSelf();

        // messageModule.configure({
        //     provider: {
        //         name: EventProvider.REDIS,
        //         redis,
        //     },
        // });

        await messageModule.register((em: EventManager) => {
            HandlersModule.configureHandlers(em);
        });

        return this;
    }
}

import {ResourceReadModelRepository} from "./read/repositories/ResourceReadModelRepository";

export class Identifiers {
    static readonly entityManager = Symbol.for('entityManager')
    static readonly userRepository = Symbol.for("userRepository");
    static readonly liveRepository = Symbol.for("liveRepository");
    static readonly identityGateway = Symbol.for("identityGateway");
    static readonly passwordGateway = Symbol.for("passwordGateway");
    static readonly smsGateway = Symbol.for("smsGateway");
    static readonly profileRepository = Symbol.for("profileRepository");
    static readonly emailGateway = Symbol.for("emailGateway");
    static readonly recipientRepository = Symbol.for("recipientRepository");
    static readonly storageGateway = Symbol.for("storageGateway");
    static readonly groupRepository = Symbol.for("groupRepository");
    static readonly roleRepository = Symbol.for("roleRepository");
    static readonly gradeRepository = Symbol.for("gradeRepository");
    static readonly userGroupRoleRepository = Symbol.for(
        "userGroupRoleRepository"
    );
    static readonly googleAuthGateway = Symbol.for("googleAuthGateway");
    static readonly appleAuthGateway = Symbol.for("appleAuthGateway");
    static readonly pushNotificationGateway = Symbol.for("pushNotificationGateway");
    static readonly personalInformationReadModelRepository = Symbol.for("personalInformationReadModelRepository")
    static readonly getUserByIdReadModelRepository = Symbol.for("getUserByIdReadModelRepository")
    static readonly getPostsReadModelRepository = Symbol.for("getPostsReadModelRepository")
    static readonly searchUserReadModelRepository = Symbol.for("searchUserReadModelRepository")
    static readonly livesReadModelRepository = Symbol.for("livesReadModelRepository")
    static readonly conversationReadModelRepository = Symbol.for("conversationReadModelRepository")
    static readonly groupReadModelRepository = Symbol.for("groupReadModelRepository")
    static readonly deviceRepository = Symbol.for("deviceRepository")
    static readonly feedRepository = Symbol.for("feedRepository")
    static readonly streamingGateway = Symbol.for("streamingGateway");
    static readonly liveCategoryRepository = Symbol.for("liveCategoryRepository");
    static readonly customTokenGateway = Symbol.for("customTokenGateway");
    static readonly initiateConversationGateway = Symbol.for("initiateConversationGateway");
    static readonly conversationGroupGateway = Symbol.for("conversationGroupGateway");
    static readonly conversationGateway = Symbol.for("conversationGateway");
    static readonly conversationRepository = Symbol.for("conversationRepository")
    static readonly resourceRepository = Symbol.for("resourceRepository")
    static readonly resourceReadModelRepository = Symbol.for("resourceReadModelRepository")
    static readonly recordRepository = Symbol.for("recordRepository")
    static readonly recordReadModelRepository = Symbol.for("recordReadModelRepository")
    static readonly modulePurchaseRepository = Symbol.for("modulePurchaseRepository")
    static readonly subscriptionRepository = Symbol.for("subscriptionRepository")
    static readonly iapPurchaseGateway = Symbol.for("iapPurchaseGateway")
    static readonly userModuleProgressRepository = Symbol.for("userModuleProgressRepository");
    static readonly badgeRepository = Symbol.for("badgeRepository");
    static readonly userBadgesRepository = Symbol.for("userBadgesRepository");
    static readonly gamificationService = Symbol.for("gamificationService");
    
    // Stripe identifiers
    static readonly stripeService = Symbol.for("stripeService");
    static readonly stripePaymentGateway = Symbol.for("stripePaymentGateway");
    static readonly stripeCustomerRepository = Symbol.for("stripeCustomerRepository");
    static readonly stripeSubscriptionRepository = Symbol.for("stripeSubscriptionRepository");
}

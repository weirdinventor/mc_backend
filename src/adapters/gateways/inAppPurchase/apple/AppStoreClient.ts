import {
  AppStoreServerAPIClient,
  Environment,
  HistoryResponse,
  JWSTransactionDecodedPayload,
  Order,
  ProductType,
  ReceiptUtility,
  TransactionHistoryRequest
} from "@apple/app-store-server-library";
import {jwtDecode} from "jwt-decode";

export class AppStoreClient {

  private appStoreServerAPIClient: AppStoreServerAPIClient

  constructor(
    private readonly signingKey: string,
    private readonly keyId: string,
    private readonly issuerId: string,
    private readonly bundleId: string,
  ) {
    this.appStoreServerAPIClient = new AppStoreServerAPIClient(signingKey, keyId, issuerId, bundleId, Environment.PRODUCTION)
  }

  sandbox() {
    return new AppStoreServerAPIClient(this.signingKey, this.keyId, this.issuerId, this.bundleId, Environment.SANDBOX)
  }


  async getTransactionHistory(receipt: string, productId: string): Promise<{
    transactions: JWSTransactionDecodedPayload[];
    sandbox: boolean;
  }> {
    const receiptUtil = new ReceiptUtility()
    const transactionId = receiptUtil.extractTransactionIdFromAppReceipt(receipt)
    const transactionHistoryRequest: TransactionHistoryRequest = {
      sort: Order.DESCENDING,
      productTypes: [ProductType.AUTO_RENEWABLE],
      productIds: [productId]
    }
    const response = await this.fetch(transactionId, transactionHistoryRequest)
    const decodedTransactions: JWSTransactionDecodedPayload[] = response.transactions.map(elem => jwtDecode(elem));
    return {
      transactions: decodedTransactions,
      sandbox: response.sandbox,
    };
  }

  async fetch(transactionId, transactionHistoryRequest): Promise<{
    transactions: string[];
    sandbox: boolean;
  }> {
    let response: HistoryResponse | null = null
    const transactions: string[] = []

    do {
      const revisionToken = response !== null && response.revision !== null ? response.revision : null
      try {
        response = await this.appStoreServerAPIClient.getTransactionHistory(transactionId, revisionToken, transactionHistoryRequest)
        return {
          transactions: transactions.concat(response.signedTransactions),
          sandbox: false,
        };
      } catch(e) {
        // probably sandbox case.
        if (e.apiError === 4040010) {
          response = await this.fetchWithSandbox(transactionId, revisionToken, transactionHistoryRequest)
          if (response.signedTransactions) {
            return {
              sandbox: true,
              transactions: transactions.concat(response.signedTransactions),
            };
          }
        }
        throw e;
      }
    } while (response.hasMore)
  }

  async fetchWithSandbox(transactionId, revisionToken, transactionHistoryRequest): Promise<HistoryResponse> {
    const sandboxClient = this.sandbox();
    return await sandboxClient.getTransactionHistory(transactionId, revisionToken, transactionHistoryRequest)
  }



}

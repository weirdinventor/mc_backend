export interface AppleGateway {
   verify(token : string): Promise<string>;
}
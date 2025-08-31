export interface SmsGateway {
    sendCode(phone: string): Promise<string>

    verify(code: string, contextId: string): Promise<void>
}
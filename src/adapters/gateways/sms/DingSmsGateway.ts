import axios, {AxiosInstance} from "axios"
import {SmsGateway} from "../../../core/write/domain/gateway/SmsGateway";

export interface DingConfiguration {
    customerUUID: string;
    secretToken: string;
    url: string;
    bypass: boolean;
    otpCodeBypass: string;
}

export class DingSmsGateway implements SmsGateway {
    client: AxiosInstance;

    constructor(
        private readonly config: DingConfiguration
    ) {
        this.client = axios.create({
            baseURL: config.url,
            headers: {
                'x-api-key': config.secretToken
            }
        })
    }

    async sendCode(phone: string): Promise<string> {
        if (this.config.bypass) {
            return "";
        }
        const result = await this.client.post<{ authentication_uuid: string }>("/authentication", {
            customer_uuid: this.config.customerUUID,
            phone_number: phone
        })
        return result.data.authentication_uuid;
    }

    async verify(code: string, contextId: string): Promise<void> {
        if (this.config.bypass) {
            if (code !== this.config.otpCodeBypass) {
                throw new Error('OTP_NOT_VALID')
            }
            return;
        } else {
            const result = await this.client.post<{ status: string }>("/check", {
                customer_uuid: this.config.customerUUID,
                check_code: code,
                authentication_uuid: contextId
            })
            if (result.data.status !== "valid") {
                throw new Error('OTP_NOT_VALID')
            }
        }
        return;
    }
}

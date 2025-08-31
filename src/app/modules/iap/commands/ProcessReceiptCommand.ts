import {Os} from "../../../../core/write/domain/types/Os";
import {IsEnum, IsOptional, IsString} from "class-validator";

export class ProcessReceiptCommand {
    @IsEnum(Os)
    os: Os

    @IsString()
    receiptId: string

    @IsOptional()
    @IsString()
    subscriptionId?: string

    @IsOptional()
    @IsString()
    productId?: string
}
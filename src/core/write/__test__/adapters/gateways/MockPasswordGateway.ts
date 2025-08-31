import {PasswordGateway} from "../../../domain/gateway/PasswordGateway";

export class MockPasswordGateway implements PasswordGateway {
  
    async encrypt(password: string): Promise<string> {
      return `encrypted_${password}`;
    }
  
    async compare(password: string, hash: string): Promise<boolean> {
      return `encrypted_${password}` === hash;
    }
  }
import { Injectable } from "@nestjs/common";
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from "crypto";
import { promisify } from "util";

@Injectable()
export class EncryptService {
  private md5 = require('md5');
  private password: string = 'Password used to generate key';
  private iv = randomBytes(16);
  constructor(){}
  async encryptDecrypt(
    action,
    params,
  ) {
    if(action == 'encrypt'){
      const key = (await promisify(scrypt)(this.password, 'salt',32)) as Buffer;
      const chiper = createCipheriv('aes-256-ctr', key, this.iv);

      const textToEncrypt = params;
      const encryptedText = Buffer.concat([
        chiper.update(textToEncrypt),
        chiper.final(),
      ]);
      return encryptedText;
    } else if (action == 'decrypt'){
      const key = (await promisify(scrypt)(this.password, 'salt',32)) as Buffer;
      const dechiper = createDecipheriv('aes-256-ctr', key, this.iv);
      const decryptedText = Buffer.concat([
        dechiper.update(params),
        dechiper.final(),
      ]);
      return decryptedText;
    }
  }
}
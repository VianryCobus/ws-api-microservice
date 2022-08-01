import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import logFromProvider from '../log/logFromProvider';

@Injectable()
export class validationSeamless implements PipeTransform<any> {
  private logFromProvider = logFromProvider;
  private endpoint: String;
  constructor(
    endpoint: String,
  ){
    this.endpoint = endpoint;
  }
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      const logObj = {
        property: errors[0].property,
        constraints: errors[0].constraints,
        desc: new BadRequestException()
      };
      const returnObj = {
        status: "0",
        data: {},
        message: this.returnMessageSeamless(this.endpoint).msgCode,
      }
      this.logFromProvider.debug(
        {
          message : {
            type: `Hit Api ${this.returnMessageSeamless(this.endpoint).title} [bad request]`,
            params: logObj
          }
        }
      );
      // throw new BadRequestException(returnObj);
      throw new HttpException(returnObj, HttpStatus.OK);
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private returnMessageSeamless(endpoint: String){
    let returnObj = {
      title: "",
      msgCode: "",
    }
    if(endpoint == 'getBalance') {
      returnObj.title = "Get Balance";
      returnObj.msgCode = "550";
    } else if(endpoint == 'placeBet') {
      returnObj.title = "Place Bet";
      returnObj.msgCode = "550";
    } else if(endpoint == 'betResult') {
      returnObj.title = "Bet Result";
      returnObj.msgCode = "550";
    }
    return returnObj;
  }
}
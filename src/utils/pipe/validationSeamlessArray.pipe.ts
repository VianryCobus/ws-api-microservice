import { Type } from '../../../node_modules/@nestjs/common/interfaces';
import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform, ValidationPipe, ValidationPipeOptions } from "@nestjs/common";
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BetResultDto } from 'src/transaction/dto';
export interface ParseArrayOptions extends Omit<ValidationPipeOptions, 'transform' | 'validateCustomDecorators' | 'exceptionFactory'> {
  items?: Type<unknown>;
  separator?: string;
  optional?: boolean;
  exceptionFactory?: (error: any) => any;
}

@Injectable()
export class validationSeamlessArray implements PipeTransform<any> {
  private options;
  constructor(options?: ParseArrayOptions){
    this.options = options;
  }
  /**
   * Method that accesses and performs optional transformation on argument for
   * in-flight requests.
   *
   * @param value currently processed route argument
   * @param metadata contains metadata about the currently processed route argument
   */
  // transform(value: any, metadata: ArgumentMetadata): Promise<any>;
  async transform(value: any, metadata: ArgumentMetadata) {
    const object = plainToInstance(this.options.items, value);
    // console.log(object);
    const errors = await validate(object);
    console.log(this.options.items);
    console.log(metadata);
    console.log(value);
    console.log(errors);
    if (errors.length > 0) {
      throw new HttpException('tes', HttpStatus.OK);
    }
    // return value;
  }
  // protected isExpectedTypePrimitive(): boolean;
  // protected validatePrimitive(originalValue: any, index?: number): any;

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
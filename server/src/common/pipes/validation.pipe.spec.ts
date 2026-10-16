import { ArgumentMetadata, HttpStatus } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

import { ErrorItemResponse } from '@common/dto';
import { AppException } from '@common/exceptions';
import { ValidationPipe } from '@common/pipes';
import { validationError } from '@common/utils';
import { sendPseudoError } from '@test/unit/helpers';

class TestNestedClass {
  @IsString()
  stringProp: string;

  constructor(stringProp) {
    this.stringProp = stringProp;
  }
}

class TestClass {
  @IsString()
  private stringProp: string;

  @IsNumber()
  private numberProp;

  @IsBoolean()
  private booleanProp;

  @ValidateNested()
  @Type(() => TestNestedClass)
  @IsOptional()
  private objectProp: any;

  constructor(stringProp, numberProp, booleanProp, objectProp = null) {
    this.stringProp = stringProp;
    this.numberProp = numberProp;
    this.booleanProp = booleanProp;
    this.objectProp = objectProp;
  }
}

class CodedItem {
  @Min(1, validationError('NUMERIC_MUST_NOT_BE_LESS_THAN_N', { min: 1 }))
  sets: number;
}

class CodedClass {
  @ValidateNested({ each: true })
  @Type(() => CodedItem)
  items: CodedItem[];
}

describe('ValidationPipe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('transform', () => {
    it('should be successful result', async () => {
      expect.assertions(1);
      const target = new ValidationPipe();
      const metadata: ArgumentMetadata = { type: 'param', metatype: TestClass };
      const testObject = new TestClass('string', 1, true);
      const result = await target.transform(testObject, metadata);
      expect(result).toEqual(testObject);
    });
    it('should be successful result (with nested object)', async () => {
      expect.assertions(1);
      const target = new ValidationPipe();
      const metadata: ArgumentMetadata = { type: 'param', metatype: TestClass };
      const testNestedObject = new TestNestedClass('stringProp');
      const testObject = new TestClass('string', 1, true, testNestedObject);
      const result = await target.transform(testObject, metadata);
      expect(result).toEqual(testObject);
    });
    it('should not validate primitive or default types (number, string, boolean, array, object)', async () => {
      expect.assertions(5);

      const target = new ValidationPipe();
      const numberMetadata: ArgumentMetadata = { type: 'param', metatype: Number };
      const num = 1;
      let result = await target.transform(num, numberMetadata);
      expect(result).toBe(num);

      const stringMetadata: ArgumentMetadata = { type: 'param', metatype: String };
      const str = 'str';
      result = await target.transform(str, stringMetadata);
      expect(result).toBe(str);

      const booleanMetadata: ArgumentMetadata = { type: 'param', metatype: Boolean };
      const bln = true;
      result = await target.transform(bln, booleanMetadata);
      expect(result).toBe(bln);

      const arrayMetadata: ArgumentMetadata = { type: 'param', metatype: Array };
      const arr = [1, 2, 3];
      result = await target.transform(arr, arrayMetadata);
      expect(result).toEqual(arr);

      const objectMetadata: ArgumentMetadata = { type: 'param', metatype: Object };
      const obj = { field1: 'value1', field2: 'value2' };
      result = await target.transform(obj, objectMetadata);
      expect(result).toEqual(obj);
    });
    it('should not validate if metatype was missing', async () => {
      expect.assertions(1);
      const target = new ValidationPipe();
      const metadata: ArgumentMetadata = { type: 'param', metatype: null };
      const testObject = new TestClass('string', 'stringToo', 'andStringToo');
      const result = await target.transform(testObject, metadata);
      expect(result).toEqual(testObject);
    });
    it('should throw one item per failed constraint, with the field', async () => {
      expect.assertions(3);
      const target = new ValidationPipe();
      const metadata: ArgumentMetadata = { type: 'param', metatype: TestClass };
      try {
        await target.transform(new TestClass(1, 'stringToo', 'andStringToo'), metadata);
        sendPseudoError();
      } catch (error) {
        expect(error).toBeInstanceOf(AppException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.errors.map(item => item.field)).toEqual(['stringProp', 'numberProp', 'booleanProp']);
      }
    });
    it('should give a nested field as a dotted path', async () => {
      expect.assertions(1);
      const target = new ValidationPipe();
      const metadata: ArgumentMetadata = { type: 'param', metatype: TestClass };
      try {
        await target.transform(new TestClass('string', 1, true, new TestNestedClass(1)), metadata);
        sendPseudoError();
      } catch (error) {
        expect(error.errors.map(item => item.field)).toEqual(['objectProp.stringProp']);
      }
    });
    it('should take the code and params of a decorator with validationError, the path through an array', async () => {
      expect.assertions(1);
      const target = new ValidationPipe();
      const metadata: ArgumentMetadata = { type: 'body', metatype: CodedClass };
      try {
        await target.transform({ items: [{ sets: 1 }, { sets: 0 }] }, metadata);
        sendPseudoError();
      } catch (error) {
        expect(error.errors).toEqual([
          new ErrorItemResponse.Dto('NUMERIC_MUST_NOT_BE_LESS_THAN_N', { min: 1 }, 'items.1.sets'),
        ]);
      }
    });
    it('should give a decorator without validationError under the generic code with its own text', async () => {
      expect.assertions(1);
      const target = new ValidationPipe();
      const metadata: ArgumentMetadata = { type: 'param', metatype: TestClass };
      try {
        await target.transform(new TestClass('string', 'one', true), metadata);
        sendPseudoError();
      } catch (error) {
        expect(error.errors).toEqual([
          new ErrorItemResponse.Dto(
            'BAD_REQUEST',
            {},
            'numberProp',
            'numberProp must be a number conforming to the specified constraints',
          ),
        ]);
      }
    });
  });
});

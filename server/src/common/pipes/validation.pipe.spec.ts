import { ArgumentMetadata, HttpStatus } from '@nestjs/common';
import { IsBoolean, isInstance, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { ValidationPipe } from '@common/pipes';
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
    it('should throw error with array of messages', async () => {
      expect.assertions(5);
      const target = new ValidationPipe();
      const metadata: ArgumentMetadata = { type: 'param', metatype: TestClass };
      const testObject = new TestClass(1, 'stringToo', 'andStringToo');
      try {
        await target.transform(testObject, metadata);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message.length).toBe(3);
        Object.keys(testObject).forEach(key => {
          if (key !== 'objectProp') expect(error.message.some(message => message.includes(key))).toBeTruthy();
        });
      }
    });
    it('should throw error with array of errors. For nested object array should has separate array', async () => {
      expect.assertions(7);
      const target = new ValidationPipe();
      const metadata: ArgumentMetadata = { type: 'param', metatype: TestClass };
      const testNestedObject = new TestNestedClass(1);
      const testObject = new TestClass(1, 'stringToo', 'andStringToo', testNestedObject);
      try {
        await target.transform(testObject, metadata);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message.length).toBe(4);
        Object.keys(testObject).forEach(key => {
          if (key !== 'objectProp') expect(error.message.some(message => message.includes(key))).toBeTruthy();
        });
        expect(isInstance(error.message[3], Array)).toBeTruthy();
        expect(error.message[3].length).toBe(1);
      }
    });
  });
});

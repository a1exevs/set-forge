import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

export const validateDto = async <T extends object, V extends T>(
  cls: ClassConstructor<T>,
  plain: V,
): Promise<ValidationError[]> => {
  const obj = plainToInstance(cls, plain);
  return validate(obj);
};

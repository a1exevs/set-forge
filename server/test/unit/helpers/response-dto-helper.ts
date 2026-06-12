export const checkForApiProperties = (instance: any, type: any) => {
  const properties = Reflect.getMetadata('swagger/apiModelPropertiesArray', type.prototype);
  const dtoProperties = Object.getOwnPropertyNames(instance);
  const preparedDtoProperties = dtoProperties.map(p => `:${p}`);
  expect(properties).toEqual(preparedDtoProperties);
};

import '@root/string.extensions';

import { formatString } from '@common/utils';

describe('FormattersUtil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatString', () => {
    it('should be successful result (3 different parameters)', () => {
      const testStr = 'test {0} {1} {2}';
      const firstValue = testStr;
      const expectedStr = 'test 1 2 3';
      const result = formatString.call(testStr, '1', '2', '3');
      expect(result).toBe(expectedStr);
      expect(testStr).toBe(firstValue);
    });
    it('should be successful result (with the same parameters)', () => {
      const testStr = 'test {0} {0} {1}';
      const firstValue = testStr;
      const expectedStr = 'test 1 1 2';
      const result = formatString.call(testStr, '1', '2');
      expect(result).toBe(expectedStr);
      expect(testStr).toBe(firstValue);
    });
    it('should be successful result (parameters are numbers)', () => {
      const testStr = 'test {0} {1} {2}';
      const firstValue = testStr;
      const expectedStr = 'test 1 2 3';
      const result = formatString.call(testStr, 1, 2, 3);
      expect(result).toBe(expectedStr);
      expect(testStr).toBe(firstValue);
    });
    it('should be successful result (parameters are an array)', () => {
      const testStr = 'test {0} {1} {2}';
      const firstValue = testStr;
      const expectedStr = 'test 1 2 3';
      const result = formatString.call(testStr, [1, 2, 3]);
      expect(result).toBe(expectedStr);
      expect(testStr).toBe(firstValue);
    });
    it('String class should has format-method', () => {
      const testStr = 'test {0} {1} {2}';
      const firstValue = testStr;
      const expectedStr = 'test 1 2 3';
      const result = testStr.format([1, 2, 3]);
      expect(result).toBe(expectedStr);
      expect(testStr).toBe(firstValue);
    });
  });
});

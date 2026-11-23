import { CaptchaResponse } from '@security/dto';
import { checkForApiProperties } from '@test/unit/helpers';

describe('CaptchaResponse', () => {
  it('should has ApiProperty decorator for all properties', () => {
    const dto = new CaptchaResponse.Dto({ captchaURL: 'data:image/svg+xml;base64,', captchaId: 'id' });
    checkForApiProperties(dto, CaptchaResponse.Dto);
  });
});

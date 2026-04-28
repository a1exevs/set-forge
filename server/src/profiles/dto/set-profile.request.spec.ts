import { validateDto } from '@test/unit/helpers';
import { SetProfileRequest, SetUserContactRequest } from '@profiles/dto';
import { ErrorMessages } from '@common/constants';

describe('SetProfileRequest', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('should be successful result', async () => {
      const dto = new SetProfileRequest.Dto('fullName', 'aboutMe', true, 'description');
      const errors = await validateDto(SetProfileRequest.Dto, dto);
      expect(errors.length).toBe(0);
    });
    it('should be successful result (with nested contact property)', async () => {
      const contacts = new SetUserContactRequest.Dto(
        'facebook',
        'website',
        'twitter',
        'instagram',
        'youtube',
        'github',
        'vk',
        'mainLink',
      );
      const dto = new SetProfileRequest.Dto('fullName', 'aboutMe', true, 'description', contacts);
      const errors = await validateDto(SetProfileRequest.Dto, dto);
      expect(errors.length).toBe(0);
    });
    it('should has errors (values have not required types)', async () => {
      const dto = new SetProfileRequest.Dto(1, 1, 1, 1);
      const errors = await validateDto(SetProfileRequest.Dto, dto);
      expect(errors.length).toBe(4);
      expect(errors[0].constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
      expect(errors[0].property).toBe('fullName');
      expect(errors[1].constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
      expect(errors[1].property).toBe('aboutMe');
      expect(errors[2].constraints.isBoolean).toBe(ErrorMessages.ru.MUST_BE_A_BOOLEAN);
      expect(errors[2].property).toBe('lookingForAJob');
      expect(errors[3].constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
      expect(errors[3].property).toBe('lookingForAJobDescription');
    });
    it('should has errors (nested object fields have not requirement types)', async () => {
      const contacts = new SetUserContactRequest.Dto(1, 2, 3, 4, 5, 6, 7, 8);
      const dto = new SetProfileRequest.Dto('fullName', 'aboutMe', true, 'description', contacts);
      const errors = await validateDto(SetProfileRequest.Dto, dto);
      const contactsFieldsCount = Object.keys(contacts).length;
      expect.assertions(3 + contactsFieldsCount * 2);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('contacts');
      expect(errors[0].children.length).toBe(contactsFieldsCount);
      Object.keys(contacts).forEach((contact, index) => {
        expect(errors[0].children[index].constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
        expect(errors[0].children[index].property).toBe(contact);
      });
    });
  });
});

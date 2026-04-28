import '@root/string.extensions';

import { HttpStatus } from '@nestjs/common';

import { Routes, ResultCodes, ErrorMessages } from '@common/constants';
import { SetProfileRequest, SetUserContactRequest } from '@profiles/dto';

import * as path from 'path';
import * as request from 'supertest';

describe('User workflow', () => {
  let URL;
  let user1Id;
  let user2Id;
  let accessToken;
  let cookies;
  let user1Status;

  const user1Email = 'user1@gmail.com';
  const user1Password = '12345678';
  const user2Email = 'user2@gmail.com';
  const user2Password = '87654321';

  const user1Contacts = new SetUserContactRequest.Dto(
    'facebook',
    'website',
    'twitter',
    'instagram',
    'youtube',
    'github',
    'vk',
    'mainLink',
  );
  const emptyUser1Contacts = new SetUserContactRequest.Dto('', '', '', '', '', '', '', '');
  const user1Profile = new SetProfileRequest.Dto(
    'lord Voldemort',
    'I am super wizard in the World',
    false,
    "I don't need to work. I need to seize power in the world of magicians",
    user1Contacts,
  );
  const user1ProfileWithoutContacts = new SetProfileRequest.Dto(
    'lord Voldemort',
    'I am super wizard in the World',
    false,
    "I don't need to work. I need to seize power in the world of magicians",
  );

  beforeAll(() => {
    const baseURL = process.env.SERVER_URL;
    const port = process.env.PORT;
    URL = `${baseURL}:${port}/api/1.0/`;
  });

  describe(Routes.ENDPOINT_AUTH, () => {
    describe('/registration POST', () => {
      it(`Register user1 (bad request - email and password are numbers)`, () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .post('/registration')
          .send({ email: 1, password: 2 })
          .expect(HttpStatus.BAD_REQUEST)
          .expect(response => {
            expect(response.body.data).toBeNull();
            expect(response.body.messages).toBeDefined();
            expect(response.body.messages.length).toBe(2);
            expect(response.body.messages[0]).toBe(
              `email - ${ErrorMessages.ru.MUST_HAS_EMAIL_FORMAT}, ${ErrorMessages.ru.MUST_BE_A_STRING}`,
            );
            expect(response.body.messages[1]).toBe(
              `password - ${ErrorMessages.ru.STRING_LENGTH_MUST_NOT_BE_LESS_THAN_M_AND_GREATER_THAN_N.format(8, 50)}, ${
                ErrorMessages.ru.MUST_BE_A_STRING
              }`,
            );
            expect(response.body.fieldsErrors).toBeDefined();
            expect(response.body.fieldsErrors.length).toBe(0);
            expect(response.body.resultCode).toBeDefined();
            expect(response.body.resultCode).toBe(ResultCodes.ERROR);
          });
      });
      it(`Register user1 (bad request - incorrect email and small password)`, () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .post('/registration')
          .send({ email: 'user1gmail.com', password: 'pass' })
          .expect(HttpStatus.BAD_REQUEST)
          .expect(response => {
            expect(response.body.data).toBeNull();
            expect(response.body.messages).toBeDefined();
            expect(response.body.messages.length).toBe(2);
            expect(response.body.messages[0]).toBe(`email - ${ErrorMessages.ru.MUST_HAS_EMAIL_FORMAT}`);
            expect(response.body.messages[1]).toBe(
              `password - ${ErrorMessages.ru.STRING_LENGTH_MUST_NOT_BE_LESS_THAN_M_AND_GREATER_THAN_N.format(8, 50)}`,
            );
            expect(response.body.fieldsErrors).toBeDefined();
            expect(response.body.fieldsErrors.length).toBe(0);
            expect(response.body.resultCode).toBeDefined();
            expect(response.body.resultCode).toBe(ResultCodes.ERROR);
          });
      });
      it('Register user1 (bad request - large password)', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .post('/registration')
          .send({ email: 'user1@gmail.com', password: '123456789012345678901234567890123456789012345678901' })
          .expect(HttpStatus.BAD_REQUEST)
          .expect(response => {
            expect(response.body.data).toBeNull();
            expect(response.body.messages).toBeDefined();
            expect(response.body.messages.length).toBe(1);
            expect(response.body.messages[0]).toBe(
              `password - ${ErrorMessages.ru.STRING_LENGTH_MUST_NOT_BE_LESS_THAN_M_AND_GREATER_THAN_N.format(8, 50)}`,
            );
            expect(response.body.fieldsErrors).toBeDefined();
            expect(response.body.fieldsErrors.length).toBe(0);
            expect(response.body.resultCode).toBeDefined();
            expect(response.body.resultCode).toBe(ResultCodes.ERROR);
          });
      });
      it('Register user1', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .post('/registration')
          .send({ email: user1Email, password: user1Password })
          .expect(HttpStatus.CREATED)
          .expect(response => {
            expect(response.body.data).toBeDefined();
            expect(response.body.data.userId).toBeDefined();
            user1Id = response.body.data.userId;
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.get('Set-Cookie')[0]).toBeDefined();
            expect(response.get('Set-Cookie')[0].includes('refreshToken')).toBeTruthy();
            expect(response.body.messages).toBeDefined();
            expect(response.body.messages.length).toBe(0);
            expect(response.body.fieldsErrors).toBeDefined();
            expect(response.body.fieldsErrors.length).toBe(0);
            expect(response.body.resultCode).toBeDefined();
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
      it('Register user1 (bad request - user was registered before)', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .post('/registration')
          .send({ email: user1Email, password: user1Password })
          .expect(HttpStatus.BAD_REQUEST)
          .expect(response => {
            expect(response.body.data).toBeNull();
            expect(response.body.messages).toBeDefined();
            expect(response.body.messages.length).toBe(1);
            expect(response.body.messages[0]).toBe(ErrorMessages.ru.USER_ALREADY_EXISTS);
            expect(response.body.fieldsErrors).toBeDefined();
            expect(response.body.fieldsErrors.length).toBe(0);
            expect(response.body.resultCode).toBeDefined();
            expect(response.body.resultCode).toBe(ResultCodes.ERROR);
          });
      });
      it('Register user2', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .post('/registration')
          .send({ email: user2Email, password: user2Password })
          .expect(HttpStatus.CREATED)
          .expect(response => {
            expect(response.body.data).toBeDefined();
            expect(response.body.data.userId).toBeDefined();
            user2Id = response.body.data.userId;
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.get('Set-Cookie')[0]).toBeDefined();
            expect(response.get('Set-Cookie')[0].includes('refreshToken')).toBeTruthy();
            expect(response.body.messages).toBeDefined();
            expect(response.body.messages.length).toBe(0);
            expect(response.body.fieldsErrors).toBeDefined();
            expect(response.body.fieldsErrors.length).toBe(0);
            expect(response.body.resultCode).toBeDefined();
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });

    describe('/login POST', () => {
      it('Login as user1 (unauthorized)', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .post('/login')
          .send({ email: user1Email, password: user1Password + '123' })
          .expect(HttpStatus.UNAUTHORIZED)
          .expect(response => {
            expect(response.body.data).toBeNull();
            expect(response.body.messages).toBeDefined();
            expect(response.body.messages.length).toBe(1);
            expect(response.body.messages[0]).toBe(ErrorMessages.ru.INVALID_EMAIL_OR_PASSWORD);
            expect(response.body.fieldsErrors).toBeDefined();
            expect(response.body.fieldsErrors.length).toBe(0);
            expect(response.body.resultCode).toBeDefined();
            expect(response.body.resultCode).toBe(ResultCodes.ERROR);
          });
      });
      it('Login as user1', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .post('/login')
          .send({ email: user1Email, password: user1Password })
          .expect(HttpStatus.CREATED)
          .expect(response => {
            expect(response.body.data).toBeDefined();
            expect(response.body.data.userId).toBe(user1Id);
            user1Id = response.body.data.userId;
            expect(response.body.data.accessToken).toBeDefined();
            accessToken = response.body.data.accessToken;
            cookies = response.get('Set-Cookie');
            expect(cookies[0]).toBeDefined();
            expect(cookies[0].includes('refreshToken')).toBeTruthy();
            expect(response.body.messages).toBeDefined();
            expect(response.body.messages.length).toBe(0);
            expect(response.body.fieldsErrors).toBeDefined();
            expect(response.body.fieldsErrors.length).toBe(0);
            expect(response.body.resultCode).toBeDefined();
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });
  });

  describe(Routes.ENDPOINT_SECURITY, () => {
    describe('/get-captcha-url GET', () => {
      it('Get captcha URL', () => {
        return request(URL + Routes.ENDPOINT_SECURITY)
          .get('/get-captcha-url')
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.data).toBeDefined();
            expect(response.body.data.captchaURL).toBeDefined();
            expect(response.body.data.captchaURL.includes('security/captcha')).toBeTruthy();
            expect(response.body.messages).toBeDefined();
            expect(response.body.messages.length).toBe(0);
            expect(response.body.fieldsErrors).toBeDefined();
            expect(response.body.fieldsErrors.length).toBe(0);
            expect(response.body.resultCode).toBeDefined();
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });
  });

  describe(Routes.ENDPOINT_AUTH, () => {
    describe('/me GET', () => {
      it('Get current user', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .get('/me')
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.data).toBeDefined();
            expect(response.body.data.id).toBe(user1Id);
            expect(response.body.data.email).toBe(user1Email);
            expect(response.body.messages).toBeDefined();
            expect(response.body.messages.length).toBe(0);
            expect(response.body.fieldsErrors).toBeDefined();
            expect(response.body.fieldsErrors.length).toBe(0);
            expect(response.body.resultCode).toBeDefined();
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });

    describe('/refresh POST', () => {
      it('Refresh Access Token', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .post('/refresh')
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.CREATED)
          .expect(response => {
            expect(response.body.data).toBeDefined();
            expect(response.body.data.userId).toBe(user1Id);
            user1Id = response.body.data.userId;
            expect(response.body.data.accessToken).toBeDefined();
            accessToken = response.body.data.accessToken;
            cookies = response.get('Set-Cookie');
            expect(cookies[0]).toBeDefined();
            expect(cookies[0].includes('refreshToken')).toBeTruthy();
            expect(response.body.messages).toBeDefined();
            expect(response.body.messages.length).toBe(0);
            expect(response.body.fieldsErrors).toBeDefined();
            expect(response.body.fieldsErrors.length).toBe(0);
            expect(response.body.resultCode).toBeDefined();
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });
  });

  describe(Routes.ENDPOINT_USERS, () => {
    describe('/ GET', () => {
      it('Get users (bad request - page and count are strings)', () => {
        return request(URL + Routes.ENDPOINT_USERS)
          .get('?page=1a&count=20a')
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.BAD_REQUEST)
          .expect(response => {
            expect(response.body.length).toBe(2);
            expect(response.body[0].includes('page')).toBeTruthy();
            expect(response.body[1].includes('count')).toBeTruthy();
          });
      });
      it('Get users (bad request - page and count are negative numbers)', () => {
        return request(URL + Routes.ENDPOINT_USERS)
          .get('?page=-1&count=-1')
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.BAD_REQUEST)
          .expect(response => {
            expect(response.body.length).toBe(2);
            expect(response.body[0].includes('page')).toBeTruthy();
            expect(response.body[1].includes('count')).toBeTruthy();
          });
      });
      it('Get users (bad request - page is zero and count is big number)', () => {
        return request(URL + Routes.ENDPOINT_USERS)
          .get('?page=0&count=101')
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.BAD_REQUEST)
          .expect(response => {
            expect(response.body.length).toBe(2);
            expect(response.body[0].includes('page')).toBeTruthy();
            expect(response.body[1].includes('count')).toBeTruthy();
          });
      });
      it('Get users (bad request - page is correct and count is big number)', () => {
        return request(URL + Routes.ENDPOINT_USERS)
          .get('?page=1&count=101')
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.BAD_REQUEST)
          .expect(response => {
            expect(response.body.length).toBe(1);
            expect(response.body[0].includes('count')).toBeTruthy();
          });
      });
      it('Get users', () => {
        const count = 20;
        return request(URL + Routes.ENDPOINT_USERS)
          .get(`?page=1&count=${count}`)
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.items).toBeDefined();
            expect(response.body.items.length).toBeLessThanOrEqual(count);
            expect(response.body.totalCount).toBeDefined();
          });
      });
      it('Get users (get max users count)', () => {
        const count = 100;
        return request(URL + Routes.ENDPOINT_USERS)
          .get(`?page=1&count=${count}`)
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.items).toBeDefined();
            expect(response.body.items.length).toBeLessThanOrEqual(count);
            expect(response.body.totalCount).toBeDefined();
          });
      });
    });
    describe('/status PUT', () => {
      it('Set user status (bad request - long string)', () => {
        return request(URL + Routes.ENDPOINT_USERS)
          .put('/status')
          .send({ status: 'This status very-very-very-very-very-very-very-very long' })
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.BAD_REQUEST)
          .expect(response => {
            expect(response.body.length).toBe(1);
            expect(response.body[0]).toBe(
              `status - ${ErrorMessages.ru.STRING_LENGTH_MUST_NOT_BE_GREATER_THAN_N.format(30)}`,
            );
          });
      });
      it('Set user status', () => {
        const status = 'Test status';
        return request(URL + Routes.ENDPOINT_USERS)
          .put('/status')
          .send({ status })
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.result).toBe(true);
            user1Status = response.body ? status : '';
          });
      });
    });
    describe('/status/${userId} GET', () => {
      it('Get user status (bad request - user id is string)', () => {
        const userId = '1id';
        return request(URL + Routes.ENDPOINT_USERS)
          .get(`/status/${userId}`)
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.BAD_REQUEST);
      });
      it('Get user status (bad request - user id is negative number)', () => {
        const userId = -1;
        return request(URL + Routes.ENDPOINT_USERS)
          .get(`/status/${userId}`)
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.BAD_REQUEST);
      });
      it('Get user status (not found - user id does not exist)', () => {
        const userId = 555;
        return request(URL + Routes.ENDPOINT_USERS)
          .get(`/status/${userId}`)
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });
      it('Get user status', () => {
        const userId = user1Id;
        return request(URL + Routes.ENDPOINT_USERS)
          .get(`/status/${userId}`)
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.status).toBeDefined();
            expect(response.body.status).toBe(user1Status);
          });
      });
    });
  });

  describe(Routes.ENDPOINT_POSTS, () => {
    describe('/ POST', () => {
      it('Create a post', () => {
        const title = 'Title';
        const content = 'Content';
        return request(URL + Routes.ENDPOINT_POSTS)
          .post('')
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .field({ title, content })
          .attach('image', path.resolve(__dirname, './../../assets/sowa.jpg'))
          .expect(HttpStatus.CREATED)
          .expect(response => {
            expect(response.body.title).toBe(title);
            expect(response.body.content).toBe(content);
            expect(response.body.userId).toBe(user1Id);
            expect(response.body.image).toBeDefined();
          });
      });
    });
  });

  describe(Routes.ENDPOINT_PROFILES, () => {
    describe('/ PUT', () => {
      it('Change user profiles (bad request - profiles fields have incorrect types)', () => {
        const contacts = new SetUserContactRequest.Dto(1, 2, 3, 4, 5, 6, 7, 8);
        const requestDto = new SetProfileRequest.Dto(1, 2, 3, 4, contacts);
        return request(URL + Routes.ENDPOINT_PROFILES)
          .put('')
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .send(requestDto)
          .expect(HttpStatus.BAD_REQUEST)
          .expect(response => {
            expect(response.body.length).toBe(Object.keys(requestDto).length);
            expect(response.body[response.body.length - 1].length).toBe(Object.keys(contacts).length);
          });
      });
      it('Change user profiles (with empty contact data', () => {
        return request(URL + Routes.ENDPOINT_PROFILES)
          .put('')
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .send(user1ProfileWithoutContacts)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.fullName).toBe(user1Profile.fullName);
            expect(response.body.aboutMe).toBe(user1Profile.aboutMe);
            expect(response.body.lookingForAJob).toBe(user1Profile.lookingForAJob);
            expect(response.body.lookingForAJobDescription).toBe(user1Profile.lookingForAJobDescription);
            expect(response.body.contacts).toBeDefined();
            expect(response.body.contacts).toEqual(emptyUser1Contacts);
            expect(response.body.photos).toBeDefined();
            expect(response.body.photos.small).toBe('');
            expect(response.body.photos.large).toBe('');
          });
      });
      it('Change user profiles', () => {
        return request(URL + Routes.ENDPOINT_PROFILES)
          .put('')
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .send(user1Profile)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.fullName).toBe(user1Profile.fullName);
            expect(response.body.aboutMe).toBe(user1Profile.aboutMe);
            expect(response.body.lookingForAJob).toBe(user1Profile.lookingForAJob);
            expect(response.body.lookingForAJobDescription).toBe(user1Profile.lookingForAJobDescription);
            expect(response.body.contacts).toBeDefined();
            expect(response.body.contacts).toEqual(user1Profile.contacts);
            expect(response.body.photos).toBeDefined();
            expect(response.body.photos.small).toBe('');
            expect(response.body.photos.large).toBe('');
          });
      });
    });
    describe('/${userId} GET', () => {
      it('Get user profiles (bad request - user id is a string)', () => {
        return request(URL + Routes.ENDPOINT_PROFILES)
          .get(`/${user1Id}a`)
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .expect(HttpStatus.BAD_REQUEST);
      });
      it('Get user profiles (bad request - user is not found)', () => {
        return request(URL + Routes.ENDPOINT_PROFILES)
          .get(`/555`)
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .expect(HttpStatus.BAD_REQUEST);
      });
      it('Get user profiles', () => {
        return request(URL + Routes.ENDPOINT_PROFILES)
          .get(`/${user1Id}`)
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.fullName).toBe(user1Profile.fullName);
            expect(response.body.aboutMe).toBe(user1Profile.aboutMe);
            expect(response.body.lookingForAJob).toBe(user1Profile.lookingForAJob);
            expect(response.body.lookingForAJobDescription).toBe(user1Profile.lookingForAJobDescription);
            expect(response.body.contacts).toEqual(user1Profile.contacts);
            expect(response.body.photos).toBeDefined();
            expect(response.body.photos.small).toBe('');
            expect(response.body.photos.large).toBe('');
          });
      });
    });

    describe('/photo PUT', () => {
      it('Change user profiles photo (bad request = file is not selected)', () => {
        return request(URL + Routes.ENDPOINT_PROFILES)
          .put('/photo')
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .send({ image: {} })
          .expect(HttpStatus.BAD_REQUEST)
          .expect(response => {
            expect(response.body.data).toBeNull();
            expect(response.body.messages).toBeDefined();
            expect(response.body.messages.length).toBe(1);
            expect(response.body.messages[0]).toBe(ErrorMessages.ru.FILE_NOT_SELECTED);
            expect(response.body.fieldsErrors).toBeDefined();
            expect(response.body.fieldsErrors.length).toBe(0);
            expect(response.body.resultCode).toBeDefined();
            expect(response.body.resultCode).toBe(ResultCodes.ERROR);
          });
      });
      it('Change user profiles photo', () => {
        return request(URL + Routes.ENDPOINT_PROFILES)
          .put('/photo')
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .attach('image', path.resolve(__dirname, './../../assets/sowa.jpg'))
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.data).toBeDefined();
            expect(response.body.data.photos).toBeDefined();
            expect(response.body.data.photos.small).toBeDefined();
            expect(response.body.data.photos.large).toBeDefined();
            expect(response.body.messages).toBeDefined();
            expect(response.body.messages.length).toBe(0);
            expect(response.body.fieldsErrors).toBeDefined();
            expect(response.body.fieldsErrors.length).toBe(0);
            expect(response.body.resultCode).toBeDefined();
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });
  });

  describe(Routes.ENDPOINT_FOLLOWERS, () => {
    describe('/:userId POST', () => {
      it('Follow user (bad request - user id is a string)', () => {
        const userId = user2Id;
        return request(URL + Routes.ENDPOINT_FOLLOWERS)
          .post(`/${userId}a`)
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .expect(HttpStatus.BAD_REQUEST);
      });
      it('Follow user (bad request - user id is a negative number)', () => {
        const userId = -1;
        return request(URL + Routes.ENDPOINT_FOLLOWERS)
          .post(`/${userId}`)
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .expect(HttpStatus.BAD_REQUEST);
      });
      it('Follow user (bad request - user is not found)', () => {
        const userId = 555;
        return request(URL + Routes.ENDPOINT_FOLLOWERS)
          .post(`/${userId}`)
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .expect(HttpStatus.NOT_FOUND);
      });
      it('Follow user', () => {
        const userId = user2Id;
        return request(URL + Routes.ENDPOINT_FOLLOWERS)
          .post(`/${userId}`)
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .expect(HttpStatus.CREATED)
          .expect(response => {
            expect(response.body.result).toBe(true);
          });
      });
      it('Follow user (bad request - user was followed before)', () => {
        const userId = user2Id;
        return request(URL + Routes.ENDPOINT_FOLLOWERS)
          .post(`/${userId}`)
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .expect(HttpStatus.BAD_REQUEST)
          .expect(response => {
            expect(response.body.message).toBe(
              ErrorMessages.ru.USER_M_IS_ALREADY_A_FOLLOWER_OF_USER_N.format(user1Id, userId),
            );
          });
      });
    });
  });

  describe(Routes.ENDPOINT_USERS, () => {
    describe('/ GET', () => {
      it('Get users (check follow result)', () => {
        const count = 20;
        return request(URL + Routes.ENDPOINT_USERS)
          .get(`?page=1&count=${count}`)
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.items).toBeDefined();
            expect(response.body.items.length).toBeLessThanOrEqual(count);
            expect(response.body.totalCount).toBeDefined();
            const users = response.body.items;
            const user = users.find(user => user.id === user2Id);
            expect(user).toBeDefined();
            expect(user.followed).toBe(true);
          });
      });
    });
  });

  describe(Routes.ENDPOINT_FOLLOWERS, () => {
    describe('/:userId DELETE', () => {
      it('Unfollow user (bad request - user id is a string)', () => {
        const userId = user2Id;
        return request(URL + Routes.ENDPOINT_FOLLOWERS)
          .delete(`/${userId}a`)
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .expect(HttpStatus.BAD_REQUEST);
      });
      it('Unfollow user (bad request - user id is a negative number)', () => {
        const userId = -1;
        return request(URL + Routes.ENDPOINT_FOLLOWERS)
          .delete(`/${userId}`)
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .expect(HttpStatus.BAD_REQUEST);
      });
      it('Unfollow user (bad request - user is not found)', () => {
        const userId = 555;
        return request(URL + Routes.ENDPOINT_FOLLOWERS)
          .delete(`/${userId}`)
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .expect(HttpStatus.NOT_FOUND);
      });
      it('Unfollow user', () => {
        const userId = user2Id;
        return request(URL + Routes.ENDPOINT_FOLLOWERS)
          .delete(`/${userId}`)
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.result).toBe(true);
          });
      });
      it('Unfollow user (bad request - user was followed before)', () => {
        const userId = user2Id;
        return request(URL + Routes.ENDPOINT_FOLLOWERS)
          .delete(`/${userId}`)
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .expect(HttpStatus.BAD_REQUEST)
          .expect(response => {
            expect(response.body.message).toBe(
              ErrorMessages.ru.USER_M_IS_NOT_A_FOLLOWER_OF_USER_N.format(user1Id, userId),
            );
          });
      });
    });
  });

  describe(Routes.ENDPOINT_USERS, () => {
    describe('/ GET', () => {
      it('Get users (check unfollow result)', () => {
        const count = 20;
        return request(URL + Routes.ENDPOINT_USERS)
          .get(`?page=1&count=${count}`)
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.items).toBeDefined();
            expect(response.body.items.length).toBeLessThanOrEqual(count);
            expect(response.body.totalCount).toBeDefined();
            const users = response.body.items;
            const user = users.find(user => user.id === user2Id);
            expect(user).toBeDefined();
            expect(user.followed).toBe(false);
          });
      });
    });
  });

  describe(Routes.ENDPOINT_AUTH, () => {
    describe('/logout DELETE', () => {
      it('Logout', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .delete('/logout')
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.result).toBe(true);
            cookies = response.get('Set-Cookie');
            expect(cookies[0]).toBeDefined();
            expect(cookies[0].includes('refreshToken=;')).toBeTruthy();
          });
      });
    });
  });
});

import { HttpStatus } from '@nestjs/common';

import { Routes } from '@common/constants';

import * as request from 'supertest';
import * as path from 'path';

describe('Authorized user methods', () => {
  let URL;

  beforeAll(() => {
    const baseURL = process.env.SERVER_URL;
    const port = process.env.PORT;
    URL = `${baseURL}:${port}/api/1.0/`;
  });

  describe(Routes.ENDPOINT_AUTH, () => {
    describe('/me GET', () => {
      it('Get current user', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .get('/me')
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('/refresh POST', () => {
      it('Refresh Access Token', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .post('/refresh')
          .expect(HttpStatus.FORBIDDEN);
      });
    });

    describe(Routes.ENDPOINT_USERS, () => {
      describe('/ GET', () => {
        it('Get users', () => {
          const count = 20;
          return request(URL + Routes.ENDPOINT_USERS)
            .get(`?page=1&count=${count}`)
            .expect(HttpStatus.UNAUTHORIZED);
        });
      });

      describe('/status PUT', () => {
        it('Set user status', () => {
          const status = 'Test status';
          return request(URL + Routes.ENDPOINT_USERS)
            .put('/status')
            .send({ status })
            .expect(HttpStatus.UNAUTHORIZED);
        });
      });

      describe('/status/:userId GET', () => {
        it('Get user status', () => {
          const userId = 1;
          return request(URL + Routes.ENDPOINT_USERS)
            .get(`/status/${userId}`)
            .expect(HttpStatus.UNAUTHORIZED);
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
            .field({ title, content })
            .attach('image', path.resolve(__dirname, './../../assets/sowa.jpg'))
            .expect(HttpStatus.UNAUTHORIZED);
        });
      });
    });

    describe(Routes.ENDPOINT_PROFILES, () => {
      describe('/ PUT', () => {
        it('Change user profiles', () => {
          return request(URL + Routes.ENDPOINT_PROFILES)
            .put('')
            .send({})
            .expect(HttpStatus.UNAUTHORIZED);
        });
      });

      describe('/:userId GET', () => {
        it('Get user profiles', () => {
          const userId = 1;
          return request(URL + Routes.ENDPOINT_PROFILES)
            .get(`/${userId}`)
            .expect(HttpStatus.UNAUTHORIZED);
        });
      });

      describe('/photo PUT', () => {
        it('Change user profiles photo', () => {
          return request(URL + Routes.ENDPOINT_PROFILES)
            .put('/photo')
            .attach('image', path.resolve(__dirname, './../../assets/sowa.jpg'))
            .expect(HttpStatus.UNAUTHORIZED);
        });
      });
    });

    describe(Routes.ENDPOINT_FOLLOWERS, () => {
      describe('/:userId POST', () => {
        it('Follow user', () => {
          const userId = 2;
          return request(URL + Routes.ENDPOINT_FOLLOWERS)
            .post(`/${userId}`)
            .expect(HttpStatus.UNAUTHORIZED);
        });
      });
      describe('/:userId DELETE', () => {
        it('Unfollow user', () => {
          const userId = 2;
          return request(URL + Routes.ENDPOINT_FOLLOWERS)
            .delete(`/${userId}`)
            .expect(HttpStatus.UNAUTHORIZED);
        });
      });
    });

    describe(Routes.ENDPOINT_AUTH, () => {
      describe('/logout DELETE', () => {
        it('Logout', () => {
          return request(URL + Routes.ENDPOINT_AUTH)
            .delete('/logout')
            .expect(HttpStatus.UNAUTHORIZED);
        });
      });
    });
  });
});

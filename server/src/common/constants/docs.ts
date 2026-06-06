export const Docs = {
  ru: {
    AUTHORIZATION_CONTROLLER: 'Авторизация',

    REGISTRATION_ENDPOINT: 'Регистрация пользователя',
    REGISTRATION_SUCCESSFUL_RESULT: 'User was registered successful',
    REGISTRATION_BAD_REQUEST: 'Bad request1',
    EMAIL_FORMAT: 'логин@домен',

    AUTHORIZATION_ENDPOINT: 'Авторизация пользователя',
    AUTHORIZATION_SUCCESSFUL_RESULT: 'User was authorized successful',
    AUTHORIZATION_UNAUTHORIZED: 'Unauthorized',

    REFRESH_TOKENS_ENDPOINT: 'Обновление токенов доступа',
    REFRESH_TOKENS_SUCCESSFUL_RESULT: 'Tokens were refreshed successful',
    REFRESH_TOKENS_UNPROCESSABLE_ENTITY: 'Unprocessable entity',
    REFRESH_TOKENS_FORBIDDEN: 'Forbidden',

    GET_CURRENT_USER_ENDPOINT: 'Получение данные текущего пользователя',
    GET_CURRENT_USER_SUCCESSFUL_RESULT: 'Current user data was received successful',
    GET_CURRENT_USER_UNAUTHORIZED: 'Unauthorized',
    GET_CURRENT_USER_FORBIDDEN: 'Forbidden',

    LOGOUT_ENDPOINT: 'Закрытие сессии',
    LOGOUT_SUCCESSFUL_RESULT: 'Session was closed successful',
    LOGOUT_UNPROCESSABLE_ENTITY: 'Unprocessable entity',
    LOGOUT_UNAUTHORIZED: 'Unauthorized',
    LOGOUT_FORBIDDEN: 'Forbidden',

    FOLLOWERS_CONTROLLER: 'Подписчики',

    FOLLOW_ENDPOINT: 'Подписка на пользователя',
    FOLLOW_BAD_REQUEST: 'Bad request',
    FOLLOW_NOT_FOUND: 'Not found',
    FOLLOW_UNAUTHORIZED: 'Unauthorized',
    FOLLOW_FORBIDDEN: 'Forbidden',

    UNFOLLOW_ENDPOINT: 'Отписка от пользователя',
    UNFOLLOW_BAD_REQUEST: 'Bad request',
    UNFOLLOW_NOT_FOUND: 'Not found',
    UNFOLLOW_UNAUTHORIZED: 'Unauthorized',
    UNFOLLOW_FORBIDDEN: 'Forbidden',

    POSTS_CONTROLLER: 'Посты',

    CREATE_POST_ENDPOINT: 'Создание поста',
    CREATE_POST_BAD_REQUEST: 'Bad request',
    CREATE_POST_UNAUTHORIZED: 'Unauthorized',
    CREATE_POST_FORBIDDEN: 'Forbidden',

    PROFILES_CONTROLLER: 'Профили',

    GET_PROFILE_ENDPOINT: 'Получение профиля пользователя',
    GET_PROFILE_BAD_REQUcEST: 'Bad request',
    GET_PROFILE_UNAUTHORIZED: 'Unauthorized',
    GET_PROFILE_FORBIDDEN: 'Forbidden',

    SET_PROFILE_ENDPOINT: 'Изменение данных профиля пользователя',
    SET_PROFILE_BAD_REQUcEST: 'Bad request',
    SET_PROFILE_UNAUTHORIZED: 'Unauthorized',
    SET_PROFILE_FORBIDDEN: 'Forbidden',

    SET_PROFILE_PHOTO_ENDPOINT: 'Изменение фотографии профиля пользователя',
    SET_PROFILE_PHOTO_BAD_REQUcEST: 'Bad request',
    SET_PROFILE_PHOTO_UNAUTHORIZED: 'Unauthorized',
    SET_PROFILE_PHOTO_FORBIDDEN: 'Forbidden',

    ROLES_CONTROLLER: 'Роли',

    CREATE_ROLE_ENDPOINT: 'Создание роли',
    CREATE_ROLE_BAD_REQUcEST: 'Bad request',
    CREATE_ROLE_FORBIDDEN: 'Forbidden',

    GET_ROLE_ENDPOINT: 'Получение роли по значению',
    GET_ROLE_FORBIDDEN: 'Forbidden',

    SECURITY_CONTROLLER: 'Безопасность',

    GET_CAPTCHA_URL_ENDPOINT: 'Получение ссылки на Капчу',

    USERS_CONTROLLER: 'Пользователи',

    GET_USERS_ENDPOINT: 'Получение пользователей',
    GET_USERS_BAD_REQUcEST: 'Bad request',
    GET_USERS_UNAUTHORIZED: 'Unauthorized',
    GET_USERS_FORBIDDEN: 'Forbidden',

    ADD_ROLE_ENDPOINT: 'Выдача роли пользователю',
    ADD_ROLE_BAD_REQUcEST: 'Bad request',
    ADD_ROLE_NOT_FOUND: 'Not found',
    ADD_ROLE_FORBIDDEN: 'Forbidden',

    BAN_USER_ENDPOINT: 'Бан пользователя',
    BAN_USER_NOT_FOUND: 'Not found',
    BAN_USER_FORBIDDEN: 'Forbidden',

    GET_USER_STATUS_ENDPOINT: 'Статус пользователя',
    GET_USER_STATUS_BAD_REQUcEST: 'Bad request',
    GET_USER_STATUS_NOT_FOUND: 'Not found',
    GET_USER_STATUS_UNAUTHORIZED: 'Unauthorized',
    GET_USER_STATUS_FORBIDDEN: 'Forbidden',

    SET_USER_STATUS_ENDPOINT: 'Установить статус пользователю',
    SET_USER_STATUS_UNAUTHORIZED: 'Unauthorized',
    SET_USER_STATUS_FORBIDDEN: 'Forbidden',

    WORKOUT_LISTS_CONTROLLER: 'Списки тренировок',

    GET_WORKOUT_LISTS_ENDPOINT: 'Получение списков тренировок текущего пользователя',
    GET_WORKOUT_LISTS_SUCCESSFUL_RESULT: 'Workout lists were received successful',
    GET_WORKOUT_LISTS_UNAUTHORIZED: 'Unauthorized',

    GET_WORKOUT_LIST_ENDPOINT: 'Получение списка тренировки по идентификатору',
    GET_WORKOUT_LIST_SUCCESSFUL_RESULT: 'Workout list was received successful',
    GET_WORKOUT_LIST_NOT_FOUND: 'Not found',
    GET_WORKOUT_LIST_UNAUTHORIZED: 'Unauthorized',

    CREATE_WORKOUT_LIST_ENDPOINT: 'Создание списка тренировки',
    CREATE_WORKOUT_LIST_SUCCESSFUL_RESULT: 'Workout list was created successful',
    CREATE_WORKOUT_LIST_BAD_REQUEST: 'Bad request',
    CREATE_WORKOUT_LIST_UNAUTHORIZED: 'Unauthorized',

    UPDATE_WORKOUT_LIST_ENDPOINT: 'Обновление списка тренировки',
    UPDATE_WORKOUT_LIST_SUCCESSFUL_RESULT: 'Workout list was updated successful',
    UPDATE_WORKOUT_LIST_BAD_REQUEST: 'Bad request',
    UPDATE_WORKOUT_LIST_NOT_FOUND: 'Not found',
    UPDATE_WORKOUT_LIST_UNAUTHORIZED: 'Unauthorized',

    DELETE_WORKOUT_LIST_ENDPOINT: 'Удаление списка тренировки',
    DELETE_WORKOUT_LIST_SUCCESSFUL_RESULT: 'Workout list was deleted successful',
    DELETE_WORKOUT_LIST_NOT_FOUND: 'Not found',
    DELETE_WORKOUT_LIST_UNAUTHORIZED: 'Unauthorized',

    UPDATE_WORKOUT_PROGRESS_ENDPOINT: 'Отметить выполненный подход упражнения',
    UPDATE_WORKOUT_PROGRESS_SUCCESSFUL_RESULT: 'Workout progress was updated successful',
    UPDATE_WORKOUT_PROGRESS_NOT_FOUND: 'Not found',
    UPDATE_WORKOUT_PROGRESS_UNAUTHORIZED: 'Unauthorized',

    RESET_WORKOUT_PROGRESS_ENDPOINT: 'Сброс прогресса тренировки',
    RESET_WORKOUT_PROGRESS_SUCCESSFUL_RESULT: 'Workout progress was reset successful',
    RESET_WORKOUT_PROGRESS_NOT_FOUND: 'Not found',
    RESET_WORKOUT_PROGRESS_UNAUTHORIZED: 'Unauthorized',
  },
};

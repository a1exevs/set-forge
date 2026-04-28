export const ErrorMessages = {
  ru: {
    // Validation
    MUST_BE_A_NUMBER: 'Должно быть числом',
    MUST_BE_AN_INTEGER_NUMBER: 'Должно быть целым числом',
    MUST_BE_A_STRING: 'Должно быть строкой',
    MUST_BE_A_BOOLEAN: 'Должно быть булевым значением',
    MUST_HAS_EMAIL_FORMAT: 'Некорректный email',
    STRING_LENGTH_MUST_NOT_BE_LESS_THAN_M_AND_GREATER_THAN_N: 'Длина должна быть больше {0} и меньше {1} символов',
    STRING_LENGTH_MUST_NOT_BE_GREATER_THAN_N: 'Длина должна быть меньше {0} символов',
    NUMERIC_MUST_NOT_BE_LESS_THAN_N: 'Не должно быть меньше, чем {0}',
    NUMERIC_MUST_NOT_BE_GREATER_THAN_N: 'Не должно быть больше, чем {0}',

    // Access
    UNAUTHORIZED: 'Пользователь не авторизован',
    NEED_AUTHORIZATION_WITH_CAPTCHA: 'Необходим ввод кода с каптчи',
    FORBIDDEN: 'Нет доступа',
    NOT_ENOUGH_PERMISSIONS: 'Не достаточно прав',
    INVALID_EMAIL_OR_PASSWORD: 'Неверный email или пароль',
    SERVICE_IS_UNAVAILABLE: 'Сервис недоступен',
    USER_ROLE_CONFIGURATION_IS_MISSING: 'Отсутствует конфигурация ролей для пользователей',

    // Refresh tokens
    REFRESH_TOKEN_IS_MALFORMED: 'Refresh token поврежден',
    REFRESH_TOKEN_EXPIRED: 'Refresh token устарел',
    REFRESH_TOKEN_NOT_FOUND: 'Refresh token не найден',
    REFRESH_TOKEN_REVOKED: 'Refresh token отозван',

    // Files
    FILE_UPLOAD_ERROR: 'Произошла ошибка при записи файла',
    UPLOAD_FILE_SIZE_CANNOT_EXCEED_N_MBT: 'Размер закружаемого файла не может привышать {0} МБт',
    FILE_NOT_SELECTED: 'Файл не был выбран',
    IMAGE_FILE_COMPRESSING_ERROR: 'Ошибка при компрессии image-файла',

    // Users
    USER_M_IS_ALREADY_A_FOLLOWER_OF_USER_N: 'Пользователь с id={0} уже является подписчиком пользователя с id={1}',
    USER_M_IS_NOT_A_FOLLOWER_OF_USER_N: 'Пользователь с id={0} не является подписчиком пользователя с id={1}',
    USER_ALREADY_HAS_THE_ROLE_N: 'Пользователь уже имеет роль {0}',
    USER_ALREADY_EXISTS: 'Пользователь уже существует',
    USER_N_NOT_FOUND: 'Пользователь с идентификатором {0} не найден',

    // Failures
    FAILED_TO_CREATE_POST: 'Не удалось создать пост',
    FAILED_TO_CREATE_ROLE: 'Не удалось создать роль',
    FAILED_TO_FIND_USER: 'Не удалось найти пользователя',
    FAILED_TO_FIND_ROLE: 'Не удалось найти роль',
    FAILED_TO_CREATE_USER: 'Не удалось создать пользователя',
  },
};

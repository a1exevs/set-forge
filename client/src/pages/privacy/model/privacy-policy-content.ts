export type PrivacyLang = 'ru' | 'en';

/**
 * Operator identity shown in the policy and used as the contact point for data-subject requests.
 * Both 152-ФЗ (ст. 18.1) and GDPR (Art. 13) require the operator to be identifiable and reachable.
 *
 * `contactEmail` is injected at build time from `VITE_PRIVACY_CONTACT_EMAIL` (see vite.config.ts),
 * so the real address lives only in the deployer's local env and never in the (public) source. It
 * falls back to a reserved-`.example` placeholder when unset (dev, tests, or an unconfigured build).
 *
 * TODO: set the real operator `name` before going public.
 */
const contactEmail =
  (typeof __PRIVACY_CONTACT_EMAIL__ !== 'undefined' && __PRIVACY_CONTACT_EMAIL__) || 'privacy@set-forge.example';

export const PRIVACY_OPERATOR = {
  name: 'Alexander Evstafiadi',
  contactEmail,
} as const;

/** Effective date of the current version. Bump when the policy text changes. */
export const PRIVACY_EFFECTIVE_DATE = '2026-07-18';

export type PrivacySection = {
  heading: string;
  /** Paragraphs and/or bullet lists rendered in order. */
  blocks: Array<{ type: 'p'; text: string } | { type: 'ul'; items: string[] }>;
};

export type PrivacyContent = {
  title: string;
  effectiveLabel: string;
  intro: string;
  sections: PrivacySection[];
};

const ru: PrivacyContent = {
  title: 'Политика обработки персональных данных',
  effectiveLabel: 'Действует с',
  intro:
    `Настоящая Политика описывает, какие персональные данные обрабатывает Set Forge (далее — «Сервис»), ` +
    `с какой целью и на каком основании, а также какие права есть у пользователя. Оператором персональных ` +
    `данных является ${PRIVACY_OPERATOR.name} (далее — «Оператор»). По любым вопросам об обработке ` +
    `персональных данных можно написать на ${PRIVACY_OPERATOR.contactEmail}.`,
  sections: [
    {
      heading: '1. Какие данные мы обрабатываем',
      blocks: [
        { type: 'p', text: 'Сервис обрабатывает минимально необходимый набор данных:' },
        {
          type: 'ul',
          items: [
            'адрес электронной почты — используется как логин и для связанных с аккаунтом уведомлений;',
            'пароль — хранится только в виде необратимого хеша, Оператор не имеет доступа к исходному паролю;',
            'данные о тренировках, которые вы вносите сами (списки упражнений, веса, повторения, история подходов);',
            'технические данные сессии (защищённые cookie для поддержания авторизации).',
          ],
        },
        {
          type: 'p',
          text: 'Сервис не запрашивает и не собирает специальные категории данных (о здоровье в юридическом смысле, биометрию), а также ФИО, телефон, адрес или платёжные данные.',
        },
      ],
    },
    {
      heading: '2. Цели и правовые основания обработки',
      blocks: [
        {
          type: 'ul',
          items: [
            'создание и ведение учётной записи, аутентификация — основание: исполнение договора (пользовательского соглашения) и согласие пользователя;',
            'предоставление функциональности Сервиса (хранение и синхронизация тренировок между устройствами) — основание: исполнение договора;',
            'обеспечение безопасности (защита от подбора паролей, ограничение доступа) — основание: законный интерес Оператора.',
          ],
        },
        {
          type: 'p',
          text: 'Для пользователей из ЕС правовые основания соответствуют ст. 6(1)(a) и 6(1)(b) GDPR; для пользователей из РФ — ст. 6 Федерального закона № 152-ФЗ.',
        },
      ],
    },
    {
      heading: '3. Где и сколько хранятся данные',
      blocks: [
        {
          type: 'p',
          text: 'Данные хранятся на серверах, расположенных на территории Российской Федерации, что соответствует требованию о локализации (ч. 5 ст. 18 152-ФЗ).',
        },
        {
          type: 'p',
          text: 'Данные аккаунта хранятся до тех пор, пока существует учётная запись. При удалении аккаунта все связанные данные удаляются без возможности восстановления.',
        },
      ],
    },
    {
      heading: '4. Передача третьим лицам',
      blocks: [
        {
          type: 'p',
          text: 'Оператор не продаёт и не передаёт персональные данные третьим лицам. Сервис не использует рекламные сети, системы веб-аналитики и трекеры. Рекламные рассылки не осуществляются; электронная почта используется только для сервисных и связанных с аккаунтом сообщений.',
        },
      ],
    },
    {
      heading: '5. Cookie',
      blocks: [
        {
          type: 'p',
          text: 'Сервис использует только строго необходимые cookie для поддержания авторизованной сессии. Рекламные и аналитические cookie не устанавливаются, поэтому отдельный баннер согласия на cookie не требуется.',
        },
      ],
    },
    {
      heading: '6. Права пользователя',
      blocks: [
        { type: 'p', text: 'Вы имеете право:' },
        {
          type: 'ul',
          items: [
            'получить информацию об обработке своих данных;',
            'потребовать исправления неточных данных;',
            'удалить аккаунт и все связанные данные — самостоятельно в разделе «Профиль» или по запросу на почту Оператора;',
            'отозвать согласие на обработку данных (что влечёт удаление аккаунта).',
          ],
        },
        {
          type: 'p',
          text: `Для реализации прав, не покрытых интерфейсом, напишите на ${PRIVACY_OPERATOR.contactEmail}. Для пользователей из ЕС дополнительно применяются права на доступ, переносимость и ограничение обработки (ст. 15–21 GDPR).`,
        },
      ],
    },
    {
      heading: '7. Изменения Политики',
      blocks: [
        {
          type: 'p',
          text: 'Актуальная версия Политики всегда доступна на этой странице. При существенных изменениях будет обновлена дата вступления в силу.',
        },
      ],
    },
  ],
};

const en: PrivacyContent = {
  title: 'Privacy Policy',
  effectiveLabel: 'Effective from',
  intro:
    `This Policy explains what personal data Set Forge (the "Service") processes, for what purpose and on ` +
    `what legal basis, and what rights you have. The data controller is ${PRIVACY_OPERATOR.name} (the ` +
    `"Operator"). For any questions about the processing of personal data, contact ${PRIVACY_OPERATOR.contactEmail}.`,
  sections: [
    {
      heading: '1. What data we process',
      blocks: [
        { type: 'p', text: 'The Service processes the minimum data necessary:' },
        {
          type: 'ul',
          items: [
            'email address — used as your login and for account-related notifications;',
            'password — stored only as an irreversible hash; the Operator has no access to the original password;',
            'workout data you enter yourself (exercise lists, weights, reps, set history);',
            'technical session data (secure cookies used to keep you signed in).',
          ],
        },
        {
          type: 'p',
          text: 'The Service does not request or collect special categories of data (health data in the legal sense, biometrics), nor your full name, phone number, address, or payment details.',
        },
      ],
    },
    {
      heading: '2. Purposes and legal bases',
      blocks: [
        {
          type: 'ul',
          items: [
            'creating and maintaining your account and authentication — basis: performance of a contract (the terms of use) and your consent;',
            'providing the Service (storing and syncing workouts across devices) — basis: performance of a contract;',
            'security (protection against password guessing, access control) — basis: the Operator’s legitimate interest.',
          ],
        },
        {
          type: 'p',
          text: 'For EU users the legal bases are Art. 6(1)(a) and 6(1)(b) GDPR; for users in Russia — Art. 6 of Federal Law No. 152-FZ.',
        },
      ],
    },
    {
      heading: '3. Where and how long data is stored',
      blocks: [
        {
          type: 'p',
          text: 'Data is stored on servers located in the Russian Federation, in line with the data-localization requirement (Art. 18(5) of 152-FZ).',
        },
        {
          type: 'p',
          text: 'Account data is kept for as long as the account exists. When you delete your account, all related data is permanently erased.',
        },
      ],
    },
    {
      heading: '4. Sharing with third parties',
      blocks: [
        {
          type: 'p',
          text: 'The Operator does not sell or share personal data with third parties. The Service uses no ad networks, web-analytics systems, or trackers. No marketing emails are sent; email is used only for service and account-related messages.',
        },
      ],
    },
    {
      heading: '5. Cookies',
      blocks: [
        {
          type: 'p',
          text: 'The Service uses only strictly necessary cookies to maintain your authenticated session. No advertising or analytics cookies are set, so a separate cookie-consent banner is not required.',
        },
      ],
    },
    {
      heading: '6. Your rights',
      blocks: [
        { type: 'p', text: 'You have the right to:' },
        {
          type: 'ul',
          items: [
            'be informed about the processing of your data;',
            'have inaccurate data corrected;',
            'delete your account and all related data — yourself in the "Profile" section, or by request to the Operator;',
            'withdraw your consent to processing (which results in account deletion).',
          ],
        },
        {
          type: 'p',
          text: `To exercise rights not covered by the interface, contact ${PRIVACY_OPERATOR.contactEmail}. EU users additionally have the rights of access, portability, and restriction of processing (Art. 15–21 GDPR).`,
        },
      ],
    },
    {
      heading: '7. Changes to this Policy',
      blocks: [
        {
          type: 'p',
          text: 'The current version of this Policy is always available on this page. For material changes, the effective date will be updated.',
        },
      ],
    },
  ],
};

export const privacyContent: Record<PrivacyLang, PrivacyContent> = { ru, en };

import type { LegalContent, LegalLang } from '@shared';

/**
 * Operator identity shown in the policy and used as the contact point for data-subject requests.
 * 152-ФЗ (ст. 18.1) requires the operator to be identifiable and reachable.
 *
 * `name` is per-language (`ru`/`en`) because a legal entity is named differently in each language
 * (e.g. «ИП Иванов Иван Иванович» vs "Ivan Ivanov, sole proprietor"). Both names and `contactEmail`
 * are injected at build time (see vite.config.ts) so the real operator identity lives only in the
 * deployer's local env and never in the (public) source:
 *   - `VITE_PRIVACY_OPERATOR_NAME_RU` / `VITE_PRIVACY_OPERATOR_NAME_EN` — language-specific names;
 *   - `VITE_PRIVACY_OPERATOR_NAME` — optional shared fallback used for any language left unset;
 *   - `VITE_PRIVACY_CONTACT_EMAIL` — contact mailbox (language-agnostic).
 * Each falls back to a placeholder when unset (dev, tests, unconfigured build) — set the real values
 * before going public.
 */
const operatorNameShared = (typeof __PRIVACY_OPERATOR_NAME__ !== 'undefined' && __PRIVACY_OPERATOR_NAME__) || '';
const operatorNameRu =
  (typeof __PRIVACY_OPERATOR_NAME_RU__ !== 'undefined' && __PRIVACY_OPERATOR_NAME_RU__) ||
  operatorNameShared ||
  'Оператор сервиса Set Forge';
const operatorNameEn =
  (typeof __PRIVACY_OPERATOR_NAME_EN__ !== 'undefined' && __PRIVACY_OPERATOR_NAME_EN__) ||
  operatorNameShared ||
  'Set Forge Operator';
const contactEmail =
  (typeof __PRIVACY_CONTACT_EMAIL__ !== 'undefined' && __PRIVACY_CONTACT_EMAIL__) || 'privacy@set-forge.example';

export const PRIVACY_OPERATOR = {
  name: { ru: operatorNameRu, en: operatorNameEn } as Record<LegalLang, string>,
  contactEmail,
} as const;

/** Effective date of the current version. Bump when the policy text changes. */
export const PRIVACY_EFFECTIVE_DATE = '2026-07-18';

const ru: LegalContent = {
  title: 'Политика обработки персональных данных',
  effectiveLabel: 'Действует с',
  intro:
    `Настоящая Политика описывает, какие персональные данные обрабатывает Set Forge (далее — «Сервис»), ` +
    `с какой целью и на каком основании, а также какие права есть у пользователя. Оператором персональных ` +
    `данных является ${PRIVACY_OPERATOR.name.ru} (далее — «Оператор»). По любым вопросам об обработке ` +
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
            'пароль — хранится в виде криптографического хеша; исходный пароль Оператор не хранит и доступа к нему не имеет;',
            'данные о тренировках, которые вы вносите сами (списки упражнений, веса, повторения, история подходов);',
            'технические данные и журналы: IP-адрес, дата и время обращения, запрошенный URL, сведения о браузере и устройстве (user-agent), идентификатор сессии — сохраняются в журналах веб-сервера и приложения для обеспечения работы и безопасности Сервиса;',
            'строго необходимые cookie для поддержания авторизованной сессии.',
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
          text: 'Правовые основания обработки предусмотрены ст. 6 Федерального закона № 152-ФЗ «О персональных данных».',
        },
        {
          type: 'p',
          text: [
            'Использование Сервиса также регулируется ',
            { text: 'Пользовательским соглашением', to: '/terms' },
            '.',
          ],
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
          text: 'Оператор не продаёт персональные данные и не передаёт их третьим лицам для самостоятельного использования или в рекламных целях.',
        },
        {
          type: 'p',
          text: 'Для технического функционирования Сервиса данные могут обрабатываться поставщиком хостинга (серверы на территории РФ) по поручению Оператора и только в объёме, необходимом для оказания услуги; Оператор остаётся ответственным за обработку. Сервис не использует рекламные сети, системы веб-аналитики и трекеры, рекламные рассылки не осуществляются.',
        },
      ],
    },
    {
      heading: '5. Cookie',
      blocks: [
        {
          type: 'p',
          text: 'Сервис использует только строго необходимые cookie — для поддержания авторизованной сессии и обеспечения безопасности. Рекламные и аналитические cookie не используются.',
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
          text: `Для реализации прав, не покрытых интерфейсом, напишите на ${PRIVACY_OPERATOR.contactEmail}.`,
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

const en: LegalContent = {
  title: 'Privacy Policy',
  effectiveLabel: 'Effective from',
  intro:
    `This Policy explains what personal data Set Forge (the "Service") processes, for what purpose and on ` +
    `what legal basis, and what rights you have. The data controller is ${PRIVACY_OPERATOR.name.en} (the ` +
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
            'password — stored as a cryptographic hash; the Operator does not store or have access to the original password;',
            'workout data you enter yourself (exercise lists, weights, reps, set history);',
            'technical data and logs: IP address, date and time of the request, requested URL, browser and device information (user-agent), session identifier — recorded in the web-server and application logs to operate and secure the Service;',
            'strictly necessary cookies to keep your session signed in.',
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
          text: 'The legal bases for processing are set out in Art. 6 of Federal Law No. 152-FZ "On Personal Data".',
        },
        {
          type: 'p',
          text: ['Use of the Service is also governed by the ', { text: 'Terms of Use', to: '/terms' }, '.'],
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
          text: 'The Operator does not sell personal data and does not share it with third parties for their own use or for advertising.',
        },
        {
          type: 'p',
          text: 'To operate the Service technically, data may be processed by the hosting provider (servers located in the Russian Federation) on the Operator’s behalf and only to the extent necessary to provide the service; the Operator remains responsible for the processing. The Service uses no ad networks, web-analytics systems, or trackers, and sends no marketing emails.',
        },
      ],
    },
    {
      heading: '5. Cookies',
      blocks: [
        {
          type: 'p',
          text: 'The Service uses only strictly necessary cookies — to maintain your authenticated session and for security. No advertising or analytics cookies are used.',
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
          text: `To exercise rights not covered by the interface, contact ${PRIVACY_OPERATOR.contactEmail}.`,
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

export const privacyContent: Record<LegalLang, LegalContent> = { ru, en };

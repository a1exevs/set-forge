import type { LegalContent, LegalLang } from '@shared';

/** Effective date of the current version. Bump when the terms text changes. */
export const TERMS_EFFECTIVE_DATE = '2026-07-18';

// Same build-time contact as the privacy policy (see vite.config.ts / privacy-policy-content.ts),
// so the Terms show a reachable address directly instead of pointing to another document.
const contactEmail =
  (typeof __PRIVACY_CONTACT_EMAIL__ !== 'undefined' && __PRIVACY_CONTACT_EMAIL__) || 'privacy@set-forge.example';

const ru: LegalContent = {
  title: 'Пользовательское соглашение',
  effectiveLabel: 'Действует с',
  intro:
    'Настоящее Соглашение регулирует использование сервиса учёта тренировок Set Forge (далее — «Сервис»). ' +
    'Регистрируясь и используя Сервис, вы принимаете условия Соглашения. Если вы не согласны — не используйте Сервис.',
  sections: [
    {
      heading: '1. Общие положения',
      blocks: [
        {
          type: 'p',
          text: [
            'Сервис предоставляет инструменты для составления списков упражнений, ведения тренировок и отслеживания прогресса. Обработка персональных данных регулируется отдельной ',
            { text: 'Политикой обработки персональных данных', to: '/privacy' },
            '.',
          ],
        },
      ],
    },
    {
      heading: '2. Условия предоставления Сервиса',
      blocks: [
        {
          type: 'p',
          text: 'Сервис предоставляется «как есть» (as is) и «как доступно» (as available). Оператор не гарантирует бесперебойную работу, отсутствие ошибок и сохранность данных.',
        },
        {
          type: 'p',
          text: 'Оператор вправе временно приостанавливать работу Сервиса, проводить технические работы, изменять функциональность или полностью прекратить предоставление Сервиса.',
        },
      ],
    },
    {
      heading: '3. Отказ от ответственности за здоровье',
      blocks: [
        {
          type: 'p',
          text: 'Сервис не является медицинским изделием и не даёт медицинских или тренировочных рекомендаций. Информация в Сервисе носит справочный характер.',
        },
        {
          type: 'p',
          text: 'Физические нагрузки связаны с риском травм. Перед началом тренировок проконсультируйтесь с врачом. Вы тренируетесь на свой страх и риск; Оператор не несёт ответственности за вред здоровью, полученный в связи с использованием Сервиса.',
        },
      ],
    },
    {
      heading: '4. Учётная запись и правила использования',
      blocks: [
        {
          type: 'p',
          text: 'Регистрируясь, вы подтверждаете, что достигли возраста, при котором вправе заключить настоящее Соглашение по законодательству Российской Федерации, и обладаете необходимой дееспособностью.',
        },
        { type: 'p', text: 'Используя Сервис, вы обязуетесь:' },
        {
          type: 'ul',
          items: [
            'указывать корректный адрес электронной почты при регистрации;',
            'не передавать доступ к учётной записи третьим лицам и отвечать за действия под своей учётной записью;',
            'не использовать Сервис в противоправных целях, не пытаться нарушить его работу или получить несанкционированный доступ.',
          ],
        },
      ],
    },
    {
      heading: '5. Ваши данные',
      blocks: [
        {
          type: 'p',
          text: [
            'Вы сохраняете контроль над данными, которые самостоятельно размещаете в Сервисе, и можете в любой момент удалить учётную запись вместе со всеми связанными данными в разделе «Профиль». Обработка персональных данных описана в ',
            { text: 'Политике обработки персональных данных', to: '/privacy' },
            '.',
          ],
        },
      ],
    },
    {
      heading: '6. Ограничение ответственности',
      blocks: [
        {
          type: 'p',
          text: 'В максимально допустимой законом степени Оператор не несёт ответственности за любые прямые или косвенные убытки, включая потерю данных, возникшие в связи с использованием или невозможностью использования Сервиса.',
        },
      ],
    },
    {
      heading: '7. Изменения',
      blocks: [
        {
          type: 'p',
          text: 'Оператор вправе изменять настоящее Соглашение. Новая редакция вступает в силу с момента её публикации на этой странице, если иное не указано в новой редакции. При существенных изменениях обновляется дата вступления в силу.',
        },
      ],
    },
    {
      heading: '8. Применимое право и контакты',
      blocks: [
        {
          type: 'p',
          text: 'К Соглашению применяется законодательство Российской Федерации.',
        },
        {
          type: 'p',
          text: [
            'По вопросам, связанным с Сервисом и настоящим Соглашением, можно обратиться по адресу ',
            { text: contactEmail, href: `mailto:${contactEmail}` },
            '.',
          ],
        },
      ],
    },
  ],
};

const en: LegalContent = {
  title: 'Terms of Use',
  effectiveLabel: 'Effective from',
  intro:
    'These Terms govern the use of the Set Forge workout-tracking service (the "Service"). By registering and ' +
    'using the Service you accept these Terms. If you do not agree, do not use the Service.',
  sections: [
    {
      heading: '1. General',
      blocks: [
        {
          type: 'p',
          text: [
            'The Service provides tools to build exercise lists, run workouts, and track progress. Processing of personal data is governed by the separate ',
            { text: 'Privacy Policy', to: '/privacy' },
            '.',
          ],
        },
      ],
    },
    {
      heading: '2. Provision of the Service',
      blocks: [
        {
          type: 'p',
          text: 'The Service is provided "as is" and "as available". The Operator does not guarantee uninterrupted or error-free operation or the preservation of data.',
        },
        {
          type: 'p',
          text: 'The Operator may temporarily suspend the Service, carry out maintenance, change its functionality, or discontinue the Service entirely.',
        },
      ],
    },
    {
      heading: '3. Health disclaimer',
      blocks: [
        {
          type: 'p',
          text: 'The Service is not a medical device and does not provide medical or training advice. Information in the Service is for reference only.',
        },
        {
          type: 'p',
          text: 'Physical exercise carries a risk of injury. Consult a physician before starting to train. You train at your own risk; the Operator is not liable for any harm to health arising in connection with use of the Service.',
        },
      ],
    },
    {
      heading: '4. Account and acceptable use',
      blocks: [
        {
          type: 'p',
          text: 'By registering, you confirm that you have reached the age at which you may lawfully enter into these Terms under the law of the Russian Federation and that you have the required legal capacity.',
        },
        { type: 'p', text: 'When using the Service, you agree to:' },
        {
          type: 'ul',
          items: [
            'provide a valid email address at registration;',
            'not share access to your account and to be responsible for activity under it;',
            'not use the Service for unlawful purposes, disrupt its operation, or attempt unauthorized access.',
          ],
        },
      ],
    },
    {
      heading: '5. Your data',
      blocks: [
        {
          type: 'p',
          text: [
            'You keep control of the data you place in the Service yourself, and can delete your account and all related data at any time in the "Profile" section. Processing of personal data is described in the ',
            { text: 'Privacy Policy', to: '/privacy' },
            '.',
          ],
        },
      ],
    },
    {
      heading: '6. Limitation of liability',
      blocks: [
        {
          type: 'p',
          text: 'To the maximum extent permitted by law, the Operator is not liable for any direct or indirect damages, including loss of data, arising from the use of or inability to use the Service.',
        },
      ],
    },
    {
      heading: '7. Changes',
      blocks: [
        {
          type: 'p',
          text: 'The Operator may amend these Terms. A new version takes effect when published on this page, unless the new version states otherwise. For material changes the effective date is updated.',
        },
      ],
    },
    {
      heading: '8. Governing law and contact',
      blocks: [
        {
          type: 'p',
          text: 'These Terms are governed by the law of the Russian Federation.',
        },
        {
          type: 'p',
          text: [
            'For questions related to the Service and these Terms, contact ',
            { text: contactEmail, href: `mailto:${contactEmail}` },
            '.',
          ],
        },
      ],
    },
  ],
};

export const termsContent: Record<LegalLang, LegalContent> = { ru, en };

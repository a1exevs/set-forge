import type { LegalContent, LegalLang } from '@shared';

/** Effective date of the current version. Bump when the terms text changes. */
export const TERMS_EFFECTIVE_DATE = '2026-07-18';

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
          text: 'Сервис предоставляет инструменты для составления списков упражнений, ведения тренировок и отслеживания прогресса. Обработка персональных данных регулируется отдельной Политикой обработки персональных данных.',
        },
      ],
    },
    {
      heading: '2. Условия предоставления Сервиса',
      blocks: [
        {
          type: 'p',
          text: 'Сервис предоставляется «как есть» (as is) и «как доступно» (as available). Оператор не гарантирует бесперебойную работу, отсутствие ошибок и сохранность данных, а также вправе в любой момент изменить или прекратить работу Сервиса.',
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
          text: 'Данные о тренировках, которые вы вносите, принадлежат вам. Вы можете в любой момент удалить свою учётную запись вместе со всеми связанными данными в разделе «Профиль». Обработка персональных данных описана в Политике обработки персональных данных.',
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
          text: 'Оператор вправе изменять условия Соглашения. Актуальная версия всегда доступна на этой странице; при существенных изменениях обновляется дата вступления в силу. Продолжение использования Сервиса означает согласие с новой редакцией.',
        },
      ],
    },
    {
      heading: '8. Применимое право',
      blocks: [
        {
          type: 'p',
          text: 'К Соглашению применяется законодательство Российской Федерации. По вопросам, связанным с Соглашением, используйте контакт, указанный в Политике обработки персональных данных.',
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
          text: 'The Service provides tools to build exercise lists, run workouts, and track progress. Processing of personal data is governed by the separate Privacy Policy.',
        },
      ],
    },
    {
      heading: '2. Provision of the Service',
      blocks: [
        {
          type: 'p',
          text: 'The Service is provided "as is" and "as available". The Operator does not guarantee uninterrupted or error-free operation or the preservation of data, and may change or discontinue the Service at any time.',
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
          text: 'The workout data you enter belongs to you. You can delete your account and all related data at any time in the "Profile" section. Processing of personal data is described in the Privacy Policy.',
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
          text: 'The Operator may amend these Terms. The current version is always available on this page; for material changes the effective date is updated. Continued use of the Service means acceptance of the new version.',
        },
      ],
    },
    {
      heading: '8. Governing law',
      blocks: [
        {
          type: 'p',
          text: 'These Terms are governed by the law of the Russian Federation. For questions related to these Terms, use the contact listed in the Privacy Policy.',
        },
      ],
    },
  ],
};

export const termsContent: Record<LegalLang, LegalContent> = { ru, en };

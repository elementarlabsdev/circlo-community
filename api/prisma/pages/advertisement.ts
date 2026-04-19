const domain = process.env.DOMAIN || 'circlo.app';

export const advertisement = {
  ru: [
    {
      id: crypto.randomUUID(),
      type: 'paragraph',
      content:
        'Circlo предлагает эффективные инструменты для продвижения вашего бренда, продуктов или услуг среди активной и вовлеченной аудитории. Мы ценим доверие наших пользователей, поэтому отдаем предпочтение качественной и релевантной рекламе.',
      isEmpty: false,
      settings: {},
    },
    {
      id: crypto.randomUUID(),
      type: 'heading',
      content: 'Наши форматы',
      isEmpty: false,
      settings: { level: 2 },
    },
    {
      id: crypto.randomUUID(),
      type: 'bulletList',
      content: [
        {
          content: '<strong>Нативная реклама</strong>: Публикации, которые органично вписываются в ленту и не вызывают отторжения.',
          children: [],
        },
        {
          content: '<strong>Баннерная реклама</strong>: Размещение в стратегических зонах платформы для максимального охвата.',
          children: [],
        },
        {
          content: '<strong>Спонсорство разделов</strong>: Уникальная возможность закрепить ваш бренд за определенной тематической категорией.',
          children: [],
        },
      ],
      isEmpty: false,
      settings: { listStyle: 'bullet' },
    },
    {
      id: crypto.randomUUID(),
      type: 'heading',
      content: 'Преимущества работы с нами',
      isEmpty: false,
      settings: { level: 2 },
    },
    {
      id: crypto.randomUUID(),
      type: 'orderedList',
      content: [
        {
          content: '<strong>Целевая аудитория</strong>: Мы поможем вам найти именно тех пользователей, которые заинтересованы в вашем предложении.',
          children: [],
        },
        {
          content: '<strong>Прозрачная аналитика</strong>: Вы получите подробные отчеты об эффективности вашей кампании.',
          children: [],
        },
        {
          content: '<strong>Гибкие условия</strong>: Мы готовы обсуждать индивидуальные условия сотрудничества для крупных проектов.',
          children: [],
        },
      ],
      isEmpty: false,
      settings: { listStyle: 'ordered' },
    },
    {
      id: crypto.randomUUID(),
      type: 'paragraph',
      content:
        `Для получения подробного медиакита и обсуждения условий сотрудничества, пожалуйста, свяжитесь с нашим рекламным отделом: <strong>ads@${domain}</strong>`,
      isEmpty: false,
      settings: {},
    },
  ],
  en: [
    {
      id: crypto.randomUUID(),
      type: 'paragraph',
      content:
        'Circlo offers effective tools for promoting your brand, products, or services among an active and engaged audience. We value the trust of our users, so we prefer high-quality and relevant advertising.',
      isEmpty: false,
      settings: {},
    },
    {
      id: crypto.randomUUID(),
      type: 'heading',
      content: 'Our Formats',
      isEmpty: false,
      settings: { level: 2 },
    },
    {
      id: crypto.randomUUID(),
      type: 'bulletList',
      content: [
        {
          content: '<strong>Native Advertising</strong>: Posts that fit organically into the feed and do not cause rejection.',
          children: [],
        },
        {
          content: '<strong>Banner Advertising</strong>: Placement in strategic areas of the platform for maximum reach.',
          children: [],
        },
        {
          content: '<strong>Section Sponsorship</strong>: A unique opportunity to link your brand to a specific thematic category.',
          children: [],
        },
      ],
      isEmpty: false,
      settings: { listStyle: 'bullet' },
    },
    {
      id: crypto.randomUUID(),
      type: 'heading',
      content: 'Benefits of Working with Us',
      isEmpty: false,
      settings: { level: 2 },
    },
    {
      id: crypto.randomUUID(),
      type: 'orderedList',
      content: [
        {
          content: '<strong>Target Audience</strong>: We will help you find exactly those users who are interested in your offer.',
          children: [],
        },
        {
          content: '<strong>Transparent Analytics</strong>: You will receive detailed reports on the effectiveness of your campaign.',
          children: [],
        },
        {
          content: '<strong>Flexible Terms</strong>: We are ready to discuss individual terms of cooperation for large projects.',
          children: [],
        },
      ],
      isEmpty: false,
      settings: { listStyle: 'ordered' },
    },
    {
      id: crypto.randomUUID(),
      type: 'paragraph',
      content:
        `To receive a detailed media kit and discuss terms of cooperation, please contact our advertising department: <strong>ads@${domain}</strong>`,
      isEmpty: false,
      settings: {},
    },
  ],
};

const getConfig = () => {
  if (typeof window !== 'undefined') {
    const configElement = window.document.getElementById('app-config');
    if (configElement) {
      try {
        return JSON.parse(configElement.textContent || '{}');
      } catch (e) {}
    }
  }
  return {};
};

const config = getConfig();

export const environment = {
  baseUrl: config.baseUrl || (config.domain ? 'https://' + config.domain : 'http://localhost:4200'),
  locale: config.locale || 'en',
  apiUrl: config.apiUrl || '/api/v1/',
  websocketUrl: config.websocketUrl || '',
  cookie: {
    path: '/',
    secure: true,
    sameSite: 'Lax',
    domain: config.domain || undefined,
  }
};

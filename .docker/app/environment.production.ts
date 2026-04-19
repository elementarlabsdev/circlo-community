export const environment = {
  locale: '${LOCALE}',
  apiUrl: '${APP_API_URL}',
  websocketUrl: '${WEBSOCKET_URL}',
  cookie: {
    path: '/',
    secure: false,
    sameSite: 'Lax',
    domain: undefined as string | undefined,
  }
};

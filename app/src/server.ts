import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import { AUTH_TOKEN_NAME } from '@/types';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();
app.use(cookieParser());

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  const authToken = req.cookies[AUTH_TOKEN_NAME];
  angularApp
    .handle(req, { circloAuthToken: authToken })
    .then(async (response) => {
      if (!response) return next();

      const appApiUrl = process.env['APP_API_URL'] || '';
      let domain = process.env['DOMAIN'];

      // If DOMAIN is not set, try to extract it from APP_API_URL or BASE_URL
      if (!domain) {
        if (appApiUrl.startsWith('http')) {
          try {
            domain = new URL(appApiUrl).hostname;
          } catch (e) {}
        }
        if (!domain && process.env['BASE_URL']?.startsWith('http')) {
          try {
            domain = new URL(process.env['BASE_URL']).hostname;
          } catch (e) {}
        }
      }

      // Default to localhost if still not found
      domain = domain || 'localhost';

      const config = {
        locale: process.env['LOCALE'] || 'en',
        apiUrl: appApiUrl || '/api/v1/',
        websocketUrl: process.env['WEBSOCKET_URL'] || '',
        baseUrl: process.env['BASE_URL'] || (domain === 'localhost' ? 'http://localhost:4000' : 'https://' + domain),
        domain: domain
      };

      let html = await response.text();
      html = html.replace(
        '<script id="app-config" type="application/json">{}</script>',
        `<script id="app-config" type="application/json">${JSON.stringify(config)}</script>`
      );

      return response ? writeResponseToNodeResponse(new Response(html, response), res) : next();
    })
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createNodeRequestHandler(app);

const Koa = require('koa') as typeof import('koa');
const cors = require('@koa/cors') as typeof import('@koa/cors');

import fileRoutes from './routes/file-routes';
import githubRoutes from './routes/github-routes';

const app = new Koa();

app.use(cors());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const error = err as any;
    ctx.status = error.status || 500;
    ctx.body = error.message;
    ctx.app.emit('error', error, ctx);
  }
});

app
  .use(fileRoutes.routes())
  .use(githubRoutes.routes());

app.listen(3001);
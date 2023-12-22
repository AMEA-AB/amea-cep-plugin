const Koa = require('koa') as typeof import('koa');
const Router = require('@koa/router') as typeof import('@koa/router');

import downloadFile from './helpers/downloadFile';

const app = new Koa();
const router = new Router();

router.get('/download-file', async (ctx) => {
  const url = ctx.query.url;
  if (!url) {
    ctx.throw(400, 'url required');
    return;
  }
  if(typeof url !== 'string') {
    ctx.throw(400, 'url must be a string');
    return;
  }
  const path = await downloadFile(url);
  ctx.body = path
});

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

app.use(router.routes()).use(router.allowedMethods());

app.listen(3001);
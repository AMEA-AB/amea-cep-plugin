const Koa = require('koa') as typeof import('koa');

import createUniqueFileRouter from './endpoints/createUniqueFile';
import downloadFileRouter from './endpoints/downloadFile';

const app = new Koa();

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
  .use(createUniqueFileRouter.routes())
  .use(downloadFileRouter.routes());

app.listen(3001);
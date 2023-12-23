const Koa = require('koa') as typeof import('koa');
const Router = require('@koa/router') as typeof import('@koa/router');
const cors = require('@koa/cors') as typeof import('@koa/cors');

const app = new Koa();
const router = new Router();

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


router.get('/ping', (ctx) => {
  ctx.body = 'pong';
});

app.use(router.routes());

app.listen(3001);
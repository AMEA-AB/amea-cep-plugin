const Koa = require('koa') as typeof import('koa');
const Router = require('@koa/router') as typeof import('@koa/router');

const app = new Koa();
const router = new Router();

router.get('/ping', async (ctx, next) => {
  ctx.body = 'pong';
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3001);
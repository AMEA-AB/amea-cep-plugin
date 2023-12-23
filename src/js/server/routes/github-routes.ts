import Router from '@koa/router';
import downloadFileFromGithub from '../helpers/downloadFileFromGithub';

const router = new Router({prefix: '/github'});

router.get('/file/download', async (ctx) => {
    const path = ctx.query.path;
    if (!path) {
      ctx.throw(400, 'path required');
      return;
    }
    if(typeof path !== 'string') {
      ctx.throw(400, 'path must be a string');
      return;
    }
    const filePath = await downloadFileFromGithub(path);
    ctx.body = filePath
  });

export default router;
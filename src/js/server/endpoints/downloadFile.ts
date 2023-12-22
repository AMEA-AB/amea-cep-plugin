import Router from '@koa/router';
import downloadFile from '../helpers/downloadFile';

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

export default router;
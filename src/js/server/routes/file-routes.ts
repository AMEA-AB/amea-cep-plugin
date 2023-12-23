import Router from '@koa/router';
import createUniqueFile from '../helpers/createUniqueFile';
import downloadFile from '../helpers/downloadFile';

const router = new Router({ prefix: '/file' });

router.get('/create-unique', (ctx) => {
  const folder = ctx.query.folder;
  const filename = ctx.query.filename;
  if (!folder || !filename) {
    ctx.throw(400, 'folder & filename required');
    return;
  }
  if (typeof folder !== 'string' || typeof filename !== 'string') {
    ctx.throw(400, 'folder & filename must be a strings');
    return;
  }
  const path = createUniqueFile(folder, filename);
  ctx.body = path
});

router.get('/download', async (ctx) => {
  const url = ctx.query.url;
  if (!url) {
    ctx.throw(400, 'url required');
    return;
  }
  if (typeof url !== 'string') {
    ctx.throw(400, 'url must be a string');
    return;
  }
  const path = await downloadFile(url);
  ctx.body = path
});

export default router;
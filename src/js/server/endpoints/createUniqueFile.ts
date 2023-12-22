import Router from '@koa/router';
import createUniqueFile from '../helpers/createUniqueFile';

const router = new Router();

router.get('/create-unique-file', (ctx) => {
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

export default router;
import {Router} from 'express'
import redisRouter from './redis.route.js';
import sqlRouter from './sql.route.js';

const router = Router();

router.get('/', (req, res) => {
    res.send('Hello, Express + TypeScript!');
});

router.use('/redis', redisRouter);
router.use('/sql', sqlRouter);


export default router;
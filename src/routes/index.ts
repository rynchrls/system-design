import {Router} from 'express'
import redisRouter from './redis.route.js';

const router = Router();

router.get('/', (req, res) => {
    res.send('Hello, Express + TypeScript!');
});

router.use('/redis', redisRouter);


export default router;
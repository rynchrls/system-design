import {Router} from 'express'
import RedisController from '../controller/redis.controller.js';

const redisRouter = Router();


redisRouter.get('/cache', RedisController.getCache)
redisRouter.get('/cache-aside/:userId', RedisController.cacheAside)
redisRouter.post('/write-through', RedisController.writeThrough)
redisRouter.post('/write-behind', RedisController.writeBehind)


export default redisRouter;
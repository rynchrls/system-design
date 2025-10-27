import {Router} from 'express'
import RedisController from '../controller/redis.controller.js';

const redisRouter = Router();


redisRouter.get('/cache', RedisController.getCache)
redisRouter.get('/cache-aside/:userId', RedisController.cacheAside)



export default redisRouter;
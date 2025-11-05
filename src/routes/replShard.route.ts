import {Router} from 'express'
import { ReplShardController } from '../controller/replShard.controller.js';

const replShardRoute = Router();
replShardRoute.post('/', ReplShardController.insertDataToshard)
replShardRoute.get('/:userId', ReplShardController.readOnSecondary)


export default replShardRoute;
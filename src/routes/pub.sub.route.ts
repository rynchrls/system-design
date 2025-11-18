import {Router} from 'express'
import PubSubController from '../controller/pub.sub.controller.js';

const pubSubRouter = Router();


pubSubRouter.post('/publish', PubSubController.pubUser)


export default pubSubRouter; 
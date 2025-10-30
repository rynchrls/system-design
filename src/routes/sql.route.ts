import { Router } from "express";
import SQLController from "../controller/sql.controller.js";


const sqlRouter = Router()


sqlRouter.post('/', SQLController.createRecord)
sqlRouter.get('/:id', SQLController.getUserOders)




export default sqlRouter;
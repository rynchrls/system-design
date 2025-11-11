import { Router } from "express";
import SQLController from "../controller/sql.controller.js";
import UrlShortenerController from "../controller/urlShortener.controller.js";

const urlShortenerRoute = Router();

urlShortenerRoute.post("/", UrlShortenerController.createShortURl);
urlShortenerRoute.get("/:shortCode", UrlShortenerController.getOriginalUrl);

export default urlShortenerRoute;

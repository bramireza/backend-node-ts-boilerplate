import express, { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { routes } from "./routes";
import { config } from "./configs";
import { failureResponse } from "./utils";

const app: express.Application = express();
console.log(config.FRONT_URL);

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Routes middleware
routes(app);

// Route 404 default
app.use((req: Request, res: Response): Response => {
  return failureResponse({
    res,
    status: 404,
    message: req.originalUrl + " not found",
  });
});
export default app;

import express, { Request, Response } from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import requestIp from "request-ip";

import { Morgan } from "./shared/morgan";
import router from "./app/routes";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import handleStripeWebhook from "./stripe/handleStripeWebhook";

const app = express();


//TRUST PROXY (important for real IP in production)
app.set("trust proxy", true);


//LOGGING (first)
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);


//CORS
app.use(cors());


//STRIPE WEBHOOK (MUST be before json parser)
app.post(
  "/api/v1/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);


//BODY PARSERS (after webhook)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//CLIENT IP
app.use(requestIp.mw());


//STATIC FILES
app.use(express.static("uploads"));


//API ROUTES
app.use("/api/v1", router);


//ROOT
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Beauty-Run Backend!");
});


//GLOBAL ERROR HANDLER
app.use(globalErrorHandler);


// NOT FOUND ROUTE
app.use((req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "Not Found",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;
import express, { Request, Response } from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import { Morgan } from "./shared/morgan";
import router from './app/routes';
import globalErrorHandler from './app/middleware/globalErrorHandler';
import requestIp from 'request-ip';;
const app = express();


// morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);


//body parser
app.use(cors());
app.use(express.json({
    verify: (req: any, res, buf) => {
        if (req.originalUrl.includes('/webhook')) {
            req.rawBody = buf;
        }
    }
}));
app.use(express.urlencoded({ extended: true }));
app.use(requestIp.mw());


//file retrieve
app.use(express.static('uploads'));

//router
app.use('/api/v1', router);




app.get("/", (req: Request, res: Response) => {
    res.send("Welcome to Beauty-Run Backend!");
})

//global error handle
app.use(globalErrorHandler);

// handle not found route
app.use((req: Request, res: Response) => {
    res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Not Found",
        errorMessages: [
            {
                path: req.originalUrl,
                message: "API DOESN'T EXIST"
            }
        ]
    })
});

export default app;

import { Router } from "express";
import { PaymentController } from "./payment.controller";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../../../enum/user";
import express from "express";

const router = Router();



router.post(
    "/checkout-session/:referenceId",
    PaymentController.createCheckoutSession
)

router.get(
    "/onboard",
    auth(USER_ROLES.VENDOR),
    PaymentController.onboardVendorController
)

router.get(
    "/onboard-status",
    auth(USER_ROLES.VENDOR),
    PaymentController.checkOnboardingStatusController
)

router.get(
    "/",
    auth(USER_ROLES.ADMIN),
    PaymentController.getPaymentsController
)
router.get(
    "/:id",
    auth(USER_ROLES.ADMIN),
    PaymentController.getPaymentByIdController
)



export const PaymentRoutes = router;

import express from "express";
import { createCategoryZod, updateCategoryZod } from "./category.validation";
import { fileAndBodyProcessorUsingDiskStorage } from "../../middleware/processReqBody";
import validateRequest from "../../middleware/validateRequest";
import { categoryController } from "./category.controller";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../../../enum/user";


const router = express.Router();

router.post("/create",
    auth(USER_ROLES.ADMIN),
    fileAndBodyProcessorUsingDiskStorage(),
    validateRequest(createCategoryZod),
    categoryController.createCategory);

router.get("/",
    auth(USER_ROLES.VENDOR, USER_ROLES.ADMIN, USER_ROLES.CUSTOMER),
     categoryController.getAllCategories
    );

router.patch("/:id",
    auth(USER_ROLES.ADMIN),
    fileAndBodyProcessorUsingDiskStorage(),
    validateRequest(updateCategoryZod),
    categoryController.updateCategory);

router.delete("/:id",
    auth(USER_ROLES.ADMIN),
    categoryController.deleteCategory
);


export const CategoryRoutes = router;

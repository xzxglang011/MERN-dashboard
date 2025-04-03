import express from 'express'

import {
  getAllProperties,
  getPropertyDetail,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controller/property.controller.js"

const propertyRouter = express.Router();

propertyRouter.route("/").get(getAllProperties);
propertyRouter.route("/:id").get(getPropertyDetail);
propertyRouter.route("/").post(createProperty);
propertyRouter.route("/:id").patch(updateProperty);
propertyRouter.route("/:id").delete(deleteProperty);

export default propertyRouter

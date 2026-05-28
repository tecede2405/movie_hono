import { Hono } from "hono";

import {
  getDonatesHandler,
  createDonateHandler,
  updateDonateHandler,
  deleteDonateHandler,
  deleteAllDonatesHandler,
} from "../controllers/donate.controller";

import {
  authMiddleware,
  adminMiddleware,
} from "../middlewares/auth.middleware";

import type { D1Database } from "@cloudflare/workers-types";

type Bindings = {
  movie_db: D1Database;
};

const donateRoute = new Hono<{
  Bindings: Bindings;
}>();

// public
donateRoute.get("/", getDonatesHandler);

donateRoute.post("/", createDonateHandler);

// admin only
donateRoute.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateDonateHandler
);

donateRoute.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteDonateHandler
);

donateRoute.delete(
  "/",
  authMiddleware,
  adminMiddleware,
  deleteAllDonatesHandler
);

export default donateRoute;
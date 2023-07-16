import express, { Router } from "express";
import authRouter from "./auth.router";
import userRouter from "./user.router";

const allRoutes = [
  ["auth", authRouter],
  ["user", userRouter],
];

export const routes = (app: express.Application): void => {
  allRoutes.forEach(([path, controller]) => {
    app.use(`/${path}`, <Router>controller);
  });
};

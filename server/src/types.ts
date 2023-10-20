import {Redis} from "ioredis";
import {Request,Response } from "express";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";

declare module "express-session" {
    interface Session {
      userId?: any; // You can adjust the type of userId as needed
    }
  }

  

declare global {
  namespace Express {
    interface Session {
      cookie: any
    }
  }
}

export type MyContext = {
  
    req:Request & {
       
        session: Express.Session
    };
    redis: Redis;
    res:Response;
    userLoader: ReturnType<typeof createUserLoader>
    updootLoader: ReturnType<typeof createUpdootLoader>
}
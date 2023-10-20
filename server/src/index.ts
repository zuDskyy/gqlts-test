import "reflect-metadata";

import { ApolloServer } from "apollo-server-express";
import { HelloResolver } from "./resolvers/hello";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from 'express';
import cors from "cors";
import session from 'express-session';
import Redis from 'ioredis';
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import RedisStore from "connect-redis";
import { createConnection } from "typeorm";
import { User } from "./entities/Users";
import { Post } from "./entities/Post";
import path from "path"
import { Updoot } from "./entities/Updoot";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";


//rerun
const main = async () => {
    const conn = await createConnection({
        type: "postgres",
        database: "postgres",
        username: "postgres",
        password: "Okliko123",
        host: "localhost",
        port: 5433,
        logging: true,
        synchronize: true,
        migrations: [path.join(__dirname, "./migrations/*")],
        entities: [Post, User, Updoot]

    })

    await conn.runMigrations();

    //  await Post.delete({});
    const app = express();






    // Create a Redis client
    const redis = new Redis();


    app.use(
        cors({
            origin: "http://localhost:3000",
            credentials: true,
        })
    )
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis, // Pass the Redis client
                disableTouch: true,

            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                httpOnly: true, // Prevent client-side access to the cookie
                sameSite: 'lax', // Protection against CSRF attacks
                secure: __prod__, // Use secure cookies in production
            },
            saveUninitialized: false, // Don't save uninitialized sessions
            secret: 'your-secret-key', // Replace with your own secret key
            resave: false, // Don't save sessions on every request if not modified
        })
    );



    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,

        }),
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground(), // Add this line to enable Playground
        ],

        context: ({ req, res }) => ({
            req,
            res,
            redis,
            userLoader: createUserLoader(),
            updootLoader: createUpdootLoader()
        }),

    });

    await apolloServer.start();

    apolloServer.applyMiddleware({
        app,
        cors: false
    })



    app.listen(4000, () => {
        console.log(" server listening to 4000")
    })



};


main().catch((error) => {
    console.log(error)
});
import { Arg, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import { User } from "../entities/Users";
import { MyContext } from "../types";
import argon2 from "argon2"
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 as uuid } from "uuid";
@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;

}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver(User)
export class UserResolver {


    @FieldResolver(() => String)
    email(@Root() user:User, @Ctx() {req} : MyContext){
       if(req.session.userId === user.id){
          return user.email;
       }

       return "";
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() { redis, req }: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length <= 2) {
            return {
                errors: [
                    {
                        field: "newPassword",
                        message: "length must be contain greater than 2 "
                    }
                ]
            }
        }
        const key = FORGOT_PASSWORD_PREFIX + token
        const userId = await redis.get(key);
        if (!userId) {
            return {
                errors: [
                    {
                        field: "token",
                        message: " token expired"
                    },
                ],
            };
        }
        const _userId = parseInt(userId)
        const user = await User.findOne({ where: { id: _userId } });

        if (!user) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "user no longer exists"
                    }
                ]
            }
        }

        User.update(
            { id: _userId },
            { password: await argon2.hash(newPassword) }
        );



        await redis.del(key)
        req.session.userId = user.id;

        return { user }

    }



    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() {  redis }: MyContext
    ) {
        const user = await User.findOne({where : { email} })

        const token = uuid()

        await redis.set(
            FORGOT_PASSWORD_PREFIX + token,
            user?.id as number,
            "EX",
            1000 * 60 * 60 * 24 * 3
        );
        if (!user) {
            return true;
        }
        await sendEmail(
            email,
            `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
        );


        return true;
    }

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() {  req }: MyContext
    ) {
        if (!req.session.userId) {
            return null
        } else {
            const user = await User.findOne( { where : {id: req.session.userId} });
            return user;
        }
    }


    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {  req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options);
        if (errors) {
            return { errors }
        }


        const hashedPassword = await argon2.hash(options.password);
       
        const user =  User.create({ email: options.email, username: options.username, password: hashedPassword });
        try {
          await  User.save(user)
        } catch (err) {
            if (err.code === "23505") {
                return {
                    errors: [
                        {
                            field: 'username',
                            message: "username already taken"
                        }
                    ]
                }
            }
        }

        req.session.userId = user.id;
        return {
            user
        };
    }






    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() {  req }: MyContext
    ): Promise<UserResponse> {
        const user = await User.findOne( usernameOrEmail.includes("@") ? {where: { email: usernameOrEmail }} : { where: {  username: usernameOrEmail }});
        if (!user) {
            return {
                errors: [{
                    field: "usernameOrEmail",
                    message: "that username doesn't exist"
                }],
            }
        }
        const valid = await argon2.verify(user.password, password);
        if (!valid) {
            return {
                errors: [{
                    field: "password",
                    message: "incorrect password"
                }],
            }
        }


        req.session.userId = user.id;

        return {
            user,
        }
    }

    @Mutation(() => User, { nullable: true })
    async updateUser(
        @Arg("id") id: number,
        @Arg("username", () => String, { nullable: true }) username: string,
      
    ): Promise<User | null> {
        const user = await User.findOne({where :  {id} });
        if (!user) {
            return null;
        }
        if (typeof username !== "undefined") {
         
            await User.update({id},{username})
        }

        return user;
    }




    @Mutation(() => Boolean)
    logout(

        @Ctx() { req, res }: MyContext
    ) {

        return new Promise((resolve) => {
            req.session.destroy((err) => {
                res.clearCookie(COOKIE_NAME);

                if (err) {
                    console.log(err);
                    resolve(false);
                    return;
                }
                resolve(true);
            })
        })
    }
}
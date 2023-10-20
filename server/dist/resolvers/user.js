"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Users_1 = require("../entities/Users");
const argon2_1 = __importDefault(require("argon2"));
const constants_1 = require("../constants");
const UsernamePasswordInput_1 = require("./UsernamePasswordInput");
const validateRegister_1 = require("../utils/validateRegister");
const sendEmail_1 = require("../utils/sendEmail");
const uuid_1 = require("uuid");
let FieldError = class FieldError {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    (0, type_graphql_1.ObjectType)()
], FieldError);
let UserResponse = class UserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Users_1.User, { nullable: true }),
    __metadata("design:type", Users_1.User)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
let UserResolver = class UserResolver {
    email(user, { req }) {
        if (req.session.userId === user.id) {
            return user.email;
        }
        return "";
    }
    changePassword(token, newPassword, { redis, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (newPassword.length <= 2) {
                return {
                    errors: [
                        {
                            field: "newPassword",
                            message: "length must be contain greater than 2 "
                        }
                    ]
                };
            }
            const key = constants_1.FORGOT_PASSWORD_PREFIX + token;
            const userId = yield redis.get(key);
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
            const _userId = parseInt(userId);
            const user = yield Users_1.User.findOne({ where: { id: _userId } });
            if (!user) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "user no longer exists"
                        }
                    ]
                };
            }
            Users_1.User.update({ id: _userId }, { password: yield argon2_1.default.hash(newPassword) });
            yield redis.del(key);
            req.session.userId = user.id;
            return { user };
        });
    }
    forgotPassword(email, { redis }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield Users_1.User.findOne({ where: { email } });
            const token = (0, uuid_1.v4)();
            yield redis.set(constants_1.FORGOT_PASSWORD_PREFIX + token, user === null || user === void 0 ? void 0 : user.id, "EX", 1000 * 60 * 60 * 24 * 3);
            if (!user) {
                return true;
            }
            yield (0, sendEmail_1.sendEmail)(email, `<a href="http://localhost:3000/change-password/${token}">reset password</a>`);
            return true;
        });
    }
    me({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return null;
            }
            else {
                const user = yield Users_1.User.findOne({ where: { id: req.session.userId } });
                return user;
            }
        });
    }
    register(options, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, validateRegister_1.validateRegister)(options);
            if (errors) {
                return { errors };
            }
            const hashedPassword = yield argon2_1.default.hash(options.password);
            const user = Users_1.User.create({ email: options.email, username: options.username, password: hashedPassword });
            try {
                yield Users_1.User.save(user);
            }
            catch (err) {
                if (err.code === "23505") {
                    return {
                        errors: [
                            {
                                field: 'username',
                                message: "username already taken"
                            }
                        ]
                    };
                }
            }
            req.session.userId = user.id;
            return {
                user
            };
        });
    }
    login(usernameOrEmail, password, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield Users_1.User.findOne(usernameOrEmail.includes("@") ? { where: { email: usernameOrEmail } } : { where: { username: usernameOrEmail } });
            if (!user) {
                return {
                    errors: [{
                            field: "usernameOrEmail",
                            message: "that username doesn't exist"
                        }],
                };
            }
            const valid = yield argon2_1.default.verify(user.password, password);
            if (!valid) {
                return {
                    errors: [{
                            field: "password",
                            message: "incorrect password"
                        }],
                };
            }
            req.session.userId = user.id;
            return {
                user,
            };
        });
    }
    updateUser(id, username) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield Users_1.User.findOne({ where: { id } });
            if (!user) {
                return null;
            }
            if (typeof username !== "undefined") {
                yield Users_1.User.update({ id }, { username });
            }
            return user;
        });
    }
    logout({ req, res }) {
        return new Promise((resolve) => {
            req.session.destroy((err) => {
                res.clearCookie(constants_1.COOKIE_NAME);
                if (err) {
                    console.log(err);
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }
};
exports.UserResolver = UserResolver;
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Users_1.User, Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "email", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('token')),
    __param(1, (0, type_graphql_1.Arg)('newPassword')),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)('email')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    (0, type_graphql_1.Query)(() => Users_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UsernamePasswordInput_1.UsernamePasswordInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('usernameOrEmail')),
    __param(1, (0, type_graphql_1.Arg)('password')),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Users_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Arg)("username", () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "logout", null);
exports.UserResolver = UserResolver = __decorate([
    (0, type_graphql_1.Resolver)(Users_1.User)
], UserResolver);
//# sourceMappingURL=user.js.map
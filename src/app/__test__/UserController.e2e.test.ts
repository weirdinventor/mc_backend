import path from "path";
import {UserController} from "../modules/authentication/UserController";
import express from "express";
import {configureExpress} from "../config/express";
import {mockExpressResponse} from "./__mocks__/mockExpressResponse";
import {SignupCommand} from "../modules/authentication/commands/SignupCommand";
import {SignInCommand} from "../modules/authentication/commands/SignInCommand";
import {CreateProfileCommand} from "../modules/authentication/commands/CreateProfileCommand";
import {mockIdentityRequest} from "./__mocks__/mockIdentityRequest";
import {UserRole} from "../../core/write/domain/types/UserRole";
import {UserGender} from "../../core/write/domain/types/UserGender";

require("dotenv").config({
  path: path.resolve(__dirname + "/config/test.env"),
});

describe("E2E - UserController", () => {
  let userController: UserController;

  beforeAll(async () => {
    const app = express();
    const container = await configureExpress(app);
    userController = container.get(UserController);
  });

  it("should signup a user", async () => {
    const result = (await userController.signup(
      mockExpressResponse as any,
      SignupCommand.setProperties({
        email: "farouk@gmail.com",
        password: "azerty",
      })
    )) as any;
    expect(result.token).toBeDefined();
  });

  it("should signIn a user", async () => {
    const result = (await userController.signIn(
      mockExpressResponse as any,
      SignInCommand.setProperties({
        email: "farouk@gmail.com",
        password: "azerty",
      })
    )) as any;
    expect(result.token).toBeDefined();
  });

  it("should create a user profile", async () => {
    const result = (await userController.createProfile(
      mockExpressResponse as any,
      mockIdentityRequest({
        id: "50a41582-f9ed-459d-af77-63c1d9c11afc",
        email: "rir@yomail.com",
        role: UserRole.USER,
      }) as any,
      CreateProfileCommand.setProperties({
        firstname: "Ayoub",
        lastname: "Farouk",
        username : "johndoe",
        gender : UserGender.UNKNOWN
      })
    )) as any;
    expect(result.firstname).toEqual("Ayoub");
    expect(result.lastname).toEqual("Farouk");
    expect(result.id).toEqual("50a41582-f9ed-459d-af77-63c1d9c11afc");
  });
});

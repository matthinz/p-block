import { ParsedType, V } from "../../src";

const Registration = V.isObject()
  .withProperties({
    email: V.isString().matches(/@/),
    confirmEmail: V.isString(),
    password: V.isString().minLength(10).maxLength(255),
    confirmPassword: V.isString(),
  })
  .propertiesMatch("confirmEmail", "email", "emailMustMatch")
  .propertiesMatch("confirmPassword", "password", "passwordMustMatch");

import { ParsedType, P } from "../../src";

const Registration = P.object()
  .withProperties({
    email: P.string().matches(/@/),
    confirmEmail: P.string(),
    password: P.string().minLength(10).maxLength(255),
    confirmPassword: P.string(),
  })
  .propertiesMatch("confirmEmail", "email", "emailMustMatch")
  .propertiesMatch("confirmPassword", "password", "passwordMustMatch");

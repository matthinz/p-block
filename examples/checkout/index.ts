import http from "http";
import { V } from "../../src";

const Item = V.isObject().withProperties({
  id: V.isString()
    .minLength(10)
    .maxLength(10)
    .matches(/^[a-z0-9]/),
});

const Address = V.isObject().withProperties({
  line1: V.isString(),
  line2: V.isString().optional(),
  line3: V.isString().optional(),
  city: V.isString().maxLength(255),
  region: V.isString().maxLength(255),
  postalCode: V.isString().maxLength(20),
  country: V.isString().length(2),
});

const PaymentInfo = V.isObject().withProperties({
  cardNumber: V.isString().length(12),
  name: V.isString(),
  expiry: V.isObject()
    .withProperties({
      month: V.isNumber().truncated().between(1, 12),
      year: V.isNumber()
        .truncated()
        .greaterThanOrEqualTo(new Date().getFullYear()),
    })
    .passes(({ month, year }) => {
      const now = new Date();
      return (
        year > now.getFullYear() ||
        (year === now.getFullYear() && month - 1 > now.getMonth())
      );
    }),
});

const Order = V.isObject().withProperties({
  items: V.isArray().of(Item),
  payment: PaymentInfo,
  billingAddress: Address,
  shippingAddress: Address,
  couponCode: V.isString(),
});

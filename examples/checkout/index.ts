import { P } from "../../src";

const Item = P.object().withProperties({
  id: P.string()
    .minLength(10)
    .maxLength(10)
    .matches(/^[a-z0-9]/),
});

const Address = P.object().withProperties({
  line1: P.string(),
  line2: P.string().optional(),
  line3: P.string().optional(),
  city: P.string().maxLength(255),
  region: P.string().maxLength(255),
  postalCode: P.string().maxLength(20),
  country: P.string().length(2),
});

const PaymentInfo = P.object().withProperties({
  cardNumber: P.string().length(12),
  name: P.string(),
  expiry: P.object()
    .withProperties({
      month: P.integer().between(1, 12),
      year: P.integer().greaterThanOrEqualTo(new Date().getFullYear()),
    })
    .passes(({ month, year }) => {
      const now = new Date();
      return (
        year > now.getFullYear() ||
        (year === now.getFullYear() && month - 1 > now.getMonth())
      );
    }),
});

const Order = P.object().withProperties({
  items: P.array().of(Item),
  payment: PaymentInfo,
  billingAddress: Address,
  shippingAddress: Address,
  couponCode: P.string(),
});

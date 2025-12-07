import { init } from "@kinde/management-api-js";

init({
  kindeDomain: process.env.KINDE_DOMAIN!,
  clientId: process.env.KINDE_MANAGEMENT_CLIENT_ID!,
  clientSecret: process.env.KINDE_MANAGEMENT_CLIENT_SECRET!,
});

export {};

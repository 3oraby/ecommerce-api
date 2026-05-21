const Roles = require("../enums/roles.enum");
const AccountStatus = require("../enums/accountStatus.enum");

module.exports = [
  {
    name: "Admin User",
    email: "admin@example.com",
    plain_password: "Admin123",
    role: Roles.ADMIN,
    account_status: AccountStatus.ACTIVE,
  },
  {
    name: "Seller One",
    email: "seller@example.com",
    plain_password: "Seller123",
    role: Roles.SELLER,
    account_status: AccountStatus.ACTIVE,
  },
  {
    name: "Seller Two",
    email: "seller2@example.com",
    plain_password: "Seller123",
    role: Roles.SELLER,
    account_status: AccountStatus.ACTIVE,
  },
  {
    name: "Customer John",
    email: "customer@example.com",
    plain_password: "Customer123",
    role: Roles.CUSTOMER,
    account_status: AccountStatus.ACTIVE,
  },
  {
    name: "Customer Jane",
    email: "customer2@example.com",
    plain_password: "Customer123",
    role: Roles.CUSTOMER,
    account_status: AccountStatus.ACTIVE,
  },
];

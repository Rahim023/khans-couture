import test from "node:test";
import assert from "node:assert/strict";
import dns from "node:dns/promises";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Sequence from "../models/Sequence.js";
import { login, register } from "../controllers/authController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test("signup and login work without OTP while protecting admin access", async (t) => {
  const previousSecret = process.env.JWT_SECRET;
  const previousAdmins = process.env.ADMIN_EMAILS;
  process.env.JWT_SECRET = "test-secret";
  process.env.ADMIN_EMAILS = "admin@example.test";
  t.after(() => {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
    if (previousAdmins === undefined) delete process.env.ADMIN_EMAILS;
    else process.env.ADMIN_EMAILS = previousAdmins;
  });

  const body = {
    username: "Test",
    email: "customer@example.test",
    password: "Password123",
    phone: "1234567890",
    postalCode: "12345",
    country: "USA",
  };
  t.mock.method(dns, "resolveMx", async () => [{ exchange: "mail.example.test" }]);
  const find = t.mock.method(User, "findOne", async () => null);
  t.mock.method(Sequence, "findByIdAndUpdate", async () => ({ value: 1 }));
  const save = t.mock.method(User.prototype, "save", async function () { return this; });

  const signup = response();
  await register({ body }, signup);
  assert.equal(signup.statusCode, 201);
  assert.equal(signup.body.isAdmin, false);
  assert.equal(jwt.verify(signup.body.token, "test-secret").id, String(signup.body._id));
  assert.equal(save.mock.calls.length, 1);
  assert.equal(save.mock.calls[0].this.emailVerified, false);

  find.mock.mockImplementation(async () => ({ emailVerified: false }));
  const duplicate = response();
  await register({ body }, duplicate);
  assert.equal(duplicate.statusCode, 400);
  assert.equal(save.mock.calls.length, 1);

  const reserved = response();
  await register({ body: { ...body, email: "ADMIN@example.test" } }, reserved);
  assert.equal(reserved.statusCode, 400);

  find.mock.mockImplementation(async () => ({
    _id: "existing-id",
    email: "admin@example.test",
    username: "Existing",
    role: "customer",
    emailVerified: false,
    matchPassword: async (password) => password === "correct-password",
  }));
  const existingLogin = response();
  await login({ body: { email: "admin@example.test", password: "correct-password" } }, existingLogin);
  assert.equal(existingLogin.statusCode, 200);
  assert.equal(existingLogin.body.isAdmin, false);
  assert.ok(existingLogin.body.token);

  const wrongPassword = response();
  await login({ body: { email: "admin@example.test", password: "wrong" } }, wrongPassword);
  assert.equal(wrongPassword.statusCode, 401);

  const denied = response();
  requireAdmin({ user: { email: "admin@example.test", role: "customer", emailVerified: false } }, denied, () => assert.fail("Unverified email granted admin access"));
  assert.equal(denied.statusCode, 403);
  let allowed = false;
  requireAdmin({ user: { email: "admin@example.test", role: "customer", emailVerified: true } }, response(), () => { allowed = true; });
  assert.equal(allowed, true);
  allowed = false;
  requireAdmin({ user: { email: "admin@example.test", role: "admin", emailVerified: false } }, response(), () => { allowed = true; });
  assert.equal(allowed, true);
});

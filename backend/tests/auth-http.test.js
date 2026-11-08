import test from "node:test";
import assert from "node:assert/strict";
import dns from "node:dns/promises";
import bcrypt from "bcryptjs";
import express from "express";
import User from "../models/User.js";
import Sequence from "../models/Sequence.js";
import authRoutes from "../routes/authRoutes.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

test("HTTP signup, customer login and admin authorization", async (t) => {
  const previousSecret = process.env.JWT_SECRET;
  const previousAdmins = process.env.ADMIN_EMAILS;
  process.env.JWT_SECRET = "http-test-secret";
  process.env.ADMIN_EMAILS = "reserved@example.test";
  t.after(() => {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
    if (previousAdmins === undefined) delete process.env.ADMIN_EMAILS;
    else process.env.ADMIN_EMAILS = previousAdmins;
  });

  const users = new Map();
  t.mock.method(dns, "resolveMx", async () => [{ exchange: "mail.example.test" }]);
  t.mock.method(Sequence, "findByIdAndUpdate", async () => ({ value: users.size + 1 }));
  t.mock.method(User, "findOne", async ({ email }) => users.get(email) || null);
  t.mock.method(User, "findById", (id) => ({
    select: async () => [...users.values()].find((user) => String(user._id) === String(id)) || null,
  }));
  t.mock.method(User.prototype, "save", async function () {
    this.password = await bcrypt.hash(this.password, 10);
    users.set(this.email, this);
    return this;
  });

  const admin = new User({
    username: "Admin",
    email: "admin@example.test",
    password: "AdminPassword123",
    phone: "1234567890",
    postalCode: "12345",
    country: "USA",
    role: "admin",
    emailVerified: false,
  });
  await admin.save();
  const pendingCustomer = new User({
    username: "Pending customer",
    email: "pending@example.test",
    password: "CustomerPassword123",
    phone: "1234567890",
    postalCode: "12345",
    country: "USA",
    role: "customer",
    emailVerified: false,
  });
  await pendingCustomer.save();
  const allowlistedAdmin = new User({
    username: "Allowlisted admin",
    email: "reserved@example.test",
    password: "AdminPassword123",
    phone: "1234567890",
    postalCode: "12345",
    country: "USA",
    role: "customer",
    emailVerified: true,
  });
  await allowlistedAdmin.save();

  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.get("/api/admin/probe", protect, requireAdmin, (_req, res) => res.json({ ok: true }));
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const post = (path, body) => fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const accessAdmin = (token) => fetch(`${base}/admin/probe`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const signupData = {
    username: "Customer",
    email: " Customer@example.test ",
    password: "CustomerPassword123",
    phone: "1234567890",
    postalCode: "12345",
    country: "USA",
  };
  const signupResponse = await post("/auth/register", signupData);
  const signup = await signupResponse.json();
  assert.equal(signupResponse.status, 201);
  assert.equal(signup.email, "customer@example.test");
  assert.equal(signup.isAdmin, false);
  assert.ok(signup.token);
  assert.notEqual(users.get(signup.email).password, signupData.password);
  assert.equal((await accessAdmin(signup.token)).status, 403);

  const loginResponse = await post("/auth/login", { email: signupData.email, password: signupData.password });
  const login = await loginResponse.json();
  assert.equal(loginResponse.status, 200);
  assert.equal(login.isAdmin, false);
  assert.ok(login.token);
  assert.equal((await post("/auth/login", { email: signupData.email, password: "wrong" })).status, 401);
  assert.equal((await post("/auth/register", signupData)).status, 400);
  assert.equal((await post("/auth/register", { ...signupData, email: "reserved@example.test" })).status, 400);
  const pendingLoginResponse = await post("/auth/login", { email: pendingCustomer.email, password: "CustomerPassword123" });
  const pendingLogin = await pendingLoginResponse.json();
  assert.equal(pendingLoginResponse.status, 200);
  assert.equal(pendingLogin.isAdmin, false);
  assert.ok(pendingLogin.token);
  assert.equal((await post("/auth/login", { email: pendingCustomer.email, password: "wrong" })).status, 401);
  assert.equal((await post("/auth/verify-email", {})).status, 404);

  const adminResponse = await post("/auth/login", { email: admin.email, password: "AdminPassword123" });
  const adminLogin = await adminResponse.json();
  assert.equal(adminResponse.status, 200);
  assert.equal(adminLogin.isAdmin, true);
  assert.equal((await accessAdmin(adminLogin.token)).status, 200);
  const allowlistedResponse = await post("/auth/login", { email: allowlistedAdmin.email, password: "AdminPassword123" });
  const allowlistedLogin = await allowlistedResponse.json();
  assert.equal(allowlistedResponse.status, 200);
  assert.equal(allowlistedLogin.isAdmin, true);
  assert.equal((await accessAdmin(allowlistedLogin.token)).status, 200);
  assert.equal((await accessAdmin("invalid")).status, 401);
});

test("the user model hashes passwords before saving", async () => {
  const user = new User({
    username: "Customer",
    email: "customer@example.test",
    password: "CustomerPassword123",
    phone: "1234567890",
    postalCode: "12345",
    country: "USA",
  });
  await new Promise((resolve, reject) => {
    User.schema.s.hooks.execPre("save", user, [], (error) => error ? reject(error) : resolve());
  });
  assert.notEqual(user.password, "CustomerPassword123");
  assert.equal(await user.matchPassword("CustomerPassword123"), true);
  assert.equal(await user.matchPassword("wrong"), false);
});

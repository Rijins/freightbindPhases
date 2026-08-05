const dotenv = require("dotenv");
dotenv.config({ path: require("path").join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const User = require("../models/User");
const { loginUser } = require("../services/authService");
const { ROLES } = require("../constants/roles");

const ACCOUNTS = [
  {
    role: ROLES.ADMIN,
    currentEmail: "test@x.com",
    newEmail: "admin@freightbind.ai",
    newPassword: "Admin@123",
  },
  {
    role: ROLES.LOGISTICS_DIRECTOR,
    currentEmail: "phase2.director.1785251419@freightbind.test",
    newEmail: "director@freightbind.ai",
    newPassword: "Director@123",
  },
  {
    role: ROLES.CARRIER_DISPATCHER,
    currentEmail: "hub@gmail.com",
    newEmail: "dispatcher@freightbind.ai",
    newPassword: "Dispatcher@123",
  },
  {
    role: ROLES.HUB_OPERATOR,
    currentEmail: "phase2.hub.1785251419@freightbind.test",
    newEmail: "hub@freightbind.ai",
    newPassword: "Hub@123",
  },
];

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set in freightbind-backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const updated = [];
  for (const account of ACCOUNTS) {
    const user = await User.findOne({ email: account.currentEmail }).select("+password");
    if (!user) {
      throw new Error(`No user found for ${account.role} with email ${account.currentEmail} - nothing was created`);
    }
    if (user.role !== account.role) {
      throw new Error(`Email ${account.currentEmail} maps to role "${user.role}", expected "${account.role}" - aborting`);
    }

    const collision = await User.findOne({ email: account.newEmail, _id: { $ne: user._id } });
    if (collision) {
      throw new Error(`New email ${account.newEmail} already belongs to another user - aborting`);
    }

    user.email = account.newEmail;
    user.password = account.newPassword;
    await user.save();

    updated.push({ role: user.role, email: user.email, id: user._id.toString() });
    console.log(`UPDATED ${user.role}: ${account.currentEmail} -> ${user.email} (id kept: ${user._id})`);
  }

  console.log("\nVerifying logins with new credentials:");
  for (const account of ACCOUNTS) {
    try {
      const { user } = await loginUser({ email: account.newEmail, password: account.newPassword });
      console.log(`LOGIN OK  ${user.role} <${user.email}> (id: ${user._id})`);
    } catch (err) {
      throw new Error(`Login verification failed for ${account.newEmail}: ${err.message}`);
    }
  }

  console.log("\nAll 4 development accounts updated and verified.");
};

run()
  .catch((err) => {
    console.error(`\nFAILED: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

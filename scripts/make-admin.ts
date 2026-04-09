/**
 * Run this script once to promote a user to admin role.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json scripts/make-admin.ts <email>
 *
 * Or with tsx:
 *   npx tsx scripts/make-admin.ts your@email.com
 *
 * Prerequisites:
 *   - Set MONGODB_URI in your .env file
 *   - The user must already have registered on the platform
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI not set in environment");
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error("❌  Usage: npx tsx scripts/make-admin.ts <email>");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI!);

  // Better-auth stores users in the "user" collection by default
  const db = mongoose.connection.db!;
  const result = await db.collection("user").updateOne(
    { email: email.toLowerCase() },
    { $set: { role: "admin" } }
  );

  if (result.matchedCount === 0) {
    console.error(`❌  No user found with email: ${email}`);
  } else if (result.modifiedCount === 0) {
    console.log(`ℹ️  User ${email} is already an admin.`);
  } else {
    console.log(`✅  User ${email} has been promoted to admin.`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});

// scripts/test-bcrypt.js
import bcrypt from "bcryptjs";

const plain = "Simran@123"; // the password you try to login with
const hash = "$2b$10$bfZdOtqWvH5l35fVd2EzrOeBBL8T6ZAsGv6J33cGbF6LtE8H0hoda"; // replace with stored value

(async () => {
  try {
    console.log("plain:", JSON.stringify(plain));
    console.log("hash length:", hash.length);
    const ok = await bcrypt.compare(plain.trim(), String(hash).trim());
    console.log("bcrypt.compare =>", ok);
  } catch (e) {
    console.error("error:", e);
  }
})();

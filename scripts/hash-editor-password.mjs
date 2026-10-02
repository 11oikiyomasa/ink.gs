import { randomBytes, pbkdf2 } from "node:crypto";
import { promisify } from "node:util";

const ITERATIONS = 310_000;
const HASH_BYTES = 32;
const SALT_BYTES = 16;
const pbkdf2Async = promisify(pbkdf2);

let input = "";
for await (const chunk of process.stdin) input += chunk.toString("utf8");
const password = input.replace(/\r?\n$/u, "");
if (!password || Buffer.byteLength(password, "utf8") > 1024) {
  process.stderr.write("Provide a non-empty editor password of at most 1024 bytes on stdin.\n");
  process.exitCode = 2;
} else {
  const salt = randomBytes(SALT_BYTES);
  const derived = await pbkdf2Async(password, salt, ITERATIONS, HASH_BYTES, "sha256");
  const encoded = (value) => Buffer.from(value).toString("base64url");
  process.stdout.write(`pbkdf2-sha256$${ITERATIONS}$${encoded(salt)}$${encoded(derived)}\n`);
}
input = "";

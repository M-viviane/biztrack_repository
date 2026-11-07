// Loads and checks the app's configuration once, at startup.
// If anything is missing or invalid, the app refuses to start and prints
// what is wrong, so a bad deploy fails immediately instead of on a customer.
//
// Use it everywhere instead of process.env:
//   const env = require("../config/env");
//   env.JWT_SECRET, env.PORT, env.DATABASE_URL, env.NODE_ENV, env.CORS_ORIGINS

require("dotenv").config({ quiet: true });

const { z } = require("zod");

// The placeholder from .env.example. It is long enough to pass the length
// check, so reject it by name: nobody should run with a published secret.
const EXAMPLE_SECRET = "replace-with-a-long-random-secret";

const schema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    PORT: z.coerce.number().int().min(1).max(65535).default(5000),

    DATABASE_URL: z
      .string({ error: "DATABASE_URL is required" })
      .regex(
        /^postgres(ql)?:\/\/.+/,
        "DATABASE_URL must be a postgresql:// connection string",
      ),

    JWT_SECRET: z
      .string({ error: "JWT_SECRET is required" })
      .min(32, "JWT_SECRET must be at least 32 characters")
      .refine((value) => value !== EXAMPLE_SECRET, {
        message:
          "JWT_SECRET is still the example placeholder; set a real secret",
      }),

    // Comma-separated list of websites allowed to call the API,
    // e.g. "https://app.example.com,https://admin.example.com".
    CORS_ORIGINS: z
      .string()
      .default("")
      .transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean),
      )
      .pipe(
        z.array(
          z.url({
            message:
              "each CORS_ORIGINS entry must be a full URL, e.g. https://app.example.com",
          }),
        ),
      ),
  })
  .refine(
    (config) =>
      config.NODE_ENV !== "production" || config.CORS_ORIGINS.length > 0,
    {
      path: ["CORS_ORIGINS"],
      message: "CORS_ORIGINS is required in production",
    },
  );

// Checks a set of variables and returns the config, or throws an error
// listing every problem. Exported separately so tests can call it directly.
const parseEnv = (source) => {
  const result = schema.safeParse(source);

  if (!result.success) {
    const problems = result.error.issues
      .map(
        (issue) => `  - ${issue.path.join(".") || "config"}: ${issue.message}`,
      )
      .join("\n");

    throw new Error(
      `Invalid configuration, the app will not start:\n${problems}`,
    );
  }

  return result.data;
};

// Frozen so no code can change the config while the app is running.
module.exports = Object.freeze({ ...parseEnv(process.env), parseEnv });

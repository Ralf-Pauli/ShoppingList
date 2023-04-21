import { z } from "zod";

const lowerCaseRegex = /(?=.*[a-z])/;
const upperCaseRegex = /(?=.*[A-Z])/;
const numberRegex = /(?=.*\d)/;
const symbolRegex = /(?=.*[@$!%*?&])/;
const minLength = 8;

export const AuthSchema = z.object({
    email: z.string().email(),
    password: z.string()
    .min(minLength, "Password must be at least 8 characters long.")
    .regex(lowerCaseRegex, "Password must contain at least one lowercase letter.")
    .regex(upperCaseRegex, "Password must contain at least one uppercase letter.")
    .regex(numberRegex, "Password must contain at least one number.")
    .regex(symbolRegex, "Password must contain at least one symbol."),
});

export type User = z.infer<typeof AuthSchema>;
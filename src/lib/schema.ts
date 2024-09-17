import { z } from "zod";

const registerSchema = {
  username: z.string().regex(/^.{2,15}$/, {
    message: "Minimum 2 and maximum 15 characters.",
  }),
  fullname: z.string().min(1, { message: "Full name can't be empty" }),
  // email: z.string().email({ message: "Invalid email" }),
  password: z
    .string({
      required_error: "Password can not be empty.",
    })
    .regex(/^.{8,20}$/, {
      message: "Minimum 8 and maximum 20 characters.",
    })
    .regex(/(?=.*\d)/, {
      message: "At least one digit.",
    })
    .regex(/[$&+,:;=?@#|'<>.^*()%!-]/, {
      message: "At least one special character.",
    }),
};

const loginSchema = {
  password: z.string().min(1, { message: "Password can't be empty" }),
  username: z.string().min(1, { message: "Username can't be empty" }),
};

export { registerSchema, loginSchema };

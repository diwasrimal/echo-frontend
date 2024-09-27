import { createElement, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { SERVER_URL } from "@/lib/constants";
import { makePayload } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link, Navigate } from "react-router-dom";
import { registerSchema } from "@/lib/schema";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const formSchema = z
  .object({
    fullname: registerSchema.fullname,
    username: registerSchema.username,
    password: registerSchema.password,
    confPassword: registerSchema.password,
  })
  .refine(({ password, confPassword }) => password === confPassword, {
    path: ["confPassword"],
    message: "Passwords do not match.",
  });

export default function Login() {
  const [err, setErr] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: "",
      username: "",
      password: "",
      confPassword: "",
    },
  });

  function registerHandler({
    fullname,
    username,
    password,
  }: z.infer<typeof formSchema>) {
    setRequesting(true);
    setErr("");
    const url = `${SERVER_URL}/api/register`;
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullname, username, password }),
    })
      .then((res) => makePayload(res))
      .then((payload) => {
        if (payload.ok) {
          setRegistered(true);
        } else {
          setErr(payload.message);
        }
      })
      .catch((err) => console.log(`Error fetching ${url}: ${err}`))
      .finally(() => setRequesting(false));
  }

  if (registered) return <Navigate to="../login" />;

  return (
    <div className="w-full flex flex-col gap-2">
      <h1 className="text-3xl font-bold mb-4">Register</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(registerHandler)}
          className="space-y-4"
        >
          {/* Username */}
          <FormField
            control={form.control}
            name="fullname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fullname</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    // placeholder="Enter your full name"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This will be your display name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Email */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    // placeholder="Choose a username"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This will be your unique identifier
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={passwordVisible ? "text" : "password"}
                      // placeholder="Create a password"
                      {...field}
                    />
                    <div
                      className="absolute inset-y-0 right-0 flex cursor-pointer items-center p-3 text-muted-foreground"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {createElement(passwordVisible ? EyeIcon : EyeOffIcon, {
                        className: "h-6 w-6",
                      })}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={passwordVisible ? "text" : "password"}
                      // placeholder="Confirm password"
                      {...field}
                    />
                    <div
                      className="absolute inset-y-0 right-0 flex cursor-pointer items-center p-3 text-muted-foreground"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {createElement(passwordVisible ? EyeIcon : EyeOffIcon, {
                        className: "h-6 w-6",
                      })}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormMessage>{err}</FormMessage>
          <Button disabled={requesting} type="submit">
            Create account
          </Button>
        </form>
      </Form>
      <div className="text-sm mt-2">
        Already have an account?{" "}
        <Link to="/get-started/login" className="underline">
          Login
        </Link>
      </div>
    </div>
  );
}

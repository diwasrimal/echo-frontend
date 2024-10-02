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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link, Navigate } from "react-router-dom";
import { loginSchema } from "@/lib/schema";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const formSchema = z.object({
  username: loginSchema.username,
  password: loginSchema.password,
});

export default function Login() {
  const [err, setErr] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const { setUserId, loggedIn, setLoggedIn } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Login handler sets proper AuthContext states after successful login
  function loginHandler({ username, password }: z.infer<typeof formSchema>) {
    setRequesting(true);
    setErr("");
    const url = `${SERVER_URL}/api/login`;
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => makePayload(res))
      .then((payload) => {
        if (payload.ok) {
          setLoggedIn(true);
          setUserId(payload.userId as number);
          localStorage.setItem("jwt", payload.jwt);
          // setJwt(payload.jwt);
        } else {
          setErr(payload.message);
        }
      })
      .catch((err) => console.log(`Error fetching ${url}: ${err}`))
      .finally(() => setRequesting(false));
  }

  if (loggedIn) return <Navigate to="/" />;

  return (
    <div className="w-full flex flex-col gap-4">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(loginHandler)} className="space-y-4">
          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    {...field}
                  />
                </FormControl>
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
                      placeholder="Enter password"
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
          <Button disabled={requesting} type="submit" className="flex gap-2">
            {requesting && <LoadingSpinner />}
            Login
          </Button>
        </form>
      </Form>
      <div className="mt-2 text-sm">
        Don't have an account?{" "}
        <Link to="../register" className="underline">
          Register
        </Link>
      </div>
    </div>
  );
}

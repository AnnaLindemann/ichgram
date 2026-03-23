import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginUser } from "@/features/auth/api/login";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schemas";

import { setAuthSession } from "@/lib/auth-storage";

import logo from "@/assets/icons/Logo.svg";
import background from "@/assets/images/Background.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError("");
    clearErrors();

    try {
      const { response, data } = await loginUser(values);

      if (!response.ok) {
        if ("fieldErrors" in data && data.fieldErrors) {
          for (const [field, message] of Object.entries(data.fieldErrors)) {
            if (!message) continue;

            setError(field as keyof LoginFormValues, {
              type: "server",
              message,
            });
          }
        }

        const hasFieldErrors =
          "fieldErrors" in data &&
          data.fieldErrors &&
          Object.keys(data.fieldErrors).length > 0;

        if (!hasFieldErrors) {
          const message =
            "message" in data && typeof data.message === "string"
              ? data.message
              : "Login failed";

          setServerError(message);
        }

        return;
      }

      if (!("ok" in data) || !data.ok) {
        setServerError("Login failed");
        return;
      }

      setAuthSession({
        token: data.data.token,
        user: data.data.user,
      });

      navigate("/");
    } catch {
      setServerError("Network error. Please try again.");
    }
  }

return (
  <main className="min-h-screen bg-[#fafafa] px-4">
    <div className="mx-auto flex min-h-screen max-w-[1050px] items-start justify-center gap-8 pt-[72px]">
      <div className="hidden lg:flex flex-shrink-0 items-start justify-center">
        <img
          src={background}
          alt="App preview"
          className="h-auto w-[470px]"
        />
      </div>

      <section className="w-full max-w-[410px]">
        <div className="border border-[#dbdbdb] bg-white px-10 pb-8 pt-10">
          <div className="mb-8 flex justify-center">
            <img
              src={logo}
              alt="Ichgram"
              className="h-auto w-[195px] object-contain"
            />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
            <div>
              <input
                type="text"
                placeholder="Username, or email"
                autoComplete="username"
                {...register("identifier")}
                className="h-11 w-full rounded-[3px] border border-[#dbdbdb] bg-[#fafafa] px-3 text-[13px] text-black outline-none placeholder:text-[#8e8e8e]"
              />
              {errors.identifier && (
                <p className="mt-1 text-xs leading-4 text-[#ed4956]">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                {...register("password")}
                className="h-11 w-full rounded-[3px] border border-[#dbdbdb] bg-[#fafafa] px-3 text-[13px] text-black outline-none placeholder:text-[#8e8e8e]"
              />
              {errors.password && (
                <p className="mt-1 text-xs leading-4 text-[#ed4956]">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="pt-1 text-center text-xs leading-4 text-[#ed4956]">
                {serverError}
              </p>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-[8px] bg-[#0095f6] text-sm font-semibold text-white transition hover:bg-[#1877f2] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Logging in..." : "Log in"}
              </button>
            </div>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#dbdbdb]" />
            <span className="text-[13px] font-semibold text-[#737373]">OR</span>
            <div className="h-px flex-1 bg-[#dbdbdb]" />
          </div>

          <Link
            to="/trouble-logging-in"
            className="mt-8 block text-center text-xs text-[#00376b]"
          >
            Forgot password?
          </Link>
        </div>

        <div className="mt-3 border border-[#dbdbdb] bg-white px-8 py-6 text-center">
          <p className="text-sm text-black">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-[#0095f6]">
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </div>
  </main>
);
}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerUser } from "@/features/auth/api/register";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/register.schema";
import { setAuthSession } from "@/lib/auth-storage";
import logo from "../assets/icons/Logo.svg";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      fullName: "",
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setServerError("");
    clearErrors();

    try {
      const { response, data } = await registerUser(values);

      if (!response.ok) {
        if ("fieldErrors" in data && data.fieldErrors) {
          for (const [field, message] of Object.entries(data.fieldErrors)) {
            if (!message) {
              continue;
            }

            setError(field as keyof RegisterFormValues, {
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
              : "Registration failed";

          setServerError(message);
        }

        return;
      }

      if (!("ok" in data) || !data.ok) {
        setServerError("Registration failed");
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
    <main className="min-h-screen bg-[#fafafa] px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full items-center justify-center">
        <section className="mt-[-20px] w-full max-w-[430px] sm:mt-[-28px]">
          <div className="border border-[#dbdbdb] bg-white px-8 pb-6 pt-8 sm:px-10 sm:pb-7 sm:pt-9">
            <div className="mb-5 flex justify-center">
              <img
                src={logo}
                alt="Ichgram"
                className="h-auto w-[190px] object-contain sm:w-[200px]"
              />
            </div>

            <p className="mx-auto mb-7 max-w-[300px] text-center text-[19px] font-semibold leading-6 text-[#737373] sm:text-[20px]">
              Sign up to see photos and videos from your friends.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  {...register("email")}
                  className="h-10 w-full rounded-[3px] border border-[#dbdbdb] bg-[#fafafa] px-3 text-[13px] text-black outline-none placeholder:text-[#8e8e8e]"
                />
                {errors.email && (
                  <p className="mt-1 text-xs leading-4 text-[#ed4956]">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  autoComplete="name" 
                  {...register("fullName")}
                  className="h-10 w-full rounded-[3px] border border-[#dbdbdb] bg-[#fafafa] px-3 text-[13px] text-black outline-none placeholder:text-[#8e8e8e]"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs leading-4 text-[#ed4956]">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Username"
                  autoComplete="username"
                  {...register("username")}
                  className="h-10 w-full rounded-[3px] border border-[#dbdbdb] bg-[#fafafa] px-3 text-[13px] text-black outline-none placeholder:text-[#8e8e8e]"
                />
                {errors.username && (
                  <p className="mt-1 text-xs leading-4 text-[#ed4956]">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  autoComplete="new-password" 
                  {...register("password")}
                  className="h-10 w-full rounded-[3px] border border-[#dbdbdb] bg-[#fafafa] px-3 text-[13px] text-black outline-none placeholder:text-[#8e8e8e]"
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

              <p className="pt-4 text-center text-xs leading-4 text-[#737373]">
                People who use our service may have uploaded your contact
                information to Instagram.{" "}
                <span className="cursor-pointer text-[#00376b]">
                  Learn More
                </span>
              </p>

              <p className="px-2 pt-2 text-center text-xs leading-4 text-[#737373]">
                By signing up, you agree to our{" "}
                <span className="cursor-pointer text-[#00376b]">Terms</span>,{" "}
                <span className="cursor-pointer text-[#00376b]">Privacy</span>{" "}
                <span className="cursor-pointer text-[#00376b]">Policy</span>{" "}
                and{" "}
                <span className="cursor-pointer text-[#00376b]">
                  Cookies Policy
                </span>
                .
              </p>

              <div className="pb-2 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 w-full rounded-[8px] bg-[#0095f6] text-sm font-semibold text-white transition hover:bg-[#1877f2] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Signing up..." : "Sign up"}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-[12px] border border-[#dbdbdb] bg-white px-8 py-6 text-center sm:px-10">
            <p className="text-sm text-black">
              Have an account?{" "}
              <Link to="/login" className="font-semibold text-[#0095f6]">
                Log in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
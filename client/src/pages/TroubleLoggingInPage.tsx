import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import logo from "../assets/icons/Logo.svg";

const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Enter your email or username"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

type ForgotPasswordSuccessResponse = {
  ok: true;
  message: string;
  data?: {
    resetToken?: string;
  };
};

type ForgotPasswordErrorResponse = {
  ok?: false;
  message?: string;
  fieldErrors?: Partial<Record<keyof ForgotPasswordFormValues, string>>;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function LockCircleIcon() {
  return (
    <div className="flex h-[96px] w-[96px] items-center justify-center rounded-full border-2 border-black">
      <svg
        width="42"
        height="42"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7 10V7.5C7 4.73858 9.23858 2.5 12 2.5C14.7614 2.5 17 4.73858 17 7.5V10"
          stroke="black"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <rect
          x="5"
          y="10"
          width="14"
          height="11"
          rx="2.5"
          stroke="black"
          strokeWidth="1.7"
        />
      </svg>
    </div>
  );
}

export default function TroubleLoggingInPage() {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setServerError("");
    setSuccessMessage("");
    clearErrors();

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data: ForgotPasswordSuccessResponse | ForgotPasswordErrorResponse =
        await response.json();

      if (!response.ok) {
        if ("fieldErrors" in data && data.fieldErrors) {
          for (const [field, message] of Object.entries(data.fieldErrors)) {
            if (!message) {
              continue;
            }

            setError(field as keyof ForgotPasswordFormValues, {
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
              : "Failed to send reset instructions";

          setServerError(message);
        }

        return;
      }

      if (!("ok" in data) || !data.ok) {
        setServerError("Failed to send reset instructions");
        return;
      }

      setSuccessMessage("Demo mode: email sending is not implemented");
    } catch {
      setServerError("Network error. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <header className="h-[60px] border-b border-[#dbdbdb] bg-[#fafafa]">
        <div className="flex h-full items-center pl-8">
          <img
            src={logo}
            alt="Ichgram"
            className="h-auto w-[112px] object-contain"
          />
        </div>
      </header>

      <div className="px-4 py-8 sm:px-6">
        <div className="mx-auto flex min-h-[calc(100vh-60px-4rem)] w-full items-start justify-center pt-[48px] sm:pt-[64px]">
          <section className="w-full max-w-[430px]">
            <div className="border border-[#dbdbdb] bg-white px-10 pb-8 pt-8">
              <div className="flex flex-col items-center">
                <LockCircleIcon />

                <h1 className="mt-4 text-center text-[30px] font-semibold leading-[36px] text-[#262626]">
                  Trouble logging in?
                </h1>

                <span className="mt-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                  Demo
                </span>

                <p className="mt-3 max-w-[320px] text-center text-[16px] leading-[21px] text-[#737373]">
                  Enter your email, phone, or username and we&apos;ll send you a
                  link to get back into your account.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-7"
                noValidate
              >
                <div>
                  <input
                    type="text"
                    placeholder="Email or Username"
                    autoComplete="username"
                    {...register("identifier")}
                    className="h-11 w-full rounded-[3px] border border-[#dbdbdb] bg-[#fafafa] px-3 text-[14px] text-black outline-none placeholder:text-[#8e8e8e]"
                  />

                  {errors.identifier && (
                    <p className="mt-1 text-xs leading-4 text-[#ed4956]">
                      {errors.identifier.message}
                    </p>
                  )}
                </div>

                {serverError && (
                  <p className="pt-3 text-center text-xs leading-4 text-[#ed4956]">
                    {serverError}
                  </p>
                )}

                {successMessage && (
                  <p className="pt-3 text-center text-xs leading-4 text-[#737373]">
                    {successMessage}
                  </p>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-[8px] bg-[#0095f6] text-sm font-semibold text-white transition hover:bg-[#1877f2] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Sending..." : "Reset your password"}
                  </button>
                </div>
              </form>

              <div className="my-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#dbdbdb]" />
                <span className="text-[13px] font-semibold text-[#737373]">
                  OR
                </span>
                <div className="h-px flex-1 bg-[#dbdbdb]" />
              </div>

              <Link
                to="/register"
                className="block text-center text-[15px] font-semibold text-[#262626]"
              >
                Create new account
              </Link>
            </div>

            <div className="border-x border-b border-[#dbdbdb] bg-[#f5f5f5]">
              <Link
                to="/login"
                className="flex h-[52px] items-center justify-center text-[15px] font-semibold text-[#262626]"
              >
                Back to login
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
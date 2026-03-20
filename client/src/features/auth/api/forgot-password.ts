type ForgotPasswordResponse = {
  ok: boolean;
  message: string;
  data?: {
    resetToken?: string;
  };
};

type ForgotPasswordPayload = {
  identifier: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function forgotPasswordRequest(
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/forgot-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = (await response.json()) as ForgotPasswordResponse & {
    fieldErrors?: Record<string, string>;
  };

  if (!response.ok) {
    throw new Error(data.message || "Failed to reset password");
  }

  return data;
}
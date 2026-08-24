"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { loginSchema } from "@/features/auth/schema";
import type { LoginValues } from "@/features/auth/schema";

const inputClassName =
  "h-12 bg-slate-50/80 dark:bg-slate-900/50 border-slate-100 rounded-xl px-4 text-sm focus-visible:ring-primary";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError("Email atau password salah.");
      return;
    }

    router.push("/dashboard");
  });

  return (
    <AuthCard title="Masuk ke akun Anda">
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <fieldset disabled={isSubmitting} className="contents">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Masukkan email"
              aria-invalid={!!errors.email}
              {...register("email")}
              className={inputClassName}
            />
            {errors.email ? (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Password
            </Label>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="Masukkan password"
              aria-invalid={!!errors.password}
              showPasswordLabel="Tampilkan password"
              hidePasswordLabel="Sembunyikan password"
              {...register("password")}
              className={inputClassName}
            />
            {errors.password ? (
              <p className="text-destructive text-xs">
                {errors.password.message}
              </p>
            ) : null}
          </div>
        </fieldset>

        {serverError ? (
          <p className="text-destructive text-sm">{serverError}</p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-xl text-sm font-bold uppercase shadow-md shadow-primary/20 dark:shadow-none transition-all mt-2"
          loading={isSubmitting}
        >
          {isSubmitting ? "Sedang masuk..." : "Masuk"}
        </Button>
      </form>
    </AuthCard>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

import AuthCard from "@/components/AuthCard";
import AuthRedirect from "@/components/AuthRedirect";
import { setToken } from "@/lib/auth";
import api from "@/services/api";

const getErrorMessage = (error) =>
  error?.response?.data?.errors?.[0] ||
  error?.response?.data?.message ||
  "Unable to register. Please try again.";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    if (form.name.trim().length < 2) return "Name must be at least 2 characters.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setToken(data.token);
      router.replace("/dashboard");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthRedirect>
      <AuthCard title="Register" subtitle="Create your local Momentum account and start tracking.">
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          <label className="block">
            <span className="text-sm text-zinc-300">Name</span>
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-400"
              placeholder="Rehan"
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-300">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-400"
              placeholder="rehan@gmail.com"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-zinc-300">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                required
                className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-400"
                placeholder="Minimum 6 chars"
              />
            </label>

            <label className="block">
              <span className="text-sm text-zinc-300">Confirm</span>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
                required
                className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-400"
                placeholder="Repeat password"
              />
            </label>
          </div>

          {error ? (
            <p className="rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-medium text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            {loading ? "Creating account" : "Register"}
          </button>

          <p className="text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-300 hover:text-cyan-200">
              Login
            </Link>
          </p>
        </motion.form>
      </AuthCard>
    </AuthRedirect>
  );
}

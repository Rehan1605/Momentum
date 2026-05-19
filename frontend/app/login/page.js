"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { motion } from "framer-motion";

import AuthCard from "@/components/AuthCard";
import AuthRedirect from "@/components/AuthRedirect";
import { setToken } from "@/lib/auth";
import api from "@/services/api";

const getErrorMessage = (error) =>
  error?.response?.data?.message || "Unable to login. Please try again.";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
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
      <AuthCard title="Login" subtitle="Welcome back. Pick up the thread where you left it.">
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
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

          <label className="block">
            <span className="text-sm text-zinc-300">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-400"
              placeholder="Enter your password"
            />
          </label>

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
            {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
            {loading ? "Logging in" : "Login"}
          </button>

          <p className="text-center text-sm text-zinc-500">
            No account yet?{" "}
            <Link href="/register" className="text-cyan-300 hover:text-cyan-200">
              Register
            </Link>
          </p>
        </motion.form>
      </AuthCard>
    </AuthRedirect>
  );
}

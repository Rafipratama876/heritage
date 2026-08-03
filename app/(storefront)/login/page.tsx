"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineMail, HiOutlineLockClosed, HiEye, HiEyeOff } from "react-icons/hi";
import Breadcrumb from "@/components/Breadcrumb";
import Reveal from "@/components/Reveal";
import { Spinner } from "@/components/Skeletons";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password, rememberMe);
      router.push("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-content pt-32 pb-24">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Login" }]} />

      <div className="max-w-md mx-auto">
        <Reveal className="text-center mb-10">
          <p className="eyebrow mb-3">Customer Access</p>
          <h1 className="font-display text-4xl text-ivory">Login</h1>
          <p className="text-muted mt-3 text-sm">
            You never need to log in to browse the catalog — this just
            saves your details for future orders.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="label-frame bg-surface p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 px-4 py-3">
                {error}
              </p>
            )}

            <div>
              <label htmlFor="email" className="eyebrow block mb-2">
                Email
              </label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-canvas border border-line pl-11 pr-4 py-3.5 text-sm text-ivory placeholder:text-muted focus:border-brass outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="eyebrow block mb-2">
                Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-canvas border border-line pl-11 pr-11 py-3.5 text-sm text-ivory placeholder:text-muted focus:border-brass outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-brass p-1"
                >
                  {showPassword ? <HiEyeOff /> : <HiEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-brass w-4 h-4"
                />
                Remember me
              </label>
              <a href="#" className="text-brass hover:text-ivory transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-4 disabled:opacity-60"
            >
              {loading ? <Spinner /> : "Log In"}
            </button>
          </form>
        </Reveal>

        <p className="text-center text-sm text-muted mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brass hover:text-ivory transition-colors">
            Create one →
          </Link>
        </p>

        <p className="text-center text-sm text-muted mt-4">
          Prefer to just browse?{" "}
          <Link href="/products" className="text-brass hover:text-ivory transition-colors">
            View the catalog →
          </Link>
        </p>
      </div>
    </div>
  );
}
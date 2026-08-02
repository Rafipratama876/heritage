"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlinePhone,
  HiEye,
  HiEyeOff,
} from "react-icons/hi";
import Breadcrumb from "@/components/Breadcrumb";
import Reveal from "@/components/Reveal";
import { Spinner } from "@/components/Skeletons";
import { useAuth } from "@/components/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register({
        name,
        email,
        password,
        phone: phone.trim() || undefined,
      });
      router.push("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-content pt-32 pb-24">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Register" }]} />

      <div className="max-w-md mx-auto">
        <Reveal className="text-center mb-10">
          <p className="eyebrow mb-3">Customer Access</p>
          <h1 className="font-display text-4xl text-ivory">Create Account</h1>
          <p className="text-muted mt-3 text-sm">
            Register to save your details for future orders. Browsing the
            catalog never requires an account.
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
              <label htmlFor="name" className="eyebrow block mb-2">
                Full Name
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="name"
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-canvas border border-line pl-11 pr-4 py-3.5 text-sm text-ivory placeholder:text-muted focus:border-brass outline-none transition-colors"
                />
              </div>
            </div>

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
              <label htmlFor="phone" className="eyebrow block mb-2">
                Phone <span className="text-muted font-normal">(optional)</span>
              </label>
              <div className="relative">
                <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 812-3456-7890"
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-4 disabled:opacity-60"
            >
              {loading ? <Spinner /> : "Create Account"}
            </button>
          </form>
        </Reveal>

        <p className="text-center text-sm text-muted mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-brass hover:text-ivory transition-colors">
            Log in →
          </Link>
        </p>
      </div>
    </div>
  );
}
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const COMMISSIONER_EMAIL = "com@inzu.com";

export const roleDashboard: Record<string, string> = {
  TENANT: "/dashboard/tenant",
  OWNER: "/dashboard/owner",
  AGENT: "/dashboard/commissioner",
  ADMIN: "/dashboard/admin",
  commissioner: "/dashboard/commissioner",
};

const googleProvider = process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
  ? Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  : null;

const phoneProvider = Credentials({
  id: "phone-otp",
  name: "Phone OTP",
  credentials: {
    phone: { label: "Phone", type: "tel" },
    code: { label: "OTP", type: "text" },
    purpose: { label: "Purpose", type: "text" },
  },
  async authorize(credentials) {
    const phone = typeof credentials?.phone === "string" ? credentials.phone : "";
    const code = typeof credentials?.code === "string" ? credentials.code : "";
    const purpose = typeof credentials?.purpose === "string" ? credentials.purpose : "LOGIN";
    if (!phone || !code) return null;

    // Demo mode: the magic code "111111" bypasses the backend for pitch demos.
    // Remove or guard this block before going to production.
    if (code === "111111") {
      return {
        id: "demo-user",
        name: "Demo User",
        email: "demo@umutungo.rw",
        role: "TENANT",
      };
    }

    try {
      const response = await fetch(`${process.env.BACKEND_API_URL || "http://localhost:8080"}/api/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose, code }),
        cache: "no-store",
      });
      const payload = await response.json() as { user?: { id: string; email: string; name: string; role: string } };
      if (!response.ok || !payload.user) return null;
      return payload.user;
    } catch {
      return null;
    }
  },
});

const emailPasswordProvider = Credentials({
  id: "email-password",
  name: "Email and password",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const email = typeof credentials?.email === "string" ? credentials.email : "";
    const password = typeof credentials?.password === "string" ? credentials.password : "";
    if (!email || !password) return null;
    try {
      const response = await fetch(`${process.env.BACKEND_API_URL || "http://localhost:8080"}/api/auth/password/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });
      const payload = await response.json() as { user?: { id: string; email: string; name: string; role: string } };
      if (!response.ok || !payload.user) return null;
      return payload.user;
    } catch {
      return null;
    }
  },
});

const providers = [
  ...(googleProvider ? [googleProvider] : []),
  emailPasswordProvider,
  phoneProvider,
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers,
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    // Stamp role onto the JWT when the token is created / refreshed
    jwt({ token, user }) {
      if (token.email === COMMISSIONER_EMAIL) {
        token.role = "commissioner";
      }
      if (user?.role) token.role = user.role;
      if (user && !user.role) token.role = "TENANT";
      return token;
    },

    // Expose role + id on the client-side session object
    session({ session, token }) {
      if (token.sub)  session.user.id   = token.sub;
      if (token.role) session.user.role = token.role as string;
      return session;
    },

    // After sign-in, send the commissioner straight to their dashboard
    async redirect({ url, baseUrl }) {
      // If NextAuth passes a relative callbackUrl, honour it
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/"))     return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
});

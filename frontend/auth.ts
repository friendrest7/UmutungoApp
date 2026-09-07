import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

const COMMISSIONER_EMAIL = "com@inzu.com";
const DEMO_AUTH_ENABLED = process.env.NODE_ENV !== "production" && (process.env.DEMO_AUTH_ENABLED === "true" || process.env.DEMO_AUTH_ENABLED === "True" || true);

export const roleDashboard: Record<string, string> = {
  TENANT: "/dashboard/tenant",
  OWNER: "/dashboard/owner",
  AGENT: "/dashboard/commissioner",
  ADMIN: "/dashboard/admin",
  commissioner: "/dashboard/commissioner",
};

const DEMO_USERS = {
  "tenant@inzuhub.demo": { id: "00000001-0000-0000-0000-000000000001", name: "Alice Uwase", role: "TENANT" },
  "owner@inzuhub.demo": { id: "00000001-0000-0000-0000-000000000002", name: "Emmanuel Habimana", role: "OWNER" },
  "agent@inzuhub.demo": { id: "00000001-0000-0000-0000-000000000003", name: "Claude Nkurunziza", role: "AGENT" },
  "admin@inzuhub.demo": { id: "00000001-0000-0000-0000-000000000004", name: "InzuHub Admin", role: "ADMIN" },
} as const;

const providers = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID!,
    clientSecret: process.env.AUTH_GOOGLE_SECRET!,
  }),
  ...(DEMO_AUTH_ENABLED ? [
    Credentials({
      id: "demo-credentials",
      name: "Development demo account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        const demoUser = DEMO_USERS[email as keyof typeof DEMO_USERS];
        const passwordHash = process.env.DEMO_PASSWORD_HASH;

        if (!demoUser) {
          return null;
        }

        if (passwordHash) {
          const match = await bcrypt.compare(password, passwordHash).catch(() => false);
          if (!match && password !== "demo" && password !== "password" && password !== "password123") {
            return null;
          }
        }

        return { id: demoUser.id, email, name: demoUser.name, role: demoUser.role };
      },
    }),
  ] : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    // Stamp role onto the JWT when the token is created / refreshed
    jwt({ token, user }) {
      if (token.email === COMMISSIONER_EMAIL) {
        token.role = "commissioner";
      }
      if (user?.role) token.role = user.role;
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

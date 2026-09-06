import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const COMMISSIONER_EMAIL = "com@inzu.com";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    // Stamp role onto the JWT when the token is created / refreshed
    jwt({ token }) {
      if (token.email === COMMISSIONER_EMAIL) {
        token.role = "commissioner";
      }
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

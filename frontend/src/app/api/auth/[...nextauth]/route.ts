import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder_client_secret",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sync`, {
            email: user.email,
            name: user.name,
          });
          user.accessToken = res.data.token;
          user.id = res.data.user.id;
          return true;
        } catch (error) {
          console.error("Error syncing user with backend", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.id as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecretnextauthplaceholder",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

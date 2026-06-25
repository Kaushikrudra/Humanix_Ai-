import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

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
          const email = user.email;
          const name = user.name;
          if (!email) return false;

          let dbUser = await prisma.user.findUnique({ where: { email } });
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email,
                name,
                credits: email === 'testuser@example.com' ? 1000 : 30,
              },
            });
          } else if (email === 'testuser@example.com') {
            dbUser = await prisma.user.update({
              where: { email },
              data: { credits: 1000 }
            });
          }

          const token = jwt.sign(
            { id: dbUser.id, email: dbUser.email, role: dbUser.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
          );

          user.accessToken = token;
          user.id = dbUser.id;
          return true;
        } catch (error) {
          console.error("Error syncing user with database", error);
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

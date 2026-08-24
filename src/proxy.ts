import withAuth from "next-auth/middleware";

export const proxy = withAuth({
  pages: {
    signIn: "/signin",
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};

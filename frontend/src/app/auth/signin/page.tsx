import { Suspense } from "react";
import SignInForm from "./SignInForm";

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 dark:text-white font-medium">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mr-3" />
        Loading authentication...
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-dark-900 flex items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-dark-800 border border-white/10 shadow-2xl",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            formButtonPrimary: "bg-brand-500 hover:bg-brand-600",
            footerActionLink: "text-brand-400 hover:text-brand-300",
          },
        }}
      />
    </main>
  );
}

import Image from "next/image";

type AuthLayoutProps = {
  children: React.ReactNode;
};

function SharedImage({ sizes }: { sizes: string }) {
  return (
    <Image
      src="/assets/auth-illustration.png"
      alt="Authentication Illustration"
      fill
      priority
      sizes={sizes}
      className="object-cover"
    />
  );
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="md:min-h-svh w-full flex items-center justify-center md:p-8">
      <div className="bg-white flex flex-col md:flex-row w-full max-w-5xl md:shadow-lg overflow-hidden md:rounded-[32px] md:min-h-[600px]">
        <div className="relative block md:hidden h-[50vh] w-full">
          <SharedImage sizes="100vw" />
        </div>

        <div className="min-h-full flex-1 flex flex-col justify-center px-6 py-8 sm:px-12 lg:px-16 bg-white relative z-10 -mt-10 rounded-t-[50px] md:mt-0 md:rounded-none md:w-1/2">
          <div className="w-full max-w-md mx-auto md:max-w-lg">{children}</div>
        </div>

        <div className="relative hidden md:block md:w-1/2 overflow-hidden md:rounded-l-full">
          <SharedImage sizes="50vw" />
        </div>
      </div>
    </div>
  );
}

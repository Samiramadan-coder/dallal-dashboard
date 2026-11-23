// Signed-in users are redirected away from guest-only pages by proxy.ts
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex justify-center items-center px-4">
      {children}
    </div>
  );
}

import { ThemeProvider } from "@/app/utils/theme-provider";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-gray-100 bg-texture">{children}</div>
    </ThemeProvider>
  );
}

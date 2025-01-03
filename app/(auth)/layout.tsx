import { ThemeProvider } from "@/app/utils/theme-provider";

import { Nav } from "@/components/ui/nav";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <Nav />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background bg-texture pt-12 px-2 xs:p-8">
        {children}
      </div>
    </ThemeProvider>
  );
}

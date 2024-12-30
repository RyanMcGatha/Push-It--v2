import { ThemeProvider } from "@/app/utils/theme-provider";
import { Toaster } from "react-hot-toast";
import { Nav } from "@/components/ui/nav";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <Nav />
      <div className="flex h-screen p-8 flex-col items-center justify-center bg-background bg-texture">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              zIndex: 9999,
              background: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
            },
          }}
        />
        {children}
      </div>
    </ThemeProvider>
  );
}

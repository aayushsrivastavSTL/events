import "./globals.css";
import ClientProvider from "@/components/ClientProvider";

export const metadata = {
  title: "Jyot Event App",
  description: "Vasudaiva kutumbakum event 2026",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}

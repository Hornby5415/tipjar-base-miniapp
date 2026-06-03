import type { ReactNode } from "react";

import "./globals.css";
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="base:app_id" content="BASE_DEV_VERIFY_TOKEN_PLACEHOLDER" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

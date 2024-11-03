import RootLayout from "@/components/RootLayout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "react-responsive-carousel/lib/styles/carousel.min.css"; //for live banner

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div> 
      <RootLayout>
      <Component {...pageProps} />
      </RootLayout>
      
    </div>
  );
}

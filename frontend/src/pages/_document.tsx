import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="google-site-verification" content="ICh9hq1y7fKfaVRc5sfzCUA_V0SBWJyCgfEKiK79J0o" />
        <script defer data-domain="vesoko.com,test.vesoko.com" src="https://analytics.vesoko.com/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }",
          }}
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

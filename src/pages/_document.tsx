import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html className="h-full">
      <Head />
      <body className="h-full dark:bg-slate-800">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

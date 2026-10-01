"use client";

import dynamic from "next/dynamic";

const Whiteboard = dynamic(
  () => import("@/components/whiteboard/Whiteboard"),
  { ssr: false }
);

export default function Home() {
  return <Whiteboard />;
}

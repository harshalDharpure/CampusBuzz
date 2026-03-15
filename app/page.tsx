import { Suspense } from "react";
import CampusNavigator from "@/components/CampusNavigator";

function LoadingFallback() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        color: "#64748b",
      }}
    >
      Loading map…
    </div>
  );
}

export default function Home() {
  return (
    <main style={{ height: "100vh", width: "100%" }}>
      <Suspense fallback={<LoadingFallback />}>
        <CampusNavigator />
      </Suspense>
    </main>
  );
}

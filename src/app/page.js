import Image from "next/image";
import Hero from "./components/Hero";
import Popular from "./components/Popular";
import Update from "./components/Update";

export default function Home() {
  return (
    <div className="py-8">
      <Hero />
      <Popular />
      <Update />
    </div>
  );
}

"use client";
import Head from "next/head";
import Image from "next/image";
import Hero from "./components/Hero";
import Popular from "./components/Popular";
import Update from "./components/Update";
import Genre from "./components/Genre";

export default function Home() {
  return (
    <div className="py-8">
      <Hero />
      <Popular />
      <Update />
      <Genre />
    </div>
  );
}

'use client';
import { LandingIntro } from "../components/landing/LandingIntro";
import { useRootLanding } from "../hooks/useRootLanding";

export default function Home() {
  useRootLanding();
  return <LandingIntro />;
}

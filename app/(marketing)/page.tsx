import Image from "next/image";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { HeroHeader } from "@/app/(marketing)/_components/header";
import HeroSection from "@/app/(marketing)/_components/hero-section";

export default function Home() {
  return (
    <div className="">
      
      <HeroHeader/>
      <HeroSection/>
    </div>
  );
}

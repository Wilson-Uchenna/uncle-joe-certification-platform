import HeroSection from "./_components/landing/HeroSection";
import Navbar from "./_components/landing/navbar";
import Professionals from "./_components/landing/professionals";

export default function Home() {
  return (
    <>
    <Navbar/>
    <main className="pt-20">
    <HeroSection />
    <Professionals />
    </main>
    </>
  )
}
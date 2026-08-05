import Certification from "./_components/landing/certification";
import CertificationUse from "./_components/landing/certification-use";
import FAQSection from "./_components/landing/FAQSection";
import Footer from "./_components/landing/footer";
import HeroSection from "./_components/landing/HeroSection";
import Impact from "./_components/landing/impact";
import Navbar from "./_components/landing/navbar";
import Onskillora from "./_components/landing/onSkillora";
import Professionals from "./_components/landing/professionals";
import SkilloraChoice from "./_components/landing/skillora-choice";
import SkilloraValues from "./_components/landing/skillora-values";
import WhySkillora from "./_components/landing/why-skillora";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <HeroSection />
        <Professionals />
        <WhySkillora />
        <Onskillora />
        <SkilloraChoice />
        <SkilloraValues />
        <Impact />
       
        <Certification />
        <CertificationUse />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}

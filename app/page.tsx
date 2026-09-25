"use client";

import { motion } from "motion/react";
import { easeOut } from "motion";
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

// Odd sections (1st, 3rd, 5th...): fade up from below
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

// Even sections (2nd, 4th, 6th...): fade in from the side with slight scale
const fadeSide = {
  hidden: { opacity: 0, x: -60, scale: 0.96 },
  visible: { opacity: 1, x: 0, scale: 1 },
};

const sectionTransition = {
  duration: 0.6,
  ease: easeOut,
};

function AnimatedSection({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const isEven = index % 2 === 1; // index is 0-based, so odd index = 2nd, 4th... section

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={isEven ? fadeSide : fadeUp}
      transition={sectionTransition}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <HeroSection />

        <AnimatedSection index={0}>
          <div id="professionals"></div>
          <Professionals />
        </AnimatedSection>

        <AnimatedSection index={1}>
          <div id="whyskillora">
            <WhySkillora />
          </div>
        </AnimatedSection>

        <AnimatedSection index={2}>
          <Onskillora />
        </AnimatedSection>

        <AnimatedSection index={3}>
          <SkilloraChoice />
        </AnimatedSection>

        <AnimatedSection index={4}>
          <SkilloraValues />
        </AnimatedSection>

        <AnimatedSection index={5}>
          <div id="impact">
            <Impact />
          </div>
        </AnimatedSection>

        <AnimatedSection index={6}>
          <div id="certification"></div>
          <Certification />
        </AnimatedSection>

        <AnimatedSection index={7}>
          <div id="certification-use"></div>
          <CertificationUse />
        </AnimatedSection>

        <AnimatedSection index={8}>
          <div id="faqs">
            <FAQSection />
          </div>
        </AnimatedSection>
      </main>
      <Footer />
    </>
  );
}

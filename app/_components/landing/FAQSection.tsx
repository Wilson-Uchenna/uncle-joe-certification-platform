"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}


const FAQS: FAQItem[] = [
  {
    question: "What is African Remote Workers Professional Certification?",
    answer:
      "African Remote Workers Professional Certification is an online learning and career development platform that helps individuals build practical skills, earn professional certifications, access internships, and apply for remote jobs.",
  },
  {
    question: "Who can join A.R.W.P.C?",
    answer:
      "Anyone eager to grow professionally! Whether you're a student, graduate, freelancer, job seeker, or working professional. A.R.W.P.C is designed to support your career journey.",
  },
  {
    question: "Is registration free?",
    answer:
      "Yes! Creating a A.R.W.P.C account is completely free. Some specialized courses or certification programs may have associated fees, which will always be clearly communicated before enrollment.",
  },
  {
    question: "How do I earn a certification?",
    answer:
      "Complete your chosen course, finish all required learning modules, and successfully pass the final assessment. Once you've met the requirements, your African Remote Workers Professional Certification will be available for download.",
  },
  {
    question: "Are A.R.W.P.C certificates verifiable?",
    answer:
      "Yes. Every certificate includes a unique verification code that allows employers and organizations to confirm its authenticity",
  },
  {
    question: "Can I apply for internships after certification?",
    answer:
      "Absolutely. Once you complete your profile and meet the eligibily requirements, you can apply for internship opportunities available on the platform.",
  },
  {
    question: "Does A.R.W.P.C help users find remote jobs?",
    answer:
      "Yes. A.R.W.P.C connects qualified learners with verified employers offering remote job opportunities that match their skills and experience.",
  },
  {
    question: "Can I learn at my own pace?",
    answer:
      "Yes. Most A.R.W.P.C courses are self paced, allowing you to learn whenever it's convenient for you.",
  },
  {
    question: "How do employers find me?",
    answer:
      "By completing your profile, uploading your CV, and earning certifications, you increase your visibility to employers searching for qualified candidates.",
  },
  { question: "How can I contact support?", answer: "Our support team is always ready to help. Visit the help Centre or contact us through email or live in chat for assistance" },
];

interface FAQItemProps {
  item: FAQItem;
  index: number;
  openIndex: number;
  toggle: (index: number) => void;
}

function FAQItem({ item, index, openIndex, toggle }: FAQItemProps) {
  const isOpen = openIndex === index;

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => toggle(index)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span
          className={`text-sm font-medium ${
            isOpen ? "text-indigo-600" : "text-gray-900"
          }`}
        >
          {item.question}
        </span>
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-4 ${
            isOpen
              ? "bg-indigo-600 text-white"
              : "bg-indigo-50 text-indigo-600"
          }`}
        >
          {isOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </span>
      </button>

      {isOpen && (
        <div className="pb-5">
          <p className="text-sm text-gray-500 leading-relaxed pr-8">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const leftColumn = FAQS.slice(0, 5);
  const rightColumn = FAQS.slice(5);

  const toggle = (index: number): void => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-[0.2em] mb-3 block">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl md:text-4xl font-medium text-gray-900">
            Questions we get a lot
          </h2>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
          <div>
            {leftColumn.map((item, i) => (
              <FAQItem
                key={item.question}
                item={item}
                index={i}
                openIndex={openIndex}
                toggle={toggle}
              />
            ))}
          </div>
          <div>
            {rightColumn.map((item, i) => (
              <FAQItem
                key={item.question}
                item={item}
                index={i + 5}
                openIndex={openIndex}
                toggle={toggle}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
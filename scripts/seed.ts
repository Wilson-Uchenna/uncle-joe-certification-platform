import { config } from "dotenv";
import { resolve } from "path";

// Force load and check
config({ path: resolve(process.cwd(), ".env.local") });

console.log("=== ENV DEBUG ===");
console.log("MONGODB_URI exists?", !!process.env.MONGODB_URI);
console.log("MONGODB_URI value:", process.env.MONGODB_URI?.substring(0, 30) + "...");
console.log("All env keys:", Object.keys(process.env).filter(k => k.includes("MONGO") || k.includes("URI")));
console.log("==================");

import connectDB from "../lib/local-db";
import { Category } from "../models/Category";

async function seed() {
  await connectDB(); // ← Uses your cached Mongoose connection
  console.log("✅ Connected to Atlas");

  await Category.deleteMany({});
  const categories = await Category.create([
    // ========== ENTRY-LEVEL ==========
    {
      name: "Admin / Virtual Assistant",
      slug: "admin-virtual-assistant",
      skillLevel: "entry",
      description:
        "Remote administrative support including scheduling, email management, data entry, and operational assistance for executives and teams.",
      examTimeLimit: 15,
      passThreshold: 60,
      isActive: true,
      roles: [
        "Virtual Assistant (VA)",
        "Executive Assistant",
        "Administrative Assistant",
        "Data Entry Specialist",
        "Personal Assistant",
        "Customer Support Admin",
        "Remote Operations Assistant",
      ],
    },
    {
      name: "Human Resources",
      slug: "human-resources",
      skillLevel: "entry",
      description:
        "Talent acquisition, recruitment coordination, payroll processing, and employee relations for remote organizations.",
      examTimeLimit: 15,
      passThreshold: 60,
      isActive: true,
      roles: [
        "HR Manager",
        "HR Officer / Specialist",
        "Recruitment Coordinator",
        "Talent Acquisition Specialist",
        "Payroll Officer",
      ],
    },
    {
      name: "Finance & Accounting",
      slug: "finance-accounting",
      skillLevel: "entry",
      description:
        "Financial record keeping, bookkeeping, accounts payable, auditing, and basic financial analysis for remote businesses.",
      examTimeLimit: 15,
      passThreshold: 60,
      isActive: true,
      roles: [
        "Accountant (General / Staff)",
        "Financial Analyst",
        "Bookkeeper",
        "Auditor",
        "Payroll Specialist",
        "Accounts Payable",
        "CFO Assistant / Finance Coordinator",
      ],
    },
    {
      name: "IT Support",
      slug: "it-support",
      skillLevel: "entry",
      description:
        "First-line technical support, troubleshooting hardware and software issues, and help desk operations for remote teams.",
      examTimeLimit: 15,
      passThreshold: 60,
      isActive: true,
      roles: [
        "IT Support Specialist",
        "Help Desk Technician",
        "IT Technician",
        "Desktop Support Analyst",
        "Network Support Specialist",
        "IT Administrator",
        "Technical Support Engineer",
        "Systems Support Specialist",
        "Service Desk Analyst",
        "Remote IT Support",
      ],
    },
    {
      name: "Telemarketers",
      slug: "telemarketers",
      skillLevel: "entry",
      description:
        "Outbound calling, lead generation, sales pitching, appointment setting, and telesales operations.",
      examTimeLimit: 15,
      passThreshold: 60,
      isActive: true,
      roles: [
        "Telemarketing Executive",
        "Call Center Agent",
        "Sales Representative",
        "Lead Generation Specialist",
        "Telesales Agent",
      ],
    },
    {
      name: "Customer Service Representatives",
      slug: "customer-service-representatives",
      skillLevel: "entry",
      description:
        "Client support via phone, chat, email, and ticketing systems. Handling inquiries, complaints, and service requests remotely.",
      examTimeLimit: 15,
      passThreshold: 60,
      isActive: true,
      roles: [
        "Customer Service Rep / Agent",
        "Client Support Specialist",
        "Help Desk Agent",
        "Call Center Representative",
        "Technical Support Agent",
        "Online Chat Support Specialist",
        "Customer Experience Associate",
        "Ticketing / Support Specialist",
        "Customer Success Specialist",
        "Remote Support Agent",
      ],
    },

    // ========== MID-LEVEL ==========
    {
      name: "Developers (Web/Mobile/Software)",
      slug: "developers-web-mobile-software",
      skillLevel: "mid",
      description:
        "Building and maintaining web applications, mobile apps, APIs, and software systems for remote teams and clients.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Mobile App Developer (iOS / Android)",
        "Software Engineer",
        "DevOps Engineer",
        "API Developer",
        "Game Developer",
        "WordPress / CMS Developer",
        "Cloud Engineer",
      ],
    },
    {
      name: "Data / Database",
      slug: "data-database",
      skillLevel: "mid",
      description:
        "Data analysis, database administration, business intelligence, and deriving insights from complex datasets.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "Data Analyst",
        "Data Scientist",
        "Database Administrator (DBA)",
        "Business Intelligence (BI) Analyst",
      ],
    },
    {
      name: "Automation & AI Specialists",
      slug: "automation-ai-specialists",
      skillLevel: "mid",
      description:
        "Building AI systems, machine learning models, automation workflows, chatbots, and intelligent process automation.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "AI Engineer",
        "Machine Learning Engineer",
        "Robotics Process Automation (RPA) Developer",
        "Automation Tester / QA Engineer",
        "Chatbot Developer",
        "Data Automation Analyst",
        "AI Research Scientist",
      ],
    },
    {
      name: "Graphic Designers",
      slug: "graphic-designers",
      skillLevel: "mid",
      description:
        "Visual design, brand identity, user interface design, and motion graphics for digital products and marketing.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "Graphic Designer",
        "UI Designer",
        "UX Designer",
        "Motion Graphics Designer",
        "Brand Designer",
        "Web Designer",
        "Product Designer",
      ],
    },
    {
      name: "Video Editors",
      slug: "video-editors",
      skillLevel: "mid",
      description:
        "Video editing, motion graphics, post-production, and content creation for YouTube, ads, and branded video.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "Video Editor",
        "Motion Graphics Artist",
        "Post-Production Specialist",
        "Video Content Creator",
        "Cinematographer / Videographer",
        "YouTube Editor",
      ],
    },
    {
      name: "Project Managers",
      slug: "project-managers",
      skillLevel: "mid",
      description:
        "Planning, executing, and coordinating remote projects using agile methodologies and project management tools.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "Project Manager",
        "Program Manager",
        "Scrum Master",
        "Product Manager",
        "Agile Project Manager",
        "Technical Project Manager",
        "Operations Manager",
      ],
    },
    {
      name: "Photography",
      slug: "photography",
      skillLevel: "mid",
      description:
        "Professional photography including events, portraits, products, travel, and commercial shoots with editing and delivery.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "Photographer (Event / Studio / Commercial)",
        "Portrait Photographer",
        "Travel Photographer",
        "Product Photographer",
        "Fashion Photographer",
        "Photojournalist",
        "Drone Photographer",
        "Stock Photographer",
        "Wildlife Photographer",
        "Freelance Photographer",
      ],
    },
    {
      name: "Social Media Managers",
      slug: "social-media-managers",
      skillLevel: "mid",
      description:
        "Social media strategy, content planning, community management, analytics, and brand voice management.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "Social Media Manager",
        "Social Media Specialist",
        "Community Manager",
        "Content Strategist",
        "Social Media Coordinator",
        "Influencer Marketing Manager",
        "Social Media Analyst",
        "Online Community Moderator",
      ],
    },
    {
      name: "Writers",
      slug: "writers",
      skillLevel: "mid",
      description:
        "Content creation, copywriting, technical writing, SEO writing, and creative writing for brands and publications.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "Copywriter",
        "Content Writer",
        "Technical Writer",
        "SEO Writer",
        "Ghostwriter",
        "Blogger",
        "Scriptwriter",
        "Creative Writer",
        "Grant / Proposal Writer",
        "Newsletter Writer",
      ],
    },
    {
      name: "Digital Marketers",
      slug: "digital-marketers",
      skillLevel: "mid",
      description:
        "Online marketing including SEO, PPC, email marketing, content marketing, and performance marketing campaigns.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "Digital Marketing Specialist",
        "SEO Specialist",
        "PPC / Ads Manager",
        "Email Marketing Specialist",
        "Content Marketing Manager",
        "Affiliate Marketing Manager",
      ],
    },
    {
      name: "Affiliate Marketers",
      slug: "affiliate-marketers",
      skillLevel: "mid",
      description:
        "Affiliate program management, partnership development, referral marketing, and performance-based revenue generation.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "Affiliate Marketing Manager",
        "Partnerships Manager",
        "Referral Marketing Specialist",
        "Influencer Affiliate Coordinator",
        "CPA / CPS Marketing Specialist",
        "Affiliate Network Manager",
      ],
    },
    {
      name: "Business Developers",
      slug: "business-developers",
      skillLevel: "mid",
      description:
        "Lead generation, B2B sales, account management, client relationships, and market development for remote businesses.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "Business Development Manager",
        "Sales Executive",
        "Account Manager",
        "Lead Generation Specialist",
        "Partnerships Manager",
        "Growth Manager",
        "Enterprise Sales Manager",
        "Market Development Executive",
        "Client Relationship Manager",
        "Strategic Partnerships",
      ],
    },
    {
      name: "Coaches, Educators, Online Tutors, Authors & Trainers",
      slug: "coaches-educators-tutors-trainers",
      skillLevel: "mid",
      description:
        "Online course creation, instructional delivery, personal coaching, and educational content monetization.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "Online Tutor",
        "Course Instructor",
        "Course Creator",
        "Personal Coach (Life / Business / Fitness)",
        "Author / Writer",
        "Public Speaker",
      ],
    },
    {
      name: "Content Creators",
      slug: "content-creators",
      skillLevel: "mid",
      description:
        "Multi-platform content creation including blogs, videos, podcasts, social media, and multimedia production.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "Content Creator (General)",
        "Blogger / Vlogger",
        "YouTuber / TikToker",
        "Podcast Host",
        "Social Media Creator",
        "Video Producer",
        "Animation Video Creator",
        "Graphic / Visual Content Creator",
        "Writer / Article Creator",
        "Influencer Content Creator",
        "Multimedia Creator",
      ],
    },
    {
      name: "Influencers",
      slug: "influencers",
      skillLevel: "mid",
      description:
        "Brand partnerships, sponsored content, audience engagement, and monetization across social platforms.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "Social Media Influencer",
        "Brand Ambassador",
        "Content Creator",
        "YouTube / TikTok Influencer",
        "Instagram Influencer",
        "Fashion / Lifestyle Influencer",
        "Micro-Influencer",
        "Affiliate Influencer",
        "Travel / Niche Influencer",
      ],
    },
    {
      name: "UGC Creators & Vloggers",
      slug: "ugc-creators-vloggers",
      skillLevel: "mid",
      description:
        "User-generated content creation, vlogging, and short-form video production for brands and personal channels.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "UGC Video Creator",
        "Vlogger",
        "TikTok Content Creator",
        "Instagram Content Creator",
      ],
    },
    {
      name: "TikTokers",
      slug: "tiktokers",
      skillLevel: "mid",
      description:
        "TikTok content creation, trend participation, product promotion, and audience building on the platform.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "TikTok Creator / Influencer",
        "Content Creator (Gen-Z Focus)",
        "Trend Creator / Entertainer",
        "Product Promoter / TikTok Shop Creator",
        "Brand Ambassador",
        "TikTok Micro-Influencer",
        "Storyteller",
        "Dance / Entertainment Creator",
        "Comedy / Meme Creator",
      ],
    },
    {
      name: "YouTubers",
      slug: "youtubers",
      skillLevel: "mid",
      description:
        "YouTube channel management, long-form video production, audience engagement, and content monetization.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "YouTube Content Creator",
        "Vlogger",
        "YouTube Video Creator",
        "Social Media Creator",
        "Review Video Creator",
        "Product Demonstrator / Reviewer",
        "Brand Story Creator",
        "Short-Form Video Creator",
      ],
    },
    {
      name: "Tech, Digital, Business & Finance Creators",
      slug: "tech-digital-business-finance-creators",
      skillLevel: "mid",
      description:
        "Expert-level content creation in technology, finance, business strategy, and digital entrepreneurship.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "Tech Reviewer",
        "Digital Marketing Creator",
        "Finance / Investment Educator",
        "Business Strategy Blogger",
        "SaaS / App Reviewer",
        "Productivity / Growth Creator",
        "Crypto / Blockchain Educator",
        "Entrepreneur / Startup Educator",
        "Course Creator",
        "Consultant / Expert Speaker",
      ],
    },
    {
      name: "Lifestyle, Entertainment, Travel, Food & Culture Creators",
      slug: "lifestyle-entertainment-travel-food-culture-creators",
      skillLevel: "mid",
      description:
        "Content creation across lifestyle, travel, food, entertainment, and cultural storytelling niches.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "Travel Blogger / Vlogger",
        "Food Blogger / Chef Creator",
        "Lifestyle Influencer",
        "Entertainment Creator",
        "Culture / Community Storyteller",
        "Event Coverage Creator",
        "Fashion / Beauty Blogger",
        "Experience / Adventure Creator",
        "Photography / Visual Creator",
        "Short-Form Content Creator",
      ],
    },
    {
      name: "Health, Fitness, Wellness, Fashion, Beauty & Personal Branding Creators",
      slug: "health-fitness-wellness-fashion-beauty-personal-branding-creators",
      skillLevel: "mid",
      description:
        "Content creation in health, fitness, wellness, beauty, fashion, and personal development niches.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "Fitness / Workout Coach",
        "Nutrition / Wellness Coach",
        "Health Educator",
        "Fashion / Style Influencer",
        "Beauty Blogger / Vlogger",
        "Skincare / Beauty Product Reviewer",
        "Personal Branding Coach",
        "Lifestyle Creator",
        "Yoga / Mindfulness Instructor",
        "Wellness Content Creator",
      ],
    },
    {
      name: "UI/UX Designers",
      slug: "ui-ux-designers",
      skillLevel: "mid",
      description:
        "User interface and user experience design for web, mobile, and digital products.",
      examTimeLimit: 15,
      passThreshold: 65,
      isActive: true,
      roles: [
        "UI/UX Designer",
        "Product Designer",
        "Mobile App Designer",
        "Web Designer",
      ],
    },

    // ========== ADVANCED ==========
    {
      name: "Tech Security (Cybersecurity Specialists)",
      slug: "tech-security-cybersecurity-specialists",
      skillLevel: "advanced",
      description:
        "Security analysis, penetration testing, SOC operations, network security, and ethical hacking for enterprise systems.",
      examTimeLimit: 15,
      passThreshold: 70,
      isActive: true,
      roles: [
        "Cybersecurity Analyst",
        "Security Engineer",
        "Tester",
        "Network Security Specialist",
        "Ethical Hacker",
        "SOC Analyst",
        "Cloud Security Specialist",
      ],
    },
    {
      name: "DevOps & Infrastructure Engineers",
      slug: "devops-infrastructure-engineers",
      skillLevel: "advanced",
      description:
        "Cloud infrastructure, CI/CD pipelines, site reliability, and scalable system architecture for remote teams.",
      examTimeLimit: 15,
      passThreshold: 70,
      isActive: true,
      roles: [
        "DevOps Engineer",
        "Cloud Infrastructure Engineer",
        "Site Reliability Engineer (SRE)",
        "Systems Administrator",
        "Network Engineer",
        "Backend / API Engineer",
      ],
    },
  ]);

  // Summary
  const entryCount = categories.filter(
    (c: { skillLevel: string }) => c.skillLevel === "entry",
  ).length;
  const midCount = categories.filter(
    (c: { skillLevel: string }) => c.skillLevel === "mid",
  ).length;
  const advancedCount = categories.filter(
    (c: { skillLevel: string }) => c.skillLevel === "advanced",
  ).length;
  const totalRoles = categories.reduce(
    (sum: any, c: { roles: string | any[] }) => sum + c.roles.length,
    0,
  );

  console.log("✅ Categories seeded successfully!");
  console.log("");
  console.log("Summary:");
  console.log(`  Entry-level:    ${entryCount} categories`);
  console.log(`  Mid-level:      ${midCount} categories`);
  console.log(`  Advanced:       ${advancedCount} categories`);
  console.log(`  Total:          ${categories.length} categories`);
  console.log(`  Total roles:    ${totalRoles} exact roles`);
  console.log("");
  console.log("Categories created:");
  categories.forEach((c: { skillLevel: string; name: any; roles: any[] }) => {
    console.log(`\n  [${c.skillLevel.toUpperCase().padEnd(7)}] ${c.name}`);
    console.log(
      `            └─ ${c.roles.length} roles: ${c.roles.slice(0, 3).join(", ")}${c.roles.length > 3 ? "..." : ""}`,
    );
  });

  console.log(`✅ Seeded ${categories.length} categories`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

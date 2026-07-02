## UNCLE JOE CERTIFICATION PLATFORM

The Uncle Joe Certification Platform is a nationwide digital certification and assessment platform designed for remote workers across all skill levels and industries. It combines structured certification exams, competitive ranking, and performance-driven incentives to identify and reward professional excellence in the remote work space.

The platform operates as a monthly certification challenge system where remote workers register, take a certification exam, view their results for free, and pay only when they want to download their certificate.

## PROJECT STRUCTURE

```
uncle-joe-certification/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth group
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (main)/                   # Main app group
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   ├── exam/[categoryId]/page.tsx
│   │   │   ├── result/[examId]/page.tsx
│   │   │   ├── certificate/[examId]/page.tsx
│   │   │   ├── leaderboard/page.tsx
│   │   │   ├── training/page.tsx
│   │   │   └── layout.tsx
│   │   ├── admin/                    # Admin dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── questions/page.tsx
│   │   │   └── analytics/page.tsx
│   │   ├── api/                      # API routes
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── exam/
│   │   │   │   ├── start/route.ts
│   │   │   │   ├── save/route.ts
│   │   │   │   ├── submit/route.ts
│   │   │   │   └── result/[examId]/route.ts
│   │   │   ├── payment/
│   │   │   │   ├── initialize/route.ts
│   │   │   │   └── verify/route.ts
│   │   │   ├── certificate/
│   │   │   │   └── generate/route.ts
│   │   │   ├── leaderboard/route.ts
│   │   │   └── webhook/paystack/route.ts
│   │   ├── page.tsx                  # Landing page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/                   # Reusable components
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── exam/
│   │   │   ├── Timer.tsx
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── ExamGuard.tsx
│   │   ├── payment/
│   │   │   └── PayButton.tsx
│   │   └── leaderboard/
│   │       └── LeaderboardTable.tsx
│   ├── lib/                          # Utilities & configs
│   │   ├── db.ts                     # MongoDB connection
│   │   ├── auth.ts                   # Auth config
│   │   ├── paystack.ts               # Payment config
│   │   ├── email.ts                  # Email service
│   │   └── utils.ts
│   ├── models/                       # MongoDB schemas
│   │   ├── User.ts
│   │   ├── Exam.ts
│   │   ├── Question.ts
│   │   ├── Certificate.ts
│   │   ├── Payment.ts
│   │   └── TrainingMaterial.ts
│   ├── types/                        # TypeScript types
│   │   └── index.ts
│   └── hooks/                        # Custom hooks
│       ├── useExam.ts
│       └── useTimer.ts
├── public/
│   └── certificates/                 # Generated certificates
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── package.json

```

### TECH STACK

| Tool              | Version | Purpose                                                          |
| ----------------- | ------- | ---------------------------------------------------------------- |
| Next.js           | 16.x    | App Router, SSR, RSC — UI only -for the frontend and the backend |
| React             | 19.x    | UI framework                                                     |
| TypeScript        | 5.x     | Type safety                                                      |
| Tailwind CSS      | 4.x     | Utility-first styling                                            |
| shadcn/ui         | latest  | Component library                                                |
| better-auth/react | 2.x     | Better-auth JS client                                               |
| better-auth       | 0.12.x  | Cookie-based session handling                                |

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

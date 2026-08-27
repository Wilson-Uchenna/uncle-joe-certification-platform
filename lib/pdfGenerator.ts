import { renderToBuffer, Font } from "@react-pdf/renderer";
import CertificatePDF from "@/app/_components/pdf/CertficatePDF";
import fs from "fs";
import path from "path";

interface CertificateData {
  userName: string;
  categoryName: string;
  skillLevel: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  issuedAt: string;
  verificationCode: string;
  sealImageSrc?: string;
}

function toDataUri(filePath: string, mimeType: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const buffer = fs.readFileSync(filePath);
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

// Register font once at module load (server-side only)
const GREAT_VIBES_PATH = path.join(process.cwd(), "public", "GreatVibes-Regular.ttf");
const SEAL_PATH = path.join(process.cwd(), "public", "official_seal_v10.png");

Font.register({
  family: "GreatVibes",
  src: toDataUri(GREAT_VIBES_PATH, "font/ttf"),
});

const DEFAULT_SEAL_URI = toDataUri(SEAL_PATH, "image/png");

export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  try {
    const element = CertificatePDF({
      ...data,
      sealImageSrc: data.sealImageSrc || DEFAULT_SEAL_URI,
    });
    return await renderToBuffer(element);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw new Error("Failed to generate certificate PDF");
  }
}
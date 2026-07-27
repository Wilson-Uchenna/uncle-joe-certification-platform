import { renderToBuffer } from "@react-pdf/renderer";
import CertificatePDF from "@/app/_components/pdf/CertficatePDF";

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
}

export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  const element = CertificatePDF(data);
  return await renderToBuffer(element);
}
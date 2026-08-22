import { Document, Page, Text, View, StyleSheet, Font, Svg, Circle, Path, G } from "@react-pdf/renderer";

// Cursive font for the signature — Great Vibes, hosted on Google Fonts' static CDN
Font.register({
  family: "GreatVibes",
  src: "https://fonts.gstatic.com/s/greatvibes/v18/RWmMoKWR9v4ksMfaWd_JN9XLiaQ.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: "#fafaf9",
  },
  border: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 2,
    borderColor: "#1e1b4b",
  },
  innerBorder: {
    position: "absolute",
    top: 26,
    left: 26,
    right: 26,
    bottom: 26,
    borderWidth: 1,
    borderColor: "#4338ca",
  },
  watermarkSeal: {
    position: "absolute",
    bottom: 60,
    right: 50,
    opacity: 0.06,
  },
  header: {
    marginTop: 60,
    alignItems: "center",
  },
  orgName: {
    fontSize: 14,
    color: "#4338ca",
    fontWeight: 700,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 40,
    fontSize: 42,
    fontWeight: 700,
    color: "#1e1b4b",
    letterSpacing: 2,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#78716c",
  },
  recipient: {
    marginTop: 48,
    alignItems: "center",
  },
  presentedTo: {
    fontSize: 12,
    color: "#78716c",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  name: {
    marginTop: 12,
    fontSize: 32,
    fontWeight: 700,
    color: "#1e1b4b",
  },
  achievement: {
    marginTop: 8,
    fontSize: 14,
    color: "#44403c",
    textAlign: "center",
    maxWidth: 500,
    lineHeight: 1.6,
  },
  details: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 80,
  },
  detailBlock: {
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 10,
    color: "#a8a29e",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: 700,
    color: "#1e1b4b",
  },
  sealLabel: {
    marginTop: 6,
    fontSize: 8,
    color: "#4338ca",
    fontWeight: 700,
    letterSpacing: 1,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 60,
    alignItems: "flex-end",
  },
  verify: {
    fontSize: 9,
    color: "#a8a29e",
  },
  verifyCode: {
    fontSize: 9,
    color: "#4338ca",
    fontWeight: 700,
  },
  signatureBlock: {
    alignItems: "center",
  },
  signature: {
    fontFamily: "GreatVibes",
    fontSize: 30,
    color: "#1e1b4b",
  },
  dateLine: {
    marginTop: 4,
    width: 140,
    height: 1,
    backgroundColor: "#1e1b4b",
  },
  signName: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: 700,
    color: "#1e1b4b",
  },
  signTitle: {
    fontSize: 10,
    color: "#78716c",
  },
});

// Vector badge — concentric rings, a star, and small tick marks around the rim
function SealBadge({ size = 84 }: { size?: number }) {
  const r = size / 2;
  return (
    <Svg width={size} height={size} viewBox="0 0 84 84">
      <Circle cx="42" cy="42" r="40" fill="none" stroke="#4338ca" strokeWidth="1.5" />
      <Circle cx="42" cy="42" r="34" fill="none" stroke="#4338ca" strokeWidth="1" strokeDasharray="2 3" />
      <Circle cx="42" cy="42" r="28" fill="#eef2ff" stroke="#1e1b4b" strokeWidth="1.5" />
      {/* Tick marks around the rim */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 15 * Math.PI) / 180;
        const x1 = 42 + 36 * Math.cos(angle);
        const y1 = 42 + 36 * Math.sin(angle);
        const x2 = 42 + 39 * Math.cos(angle);
        const y2 = 42 + 39 * Math.sin(angle);
        return (
          <Path
            key={i}
            d={`M ${x1} ${y1} L ${x2} ${y2}`}
            stroke="#4338ca"
            strokeWidth="1"
          />
        );
      })}
      {/* 5-point star, centered */}
      <G transform="translate(42 40) scale(0.9)">
        <Path
          d="M0,-14 L3.3,-4.3 L13.3,-4.3 L5.3,1.6 L8.5,11.3 L0,5.4 L-8.5,11.3 L-5.3,1.6 L-13.3,-4.3 L-3.3,-4.3 Z"
          fill="#4338ca"
        />
      </G>
      <Text style={{ display: "none" }} />
    </Svg>
  );
}

interface CertificatePDFProps {
  userName: string;
  categoryName: string;
  skillLevel: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  issuedAt: string;
  verificationCode: string;
  orgName?: string;
}

export default function CertificatePDF({
  userName,
  categoryName,
  skillLevel,
  score,
  correctCount,
  totalQuestions,
  passed,
  issuedAt,
  verificationCode,
  orgName = "African Remote Workers Professional Certification Platform",
}: CertificatePDFProps) {
  const formattedDate = new Date(issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size={[842, 595]} style={styles.page}>
        <View style={styles.border} />
        <View style={styles.innerBorder} />

        {/* Faint watermark seal, bottom-right, behind everything else */}
        <View style={styles.watermarkSeal}>
          <SealBadge size={160} />
        </View>

        <View style={styles.header}>
          <Text style={styles.orgName}>{orgName}</Text>
        </View>

        <View style={{ alignItems: "center" }}>
          <Text style={styles.title}>Certificate</Text>
          <Text style={styles.subtitle}>of Achievement</Text>
        </View>

        <View style={styles.recipient}>
          <Text style={styles.presentedTo}>Presented To</Text>
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.achievement}>
            For successfully completing the {skillLevel} level assessment in{" "}
            {categoryName} with a score of {score}% ({correctCount}/{totalQuestions} correct)
          </Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Date Issued</Text>
            <View style={styles.dateLine} />
            <Text style={styles.detailValue}>{formattedDate}</Text>
          </View>

          <View style={styles.detailBlock}>
            <SealBadge />
            <Text style={styles.sealLabel}>OFFICIAL SEAL</Text>
          </View>

          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={styles.dateLine} />
            <Text style={styles.detailValue}>{passed ? "PASSED" : "COMPLETED"}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.verify}>Verify at arwpc.org/verify</Text>
            <Text style={styles.verifyCode}>{verificationCode}</Text>
          </View>

          <View style={styles.signatureBlock}>
            <Text style={styles.signature}>Adaeze N. Okafor</Text>
            <View style={styles.dateLine} />
            <Text style={styles.signName}>Director of Education</Text>
            <Text style={styles.signTitle}>Certifying Authority</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
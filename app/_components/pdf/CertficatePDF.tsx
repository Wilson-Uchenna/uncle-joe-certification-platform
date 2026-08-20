import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

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
  footer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 60,
    alignItems: "center",
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
  seal: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#4338ca",
    alignItems: "center",
    justifyContent: "center",
  },
  sealText: {
    fontSize: 8,
    color: "#4338ca",
    fontWeight: 700,
    textAlign: "center",
  },
  dateLine: {
    marginTop: 4,
    width: 120,
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
            <View style={styles.seal}>
              <Text style={styles.sealText}>OFFICIAL{"\n"}SEAL</Text>
            </View>
          </View>

          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={styles.dateLine} />
            <Text style={styles.detailValue}>{passed ? "PASSED" : "COMPLETED"}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          
          <View style={{ alignItems: "center" }}>
            <Text style={styles.signName}>Director of Education</Text>
            <Text style={styles.signTitle}>Certifying Authority</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
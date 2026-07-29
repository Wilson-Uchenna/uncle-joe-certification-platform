// emails/ResultsReady.tsx
import {
  Html, Head, Body, Container, Section, Text, Button, Preview,
} from "@react-email/components";

export function ResultsReadyEmail({
  name,
  score,
  passed,
  resultUrl,
}: {
  name: string;
  score: number;
  passed: boolean;
  resultUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Your assessment results are ready</Preview>
      <Body style={{ backgroundColor: "#f8f7fb", fontFamily: "sans-serif" }}>
        <Container style={{ padding: "32px", maxWidth: "480px" }}>
          <Text style={{ fontSize: "20px", fontWeight: "bold", color: "#1e1b4b" }}>
            Hi {name}, your results are in!
          </Text>
          <Text style={{ fontSize: "14px", color: "#475569" }}>
            You scored <strong>{score}%</strong> and {passed ? "passed 🎉" : "did not pass this attempt"}.
          </Text>
          <Button
            href={resultUrl}
            style={{
              background: "#7c3aed",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            View Full Results
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
// app/_components/emails/OnboardingComplete.tsx
import {
  Html, Head, Body, Container, Section, Text, Preview,
} from "@react-email/components";

export function OnboardingCompleteEmail({
  name,
}: {
  name: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>You're all set — we'll notify you when your exam is ready</Preview>
      <Body style={{ backgroundColor: "#f8f7fb", fontFamily: "sans-serif" }}>
        <Container style={{ padding: "32px", maxWidth: "480px" }}>
          <Text style={{ fontSize: "20px", fontWeight: "bold", color: "#1e1b4b" }}>
            Welcome aboard, {name}!
          </Text>
          <Text style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6" }}>
            Thanks for completing your registration and onboarding. You're
            officially set up on the platform.
          </Text>
          <Text style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6" }}>
            We're currently finalizing your exam questions and preparing
            everything for your assessment. There's nothing you need to do
            right now — we'll send you another email the moment your exam
            is ready to take.
          </Text>
          <Text style={{ fontSize: "13px", color: "#94a3b8", marginTop: "24px" }}>
            Keep an eye on your inbox — we'll be in touch soon.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
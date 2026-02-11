import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  email?: string;
}

export default function WelcomeEmail({ email }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;re on the early access list for OctoSkills</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>OctoSkills</Text>
          </Section>

          <Heading style={heading}>You&apos;re on the list!</Heading>

          <Text style={paragraph}>
            Thanks for signing up for early access to OctoSkills. We&apos;re
            building something special and you&apos;ll be among the first to
            try it.
          </Text>

          <Section style={featureSection}>
            <Text style={featureTitle}>What&apos;s coming:</Text>
            <Text style={featureItem}>
              &bull; AI-powered skill generation and management
            </Text>
            <Text style={featureItem}>
              &bull; Beautiful, production-ready templates
            </Text>
            <Text style={featureItem}>
              &bull; Seamless integration with your workflow
            </Text>
          </Section>

          <Section style={ctaSection}>
            <Link href="https://octoskills.dev" style={ctaButton}>
              Visit OctoSkills
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            This email was sent to {email ?? "you"} because you signed up for
            early access at OctoSkills.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

WelcomeEmail.PreviewProps = {
  email: "test@example.com",
} satisfies WelcomeEmailProps;

const body = {
  backgroundColor: "#0a0e17",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: "0" as const,
  padding: "0" as const,
};

const container = {
  backgroundColor: "#111827",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  margin: "40px auto",
  padding: "40px 32px",
  maxWidth: "480px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logoText = {
  color: "#22d3ee",
  fontSize: "28px",
  fontWeight: "700" as const,
  letterSpacing: "-0.5px",
  margin: "0" as const,
};

const heading = {
  color: "#f9fafb",
  fontSize: "24px",
  fontWeight: "600" as const,
  letterSpacing: "-0.3px",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#9ca3af",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 24px",
};

const featureSection = {
  backgroundColor: "rgba(255, 255, 255, 0.03)",
  borderRadius: "6px",
  padding: "20px 24px",
  marginBottom: "32px",
};

const featureTitle = {
  color: "#e5e7eb",
  fontSize: "14px",
  fontWeight: "600" as const,
  margin: "0 0 12px",
};

const featureItem = {
  color: "#9ca3af",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 8px",
};

const ctaSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const ctaButton = {
  backgroundColor: "#22d3ee",
  borderRadius: "6px",
  color: "#0a0e17",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600" as const,
  padding: "10px 24px",
  textDecoration: "none",
};

const hr = {
  borderColor: "rgba(255, 255, 255, 0.08)",
  margin: "0 0 16px",
};

const footer = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0" as const,
};

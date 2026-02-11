import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface AdminNotificationEmailProps {
  email?: string;
  signedUpAt?: string;
}

export default function AdminNotificationEmail({
  email,
  signedUpAt,
}: AdminNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New beta signup: {email ?? "unknown"}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>OctoSkills</Text>
          </Section>

          <Heading style={heading}>New Beta Signup</Heading>

          <Text style={paragraph}>
            Someone just signed up for early access.
          </Text>

          <Section style={detailSection}>
            <Text style={detailLabel}>Email</Text>
            <Text style={detailValue}>{email ?? "unknown"}</Text>

            <Text style={detailLabel}>Signed up at</Text>
            <Text style={detailValue}>{signedUpAt ?? "unknown"}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            This is an automated notification from OctoSkills.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

AdminNotificationEmail.PreviewProps = {
  email: "test@example.com",
  signedUpAt: new Date().toISOString(),
} satisfies AdminNotificationEmailProps;

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

const detailSection = {
  backgroundColor: "rgba(255, 255, 255, 0.03)",
  borderRadius: "6px",
  padding: "20px 24px",
  marginBottom: "32px",
};

const detailLabel = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "600" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px",
};

const detailValue = {
  color: "#e5e7eb",
  fontSize: "15px",
  lineHeight: "20px",
  margin: "0 0 16px",
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

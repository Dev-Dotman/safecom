import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Img,
} from "@react-email/components";

export default function VerificationCodeEmail({
  customerName = "Customer",
  orderNumber = "00000000",
  verificationCode = "000000",
  riderName = "Rider",
}) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={logo}>SafeCom</Heading>
            <Text style={subtitle}>Delivery Verification</Text>
          </Section>

          <Hr style={divider} />

          <Section style={contentSection}>
            <Text style={greeting}>Hello {customerName},</Text>

            <Text style={paragraph}>
              Your delivery rider <strong>{riderName}</strong> is here to deliver
              your order <strong>#{orderNumber}</strong>. Please share the
              verification code below with your rider to confirm your identity.
            </Text>

            <Section style={codeContainer}>
              <Text style={codeLabel}>Your Verification Code</Text>
              <Heading style={codeText}>{verificationCode}</Heading>
            </Section>

            <Text style={warningText}>
              This code expires in 10 minutes. Do not share this code with anyone
              other than your delivery rider.
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footerSection}>
            <Text style={footerText}>
              This email was sent by SafeCom. If you did not place this order,
              please contact our support team immediately.
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} SafeCom - Safe Commerce
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  maxWidth: "480px",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid #e5e7eb",
};

const headerSection = {
  backgroundColor: "#059669",
  padding: "32px 40px",
  textAlign: "center",
};

const logo = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 4px 0",
};

const subtitle = {
  color: "#a7f3d0",
  fontSize: "14px",
  margin: "0",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "0",
};

const contentSection = {
  padding: "32px 40px",
};

const greeting = {
  fontSize: "16px",
  color: "#111827",
  margin: "0 0 16px 0",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#4b5563",
  margin: "0 0 24px 0",
};

const codeContainer = {
  backgroundColor: "#f0fdf4",
  border: "2px dashed #059669",
  borderRadius: "12px",
  padding: "24px",
  textAlign: "center",
  margin: "0 0 24px 0",
};

const codeLabel = {
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "1px",
  color: "#059669",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const codeText = {
  fontSize: "40px",
  fontWeight: "800",
  letterSpacing: "8px",
  color: "#059669",
  margin: "0",
};

const warningText = {
  fontSize: "13px",
  color: "#9ca3af",
  fontStyle: "italic",
  margin: "0",
};

const footerSection = {
  padding: "24px 40px",
  backgroundColor: "#f9fafb",
};

const footerText = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: "0 0 8px 0",
  textAlign: "center",
};

const footerCopyright = {
  fontSize: "12px",
  color: "#d1d5db",
  margin: "0",
  textAlign: "center",
};

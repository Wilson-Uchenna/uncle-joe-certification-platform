// app/_components/emails/AdminWelcomeEmail.tsx
interface AdminWelcomeEmailProps {
  name: string;
  loginUrl: string;
}

export function AdminWelcomeEmail({ name, loginUrl }: AdminWelcomeEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <h2 style={{ color: "#1a1a1a" }}>You've been made an admin</h2>
      <p>Hi {name},</p>
      <p>
        Your account on A.R.W.P.C has been updated to <strong>admin</strong>{" "}
        status. You now have access to the admin dashboard.
      </p>
      <div style={{ textAlign: "center", margin: "24px 0" }}>
        <a
          href={loginUrl}
          style={{
            background: "#4F46E5",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold",
            display: "inline-block",
          }}
        >
          Sign In to Admin Dashboard
        </a>
      </div>
      <p style={{ fontSize: 13, color: "#666" }}>
        If you weren't expecting this, please contact support immediately.
      </p>
    </div>
  );
}
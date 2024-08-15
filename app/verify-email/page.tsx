import Link from 'next/link';

export default function VerifyEmail() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
        <p className="mb-4">We have sent you an email with a link to verify your account. Please check your inbox and click the link to complete your registration.</p>
        <p className="mb-4">If you didn't receive the email, please check your spam folder or <Link href="/resend-verification">click here</Link> to resend the verification email.</p>
        <Link href="/">
          <a className="text-blue-500">Go to Home</a>
        </Link>
      </div>
    </div>
  );
}

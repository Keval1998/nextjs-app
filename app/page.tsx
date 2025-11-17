import Link from 'next/link';

export default function Home() {
  return (
    <main style={{
      display: 'flex',
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
      gap: '20px'
    }}>
      <h1>Hello World 🚀</h1>
      <p>My first Next.js app</p>
      <Link href="/notes" style={{
        color: '#0070f3',
        textDecoration: 'underline'
      }}>
        Go to Notes Page
      </Link>
    </main>
  );
}

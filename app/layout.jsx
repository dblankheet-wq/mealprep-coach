import './globals.css';

export const metadata = {
  title: 'Mealprep Coach',
  description: 'Mobiele mealprep app voor afvallen, boodschappen en analyses'
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}

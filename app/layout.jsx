import './globals.css';

export const metadata = {
  title: 'Mealprep Coach 2.0',
  description: 'Persoonlijke mealprep coach met chat, dagadvies, boodschappen en analyses'
};

export default function RootLayout({ children }) {
  return <html lang="nl"><body>{children}</body></html>;
}

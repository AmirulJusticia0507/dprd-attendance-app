import '../css/style.css';
import Shell from '../components/Shell';

export const metadata = {
  title: 'DPRD Attendance System',
  description: 'Sistem Kehadiran Anggota DPRD Kabupaten Sleman',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}

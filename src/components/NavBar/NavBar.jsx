'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './NavBar.module.scss';

const links = [
  { href: '/draw', label: 'Draw' },
  { href: '/manage', label: 'Manage' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <span className={styles.logo}>Card Chat</span>
      <ul className={styles.links}>
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={`${styles.link} ${pathname.startsWith(href) ? styles.active : ''}`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

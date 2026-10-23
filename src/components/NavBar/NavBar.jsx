'use client';

import Button from '@mui/joy/Button';
import Switch from '@mui/joy/Switch';
import { useColorScheme } from '@mui/joy/styles';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './NavBar.module.scss';

const links = [
  { href: '/draw', label: 'Draw' },
  { href: '/manage', label: 'Manage' },
];

function SunIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && mode === 'dark';

  const { data: session, status } = useSession();

  // Full page load so the Redux store (cards, draw pool) of this user
  // doesn't leak into the next session in the same tab
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.assign('/login');
  };

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
      <Switch
        className={styles.themeSwitch}
        checked={isDark}
        onChange={(event) => setMode(event.target.checked ? 'dark' : 'light')}
        startDecorator={<SunIcon />}
        endDecorator={<MoonIcon />}
        disabled={!mounted}
        slotProps={{
          input: { 'aria-label': '切換深色模式' },
        }}
      />
      <div className={styles.userSection}>
        {status === 'authenticated' && (
          <>
            <span className={styles.userEmail}>{session.user.email}</span>
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={handleSignOut}
            >
              登出
            </Button>
          </>
        )}
        {status === 'unauthenticated' && (
          <Link href="/login">
            <Button size="sm" variant="soft">
              登入
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}

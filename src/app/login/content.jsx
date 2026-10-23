'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm, Controller } from 'react-hook-form';
import Link from 'next/link';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import styles from './page.module.scss';

// Only allow same-origin paths, so ?callbackUrl= can't redirect off-site
const safeCallbackUrl = (url) =>
  url?.startsWith('/') && !url.startsWith('//') ? url : '/draw';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));
  const [serverError, setServerError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setServerError('');
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) {
      setServerError('電子郵件或密碼不正確');
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  });

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Typography level="h3" textAlign="center">登入</Typography>

        {serverError && <div className={styles.error}>{serverError}</div>}

        <form onSubmit={onSubmit} className={styles.form}>
          <Controller
            name="email"
            control={control}
            rules={{ required: '請輸入電子郵件' }}
            render={({ field, fieldState }) => (
              <FormControl error={!!fieldState.error}>
                <FormLabel>電子郵件</FormLabel>
                <Input {...field} type="email" placeholder="you@example.com" />
                {fieldState.error && (
                  <FormHelperText>{fieldState.error.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
          <Controller
            name="password"
            control={control}
            rules={{ required: '請輸入密碼' }}
            render={({ field, fieldState }) => (
              <FormControl error={!!fieldState.error}>
                <FormLabel>密碼</FormLabel>
                <Input {...field} type="password" placeholder="••••••••" />
                {fieldState.error && (
                  <FormHelperText>{fieldState.error.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
          <Button type="submit" fullWidth loading={isSubmitting}>
            登入
          </Button>
        </form>

        <p className={styles.footer}>
          還沒有帳號？{' '}
          <Link href="/register" className={styles.link}>
            立即註冊
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginContent() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

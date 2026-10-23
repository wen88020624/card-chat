'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm, Controller } from 'react-hook-form';
import Link from 'next/link';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import { authApi } from '@redux/api/apiService';
import styles from './page.module.scss';

export default function RegisterContent() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '', confirm: '' } });

  const password = watch('password');

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setServerError('');
    try {
      await authApi.register({ email, password });
    } catch (err) {
      setServerError(err.message || '註冊失敗，請稍後再試');
      return;
    }

    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) {
      router.push('/login');
      return;
    }

    router.push('/draw');
    router.refresh();
  });

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Typography level="h3" textAlign="center">建立帳號</Typography>

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
            rules={{
              required: '請輸入密碼',
              minLength: { value: 8, message: '密碼至少需要 8 個字元' },
            }}
            render={({ field, fieldState }) => (
              <FormControl error={!!fieldState.error}>
                <FormLabel>密碼</FormLabel>
                <Input {...field} type="password" placeholder="至少 8 個字元" />
                {fieldState.error && (
                  <FormHelperText>{fieldState.error.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
          <Controller
            name="confirm"
            control={control}
            rules={{
              required: '請確認密碼',
              validate: (v) => v === password || '兩次密碼不一致',
            }}
            render={({ field, fieldState }) => (
              <FormControl error={!!fieldState.error}>
                <FormLabel>確認密碼</FormLabel>
                <Input {...field} type="password" placeholder="再次輸入密碼" />
                {fieldState.error && (
                  <FormHelperText>{fieldState.error.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
          <Button type="submit" fullWidth loading={isSubmitting}>
            建立帳號
          </Button>
        </form>

        <p className={styles.footer}>
          已有帳號？{' '}
          <Link href="/login" className={styles.link}>
            立即登入
          </Link>
        </p>
      </div>
    </div>
  );
}

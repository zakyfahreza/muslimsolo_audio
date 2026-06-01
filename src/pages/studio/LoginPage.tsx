import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Spinner } from '../../components/ui/Spinner';
import { PlayIcon } from '../../components/icons';
import { useAuthStore } from '../../store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const loginCredential = useAuthStore((s) => s.loginCredential);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginCredential(username, password);
      navigate('/studio');
    } catch {
      /* error surfaced from store */
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-primary/10 to-surface-light px-4 dark:from-brand-primary/5 dark:to-surface-dark">
      <Seo title="Masuk Studio" />
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg">
            <PlayIcon className="h-6 w-6 text-brand-accent" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">
            Muslimsolo Studio
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Dashboard pengelolaan audio kajian
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-slate-900">
          <form onSubmit={submit} className="space-y-4">
            <Input
              label="ID Admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              autoFocus
            />
            <Input
              label="Kata Sandi"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <p className="text-xs text-slate-400">
              Hanya admin dengan ID dan kata sandi yang benar yang dapat masuk. Koneksi GitHub untuk
              mode live diatur sekali di halaman Pengaturan.
            </p>

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Spinner />}
              Masuk
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

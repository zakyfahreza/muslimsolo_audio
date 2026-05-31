import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Spinner } from '../../components/ui/Spinner';
import { PlayIcon, CheckIcon, ChevronRightIcon } from '../../components/icons';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

type Step = 'admin' | 'github';

export function LoginPage() {
  const navigate = useNavigate();
  const loginCredential = useAuthStore((s) => s.loginCredential);
  const loginGithub = useAuthStore((s) => s.loginGithub);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  const [step, setStep] = useState<Step>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  // Step 1: verify admin credentials, then advance to the GitHub step.
  const submitAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginCredential(username, password);
      setStep('github');
    } catch {
      /* error surfaced from store */
    }
  };

  // Step 2: connect GitHub (for live mode) — or skip to enter the studio.
  const submitGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginGithub(token);
      navigate('/studio');
    } catch {
      /* error surfaced from store */
    }
  };

  const skipGithub = () => navigate('/studio');

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

        {/* Step indicator */}
        <div className="mb-5 flex items-center justify-center gap-3">
          <StepDot index={1} label="Login Admin" active={step === 'admin'} done={step === 'github'} />
          <span className="h-0.5 w-8 rounded bg-slate-200 dark:bg-slate-700" />
          <StepDot index={2} label="GitHub" active={step === 'github'} done={false} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-slate-900">
          {step === 'admin' ? (
            <form onSubmit={submitAdmin} className="space-y-4">
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
                Hanya admin dengan ID dan kata sandi yang benar yang dapat melanjutkan.
              </p>

              {error && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Spinner />}
                Lanjut
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={submitGithub} className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CheckIcon className="h-4 w-4" />
                Login admin berhasil.
              </div>
              <Input
                label="GitHub Personal Access Token"
                hint="opsional"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="github_pat_..."
                autoFocus
              />
              <p className="text-xs text-slate-400">
                Hubungkan GitHub untuk mode live (menyimpan kajian ke repo). Gunakan fine-grained
                token dengan izin <strong>Contents: Read & Write</strong>. Token hanya disimpan di
                browser Anda. Lewati untuk memakai mode demo lokal.
              </p>

              {error && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading || !token.trim()}>
                {loading && <Spinner />}
                Hubungkan GitHub & Masuk
              </Button>
              <button
                type="button"
                onClick={skipGithub}
                className="w-full text-center text-sm font-semibold text-slate-500 hover:text-brand-primary dark:text-slate-400 dark:hover:text-brand-accent"
              >
                Lewati, masuk dengan mode demo
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function StepDot({
  index,
  label,
  active,
  done,
}: {
  index: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition',
          active || done
            ? 'bg-brand-primary text-white'
            : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
        )}
      >
        {done ? <CheckIcon className="h-4 w-4" /> : index}
      </span>
      <span
        className={cn(
          'text-xs font-semibold',
          active || done ? 'text-slate-900 dark:text-white' : 'text-slate-400',
        )}
      >
        {label}
      </span>
    </div>
  );
}

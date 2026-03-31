import { cn } from '../../lib/utils';

type Props = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
};

export function Switch({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'inline-flex items-center gap-3 rounded-2xl border border-white/10 px-3 py-2 text-left transition hover:bg-white/5',
        checked && 'border-sky-400/30 bg-sky-400/10'
      )}
    >
      <span
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full border transition',
          checked ? 'border-sky-400/40 bg-sky-400/50' : 'border-white/10 bg-white/10'
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 size-5 rounded-full bg-white shadow transition',
            checked && 'translate-x-5'
          )}
        />
      </span>
      {label ? <span className="text-sm text-slate-200">{label}</span> : null}
    </button>
  );
}

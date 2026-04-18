import { AbstractControl } from '@angular/forms';

/** Server: min 5, digit, lower, upper, special from @#$%^&+=! */
export function signupPasswordValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const v = control.value as string;
  if (!v) return null;
  if (v.length < 5) return { signupPasswordMin: true };
  if (!/[a-z]/.test(v)) return { signupPasswordLower: true };
  if (!/[A-Z]/.test(v)) return { signupPasswordUpper: true };
  if (!/[0-9]/.test(v)) return { signupPasswordDigit: true };
  if (!/[@#$%^&+=!]/.test(v)) return { signupPasswordSpecial: true };
  return null;
}

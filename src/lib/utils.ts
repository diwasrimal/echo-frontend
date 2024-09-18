import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// export function getLoggedInUserId(): number | undefined {
//   const value = localStorage.getItem("loggedInUserId");
//   return value ? Number(value) : undefined;
// }

// export function saveLoggedInUserId(id: number) {
//   localStorage.setItem("loggedInUserId", String(id));
// }

// export function getMessagesFromSession(pairId: number) {
//   const stored = sessionStorage.getItem(`messages:${pairId}`);
//   if (!stored) return undefined;
//   return JSON.parse(stored) as Message[];
// }

// export function saveMessagesToSession(pairId: number, msgs: Message[]) {
//   sessionStorage.setItem(`messages:${pairId}`, JSON.stringify(msgs));
// }

export async function makePayload(res: Response) {
  return { ok: res.ok, status: res.status, ...(await res.json()) };
}

export async function fetchWithDelay(
  delay: number,
  input: string | URL | globalThis.Request,
  init?: RequestInit,
): Promise<Response> {
  return new Promise<Response>((resolve, reject) => {
    setTimeout(() => {
      fetch(input, init).then(resolve).catch(reject);
    }, delay);
  });
}

// Formats date as one of the following by comparing today and given date
// - 10:50 PM
// - 22 Jan, 10:50PM
// - 22 Jan, 2024, 10:50PM
export function formatChatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  // Add month and day if not same
  if (today.getDate() !== d.getDate() || today.getMonth() !== d.getMonth()) {
    options.month = "short";
    options.day = "numeric";
  }

  // Add year if not same
  if (today.getFullYear() !== d.getFullYear()) {
    options.year = "numeric";
  }
  return d.toLocaleString("default", options);
}

export function debounce<F extends (...args: any[]) => void>(
  func: F,
  delay: number,
) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<F>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

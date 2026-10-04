export const CANCEL_WINDOW_HOURS = 2;

export function willRefund(startAtIso: string) {
  return (
    new Date(startAtIso).getTime() - Date.now() >=
    CANCEL_WINDOW_HOURS * 60 * 60 * 1000
  );
}

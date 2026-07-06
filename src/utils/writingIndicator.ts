export function getWritingIndicatorMessage(textLength: number): string {
  if (textLength < 20) {
    return 'A few honest words are enough.';
  }
  if (textLength <= 200) {
    return 'Keep going if there’s more.';
  }
  return 'You’re giving yourself space. Good.';
}

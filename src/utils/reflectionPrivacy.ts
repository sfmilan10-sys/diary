export function isRemoteReflectionEnabled(): boolean {
  const endpoint = process.env.EXPO_PUBLIC_AI_REFLECTION_ENDPOINT?.trim();
  return Boolean(endpoint);
}

export function getPrivacyReassuranceMessage(): string {
  if (isRemoteReflectionEnabled()) {
    return 'Your entries are only sent for reflection when you tap Reflect.';
  }
  return 'Reflections are generated privately on this device.';
}

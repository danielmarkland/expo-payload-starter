export function welcomeEmailSubject(): string {
  return 'Welcome to your new app'
}

export function welcomeEmailText(displayName: string): string {
  return `Welcome, ${displayName}. Your account is ready on web, iOS, and Android.`
}

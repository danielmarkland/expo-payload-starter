import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

export interface WelcomeEmailProps {
  displayName: string
}

export function WelcomeEmail({ displayName }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to your new app</Preview>
      <Body style={{ backgroundColor: '#f4f7fb', fontFamily: 'sans-serif' }}>
        <Container
          style={{
            backgroundColor: '#ffffff',
            margin: '32px auto',
            padding: '32px',
          }}
        >
          <Heading>Welcome, {displayName}</Heading>
          <Text>Your account is ready on web, iOS, and Android.</Text>
        </Container>
      </Body>
    </Html>
  )
}

WelcomeEmail.PreviewProps = { displayName: 'Ada' } satisfies WelcomeEmailProps

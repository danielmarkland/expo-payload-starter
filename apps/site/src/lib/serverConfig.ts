export {
  getSiteURL,
  getPreviewSecret,
  getContactEmailConfig,
  getNewsletterConfig,
  getDatabasePoolConfig,
  getPayloadStorageOptions,
} from '@danielmarkland/publishing-core/serverEnvironment'

// The independent Supabase starter retains its existing hosted environment.
// Shared publishing configuration uses standard S3 names; GroovePost supplies them directly.
import { getStorageConfig as sharedStorageConfig } from '@danielmarkland/publishing-core/serverEnvironment'
type Environment = Record<string, string | undefined>
function storageEnvironment(environment: Environment) {
  return {
    ...environment,
    AWS_ACCESS_KEY_ID: environment.AWS_ACCESS_KEY_ID ?? environment.SUPABASE_S3_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY:
      environment.AWS_SECRET_ACCESS_KEY ?? environment.SUPABASE_S3_SECRET_ACCESS_KEY,
    AWS_ENDPOINT_URL_S3: environment.AWS_ENDPOINT_URL_S3 ?? environment.SUPABASE_S3_ENDPOINT,
    AWS_REGION: environment.AWS_REGION ?? environment.SUPABASE_S3_REGION,
  }
}
export function getStorageConfig(environment: Environment = process.env) {
  return sharedStorageConfig(storageEnvironment(environment))
}

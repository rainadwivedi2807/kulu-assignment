// Minimal OpenAPI V3 Types
export interface OpenAPIParameter {
  name: string
  in: 'query' | 'header' | 'path' | 'cookie'
  description?: string
  required?: boolean
  schema?: Record<string, unknown>
}

export interface OpenAPIResponse {
  description: string
  content?: Record<string, { schema: Record<string, unknown> }>
}

export interface OpenAPIOperation {
  operationId?: string
  summary?: string
  description?: string
  parameters?: OpenAPIParameter[]
  requestBody?: {
    description?: string
    required?: boolean
    content: Record<string, { schema: Record<string, unknown> }>
  }
  responses?: Record<string, OpenAPIResponse>
}

export interface OpenAPIPathItem {
  get?: OpenAPIOperation
  put?: OpenAPIOperation
  post?: OpenAPIOperation
  delete?: OpenAPIOperation
  options?: OpenAPIOperation
  head?: OpenAPIOperation
  patch?: OpenAPIOperation
  trace?: OpenAPIOperation
}

export interface OpenAPIObject {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
  }
  paths: Record<string, OpenAPIPathItem>
  components?: {
    schemas?: Record<string, Record<string, unknown>>
  }
}

export interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
}

export interface SdkLink {
  lang: string
  install: string
  repo: string
}

export interface ApiDefinition {
  id: string // unique slug e.g. "pokeapi"
  name: string // display name
  version: string // semver e.g. "2.0.0"
  spec: OpenAPIObject // imported openapi.json
  docsFile?: string // path to .md quickstart
  changelog?: ChangelogEntry[] // imported changelog.json
  sdks?: SdkLink[] // { lang, install, repo }
  baseUrl: string // sandbox base URL
}

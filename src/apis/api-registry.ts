import type { ApiDefinition, OpenAPIObject } from '../types/openapi'

import pokeapiSpecJson from './pokeapi/openapi.json'
import pokeapiChangelogJson from './pokeapi/changelog.json'
import stubReviewerSpecJson from './stub-reviewer/openapi.json'

const pokeapiSpec = pokeapiSpecJson as unknown as OpenAPIObject
const stubReviewerSpec = stubReviewerSpecJson as unknown as OpenAPIObject

export const API_REGISTRY: ApiDefinition[] = [
  {
    id: "pokeapi",
    name: "PokéAPI",
    version: "2.0.0",
    spec: pokeapiSpec,
    baseUrl: "https://pokeapi.co/api/v2",
    changelog: pokeapiChangelogJson,
    sdks: [
      { lang: 'JavaScript', install: 'npm install pokeapi-js-wrapper', repo: 'https://github.com/PokeAPI/pokeapi-js-wrapper' }
    ]
  },
  {
    id: "stub-reviewer",
    name: "Reviewer Custom API",
    version: "1.0.0",
    spec: stubReviewerSpec,
    baseUrl: "https://api.example.com",
    changelog: [],
    sdks: []
  }
];

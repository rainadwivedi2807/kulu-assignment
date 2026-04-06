import type { ApiDefinition, OpenAPIObject, ChangelogEntry } from '../types/openapi'

import pokeapiSpecJson from './pokeapi/openapi.json'
import pokeapiChangelogJson from './pokeapi/changelog.json'

const pokeapiSpec = pokeapiSpecJson as unknown as OpenAPIObject

export const API_REGISTRY: ApiDefinition[] = [
  {
    id: "pokeapi",
    name: "PokéAPI",
    version: "2.0.0",
    spec: pokeapiSpec,
    docsFile: "./pokeapi/docs.md",
    changelog: pokeapiChangelogJson as ChangelogEntry[],
    baseUrl: "https://pokeapi.co/api/v2",
    sdks: [
      { lang: 'JavaScript', install: 'npm install pokeapi-js-wrapper', repo: 'https://github.com/PokeAPI/pokeapi-js-wrapper' }
    ]
  }
];

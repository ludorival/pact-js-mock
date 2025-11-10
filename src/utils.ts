import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs'
import { Pact } from './core'
import { PactRegistry } from './core/registry'
import { PactFile } from './types'
import path from 'path'

export function readPact<P extends PactFile>(filePath: string): P | null {
  if (existsSync(filePath)) {
    const fileContent = readFileSync(filePath, 'utf-8')
    return JSON.parse(fileContent) as P
  }
  return null
}
export function reloadPact<P extends PactFile>(pact: Pact<P>) {
  pact.reset(readPact<P>(pact.fileName))
}

export function deletePact<P extends PactFile>(pact: Pact<P>) {
  const filePath = pact.fileName
  if (existsSync(filePath)) {
    rmSync(filePath, { recursive: true })
  }
}

export function writePact<P extends PactFile>(pact: Pact<P>): void {
  const filePath = pact.fileName
  const outputDir = path.dirname(filePath)
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }
  const content = JSON.stringify(pact.generatePactFile(), null, 2)
  writeFileSync(filePath, content, 'utf-8')
}

export function deletePacts<P extends PactFile>(
  registry: PactRegistry<P>,
): void {
  const pacts = registry.getAll()
  pacts.forEach((pact) => {
    deletePact(pact)
  })
}

export function writePacts<P extends PactFile>(
  registry: PactRegistry<P>,
): void {
  const pacts = registry.getAll()
  pacts.forEach((pact) => {
    writePact(pact)
  })
}

export function reloadPacts<P extends PactFile>(
  registry: PactRegistry<P>,
): void {
  const pacts = registry.getAll()
  pacts.forEach((pact) => {
    reloadPact(pact)
  })
}

export function setCurrentSourceForPacts<P extends PactFile>(
  registry: PactRegistry<P>,
  source: string | undefined,
): void {
  const pacts = registry.getAll()
  pacts.forEach((pact) => {
    pact.setCurrentSource(source)
  })
}

import { type SchemaTypeDefinition } from 'sanity'

import { issueType } from './issueType'
import { issueSummaryType } from './issueSummaryType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [issueType, issueSummaryType],
}

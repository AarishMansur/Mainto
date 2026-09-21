import { type SchemaTypeDefinition } from 'sanity'

import { issueType } from './issueType'
import { issueSummaryType } from './issueSummaryType'
import { triagePatternType } from './triagePatternType'
import { triageDecisionType } from './triageDecisionType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [issueType, issueSummaryType, triagePatternType, triageDecisionType],
}

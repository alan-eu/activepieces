
import { createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { cycleAuth } from './lib/common';
import { cycleCreateFeedback, cycleAssignCountry, cycleGetAttributeValues, cycleExploreSchema, cycleCustomGraphql, cycleCustomApiCall } from './lib/actions';
import { cycleNewFeedback, cycleFeedbackStatusChanged, cycleFeedbackAssigned, cycleNewComment } from './lib/triggers';

export const cycle = createPiece({
  displayName: 'Cycle',
  description: 'Product feedback management platform for product teams',
  auth: cycleAuth,
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/cycle.png',
  authors: ['meenu-lekha-premakumar'],
  categories: [PieceCategory.PRODUCTIVITY],
  actions: [
    cycleCreateFeedback,
    cycleAssignCountry,
    cycleGetAttributeValues,
    cycleExploreSchema,
    cycleCustomGraphql,
    cycleCustomApiCall,
  ],
  triggers: [
    cycleNewFeedback,
    cycleFeedbackStatusChanged,
    cycleFeedbackAssigned,
    cycleNewComment,
  ],
});
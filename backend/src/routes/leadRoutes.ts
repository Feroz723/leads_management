import { Router } from 'express';
import * as leadController from '../controllers/leadController';
import authMiddleware from '../middleware/authMiddleware';
import roleMiddleware from '../middleware/roleMiddleware';
import {
  validateLeadCreate,
  validateLeadExportQuery,
  validateLeadListQuery,
  validateLeadUpdate,
} from '../middleware/validationMiddleware';

const router = Router();

router.get('/', authMiddleware, validateLeadListQuery, leadController.getLeads);
router.get('/export/csv', authMiddleware, roleMiddleware(['admin', 'sales_user']), validateLeadExportQuery, leadController.exportLeads);
router.get('/:id', authMiddleware, leadController.getLeadById);
router.post('/', authMiddleware, roleMiddleware(['admin', 'sales_user']), validateLeadCreate, leadController.createLead);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'sales_user']), validateLeadUpdate, leadController.updateLead);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), leadController.deleteLead);

export default router;

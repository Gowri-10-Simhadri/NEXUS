import { Router } from 'express';
import {
  getDocuments,
  createDocument,
  deleteDocument,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getDecisions,
  createDecision,
  deleteDecision,
  getKnowledgeGraph,
} from '../controllers/knowledgeController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// Documents
router.get('/documents', getDocuments);
router.post('/documents', createDocument);
router.delete('/documents/:id', deleteDocument);

// Notes
router.get('/notes', getNotes);
router.post('/notes', createNote);
router.put('/notes/:id', updateNote);
router.delete('/notes/:id', deleteNote);

// Decisions
router.get('/decisions', getDecisions);
router.post('/decisions', createDecision);
router.delete('/decisions/:id', deleteDecision);

// Knowledge Graph
router.get('/graph', getKnowledgeGraph);

export default router;

import express from 'express';
import AppController from '../appControllers/ivm';

const router = express.Router();

router.get('/suggestions', AppController.getSuggestions);
router.get('*', AppController.defaultPage);
export default router;

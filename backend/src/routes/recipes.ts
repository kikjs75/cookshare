import { Router } from 'express';
import {
  listRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  uploadImage,
  toggleLike,
} from '../controllers/recipeController';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', optionalAuth, listRecipes);
router.get('/:id', optionalAuth, getRecipe);
router.post('/', requireAuth, createRecipe);
router.put('/:id', requireAuth, updateRecipe);
router.delete('/:id', requireAuth, deleteRecipe);
router.post('/upload/image', requireAuth, upload.single('image'), uploadImage);
router.post('/:id/like', requireAuth, toggleLike);

export default router;

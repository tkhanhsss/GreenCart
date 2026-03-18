import express from 'express';
import { addCategory, listCategories, removeCategory } from '../controllers/categoryController.js';
import upload from '../middlewares/multer.js';
import authSeller from '../middlewares/authSeller.js';

const categoryRouter = express.Router();

categoryRouter.post('/add', authSeller, upload.single('image'), addCategory);
categoryRouter.get('/list', listCategories);
categoryRouter.post('/remove', authSeller, removeCategory);

export default categoryRouter;

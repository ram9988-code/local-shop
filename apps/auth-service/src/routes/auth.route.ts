import express, { Router } from 'express';
import {
  resetUserPassword,
  userForgotPassword,
  userLogin,
  userRegistration,
  verifyUser,
  verifyUserForgotPassword,
} from '../controller/auth.controller';

const router: Router = express.Router();

router.post('/register', userRegistration);
router.post('/verify', verifyUser);
router.post('/login', userLogin);
router.post('/forgot-password', userForgotPassword);
router.post('/verify-forgot-password', verifyUserForgotPassword);
router.post('/reset-password', resetUserPassword);

export default router;

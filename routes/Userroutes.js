import express from 'express';
import { body, validationResult } from 'express-validator';
import { addUser, getUser, loginUser, setNewPassword, checkEmail } from '../controllers/AuthUsers.js';
import { requestOtp, validateOtp, sendOtplogin } from '../controllers/Otp.js';


const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Routes with validation and error handling
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  handleValidationErrors,
  addUser
);

router.get('/users', getUser);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  handleValidationErrors,
  loginUser
);

router.post('/request-otp', requestOtp);

router.post('/validate-otp', validateOtp);

router.post('/set-new-password', setNewPassword);

router.post('/check-email', checkEmail);
router.post('/request-otp-login', sendOtplogin);

export default router;

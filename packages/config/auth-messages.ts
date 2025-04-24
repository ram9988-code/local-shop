export const apiMessages = {
  common: {
    success: 'Success',
    failure: 'Failure',
    notFound: 'Not Found',
    invalidRequest: 'Invalid Request',
    serverError: 'Server Error',
    unauthorized: 'Unauthorized',
    forbidden: 'Forbidden',
    badRequest: 'Bad Request',
    missingFields: 'Missing required fields',
    invalidData: 'Invalid data provided',
    internalServerError: 'Internal Server Error',
  },
  auth: {
    userRegistration: {
      success: 'User registered successfully',
      failure: 'User registration failed',
      invalidEmail: 'Invalid email format',
      emailExists: 'Email already exists',
      passwordTooWeak: 'Password must be at least 8 characters long',
      otpSent: 'OTP sent to your email. Please verify to complete registration',
      otpNotSent: 'Failed to send OTP. Please try again later',
      otpVerified: 'OTP verified successfully',
      otpExpired: 'OTP has expired. Please request a new one',
      invalidOtp: 'Invalid OTP provided',
      otpLock:
        'Too many failed attempts.Your account is locked for 30 minutes!',
    },
    userLogin: {
      success: 'User logged in successfully',
      failure: 'User login failed',
      invalidCredentials: 'Invalid email or password',
      userNotExists: 'User does not exist',
    },
    passwordReset: {
      emailIsRequired: 'Email is required',
      success: 'Password reset link sent to your email',
      failure: 'Failed to send password reset link',
      invalidToken: 'Invalid or expired token',
      emailOtpRequired: 'Email and OTP are required!',
    },
  },
};

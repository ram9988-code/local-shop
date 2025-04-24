import crypto from 'crypto';

import redis from '@packages/libs/redis';
import { apiMessages } from '@packages/config/auth-messages';

import { sendEmail } from './sendMail';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
  country?: string;
}

export const validateRegistrationData = (
  data: RegistrationData,
  userType: 'user' | 'seller'
): string | null => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === 'seller' && (!country || !phone_number))
  ) {
    return apiMessages.common.missingFields;
  }
  if (!emailRegex.test(email)) {
    return apiMessages.auth.userRegistration.invalidEmail;
  }

  if (password.length < 8) {
    return apiMessages.auth.userRegistration.passwordTooWeak;
  }
  return null;
};

export const checkOtpRestrication = async (
  email: string
): Promise<string | null> => {
  const otpLock = await redis.get(`otp_lock:${email}`);
  const otpSpamLock = await redis.get(`otp_spam_lock:${email}`);
  const otpCooldown = await redis.get(`otp_cooldown:${email}`);

  if (otpLock) {
    return 'You are sending OTP too frequently. Please try again after 30 minutes.';
  }

  if (otpSpamLock) {
    return 'Too many OTP requests. Please wait 1 hour before trying again.';
  }

  if (otpCooldown) {
    return 'Please wait 1 minute before requesting a new OTP.';
  }

  return null; // No restriction
};

export const trackOtpRequests = async (
  email: string
): Promise<string | null> => {
  const otpRequestKey = `otp_count:${email}`;

  const otpCount = parseInt((await redis.get(otpRequestKey)) || '0');

  if (otpCount >= 2) {
    await redis.set(`otp_spam_lock:${email}`, 'true', 'EX', 60 * 60);
    return 'Too many OTP requests. Please wait 1 hour before trying again.';
  }
  await redis.set(otpRequestKey, otpCount + 1, 'EX', 60 * 60);
  return null; // No restriction
};

export const sendOtp = async (
  email: string,
  name: string,
  template: string
) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  await sendEmail(email, 'Varify Your Email', template, { name, otp });
  await redis.set(`otp:${email}`, otp, 'EX', 60 * 5);
  await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60);
};

export const verifyOtp = async (
  email: string,
  otp: string
): Promise<string | null> => {
  const storedOtp = await redis.get(`otp:${email}`);

  if (!storedOtp) {
    return apiMessages.auth.userRegistration.otpExpired; // OTP not found or expired
  }

  const failedAttemptKey = `otp_failed_attempts:${email}`;
  const failedAttempts = parseInt((await redis.get(failedAttemptKey)) || '0');

  if (storedOtp !== otp) {
    if (failedAttempts >= 3) {
      await redis.set(`otp_lock:${email}`, 'locked', 'EX', 60 * 30);
      await redis.del(`otp:${email}`, failedAttemptKey);
      return apiMessages.auth.userRegistration.otpLock; // OTP lock due to too many failed attempts
    }

    await redis.set(failedAttemptKey, failedAttempts + 1, 'EX', 60 * 5);
    return `Incorrect OTP. You have ${3 - failedAttempts} attempts left.`; // Incorrect OTP
  }

  await redis.del(`otp:${email}`, failedAttemptKey);

  return null; // OTP verified successfully
};

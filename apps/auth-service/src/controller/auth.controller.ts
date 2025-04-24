import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

import {
  checkOtpRestrication,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
} from '../utils/auth.helper';

import prisma from '@packages/libs/prisma';
import { apiMessages } from '@packages/config/auth-messages';
import { ValidationErrorHandler } from '@packages/error-handler';
import { setCookie } from '../utils/cookies/set-cookie';

// Function to handle user registration
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationMessage = validateRegistrationData(req.body, 'user');
    if (validationMessage) {
      return next(new ValidationErrorHandler(validationMessage));
    }
    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      throw new ValidationErrorHandler(
        apiMessages.auth.userRegistration.emailExists
      );
    }
    const restrictionMessage = await checkOtpRestrication(email);
    if (restrictionMessage) {
      return next(new ValidationErrorHandler(restrictionMessage));
    }

    const trackMessage = await trackOtpRequests(email);
    if (trackMessage) {
      return next(new ValidationErrorHandler(trackMessage));
    }

    await sendOtp(email, name, 'user-activation-mail');

    return res.status(200).json({
      message: apiMessages.auth.userRegistration.otpSent,
    });
  } catch (err) {
    return next(err);
  }
};

// Function to handle verification of user registration OTP
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp || !password || !name) {
      throw new ValidationErrorHandler(apiMessages.common.missingFields);
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (user) {
      throw new ValidationErrorHandler(
        apiMessages.auth.userRegistration.emailExists
      );
    }

    await verifyOtp(email, otp);

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      message: apiMessages.auth.userRegistration.otpVerified,
    });
  } catch (err) {
    return next(err);
  }
};

// Function to handle user login
export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ValidationErrorHandler('Email and Password are required!');
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      throw new ValidationErrorHandler(
        apiMessages.auth.userLogin.userNotExists
      );
    }

    if (!user.password) {
      throw new ValidationErrorHandler(
        apiMessages.auth.userLogin.userNotExists
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ValidationErrorHandler(
        apiMessages.auth.userLogin.invalidCredentials
      );
    }

    const accessToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: '15m',
      }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '7d' }
    );

    //save refresh token and access in an httpOnly cookie
    setCookie({ res, name: 'refreshToken', value: refreshToken });
    setCookie({ res, name: 'accessToken', value: accessToken });

    res.status(200).json({
      message: apiMessages.auth.userLogin.success,
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
    });
  } catch (err) {
    return next(err);
  }
};

//user forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const userType = 'user';

    if (!email) {
      throw new ValidationErrorHandler(apiMessages.common.missingFields);
    }

    const user =
      userType === 'user' &&
      (await prisma.users.findUnique({ where: { email } }));
    if (!user) {
      throw new ValidationErrorHandler(
        apiMessages.auth.userLogin.userNotExists
      );
    }

    //Check otp restriction
    const restrictionMessage = await checkOtpRestrication(email);
    if (restrictionMessage) {
      return next(new ValidationErrorHandler(restrictionMessage));
    }

    const trackMessage = await trackOtpRequests(email);
    if (trackMessage) {
      return next(new ValidationErrorHandler(trackMessage));
    }

    await sendOtp(email, user.name, 'forgot-password-mail');

    return res.status(200).json({
      message: apiMessages.auth.userRegistration.otpSent,
    });
  } catch (err) {
    return next(err);
  }
};

export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(
        new ValidationErrorHandler(
          apiMessages.auth.passwordReset.emailOtpRequired
        )
      );
    }

    const varifyOtpMessage = await verifyOtp(email, otp);
    if (varifyOtpMessage) {
      return next(new ValidationErrorHandler(varifyOtpMessage));
    }

    res.status(200).json({
      message: 'OTP verified. You can not reset your password.',
    });
  } catch (error) {
    return next(error);
  }
};

//Reset User Password
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return next(
        new ValidationErrorHandler('Email and new password is required!')
      );
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return next(new ValidationErrorHandler('User not found!'));
    }

    //Compare new password with the exisiting one
    if (!user.password) {
      return next(new ValidationErrorHandler('User password is not set!'));
    }
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return next(
        new ValidationErrorHandler(
          'New password cannot be the same as the old password!'
        )
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      message: 'Password reset Successfully!',
    });
  } catch (error) {
    next(error);
  }
};

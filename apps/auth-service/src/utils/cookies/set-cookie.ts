import { Response } from 'express';

interface CookieOptions {
  res: Response;
  name: string;
  value: string;
}

export const setCookie = ({ name, res, value }: CookieOptions) => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
  });
};

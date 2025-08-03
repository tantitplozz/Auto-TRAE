// d:\Trae\backend\src\config\security.ts

export const securityConfig = {
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key',
  saltRounds: 10,
};

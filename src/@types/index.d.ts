import { User as user } from '../users/interface/user.interface';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface User extends user {}
    export interface Request {
      cookies: {
        access_token: {
          token: string;
        };
      };
    }
  }
}

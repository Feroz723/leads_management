import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import User, { IUser } from '../models/User';

interface TokenPayload {
  userId: string;
  role: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'sales_user';
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

export class AuthService {
  static async register(data: RegisterData): Promise<AuthResponse> {
    const email = data.email.trim().toLowerCase();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      name: data.name,
      email,
      password: hashedPassword,
      role: data.role || 'sales_user',
    });

    const token = AuthService.generateToken(user._id.toString(), user.role);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await AuthService.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = AuthService.generateToken(user._id.toString(), user.role);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  static async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static generateToken(userId: string, role: string): string {
    const payload: TokenPayload = { userId, role };
    const secret = process.env.JWT_SECRET as Secret;
    const expiresIn = process.env.JWT_EXPIRATION || '7d';

    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }
}

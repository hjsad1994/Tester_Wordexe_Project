const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const {
	UnauthorizedError,
	ConflictError,
	InternalServerError,
} = require('../errors');

const TOKEN_EXPIRES_IN = '7d';

const normalizeRole = (role) => (role === 'admin' ? 'admin' : 'user');

const signToken = (userId, role) => {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new InternalServerError('JWT_SECRET is not configured');
	}
	return jwt.sign({ userId, role: normalizeRole(role) }, secret, {
		expiresIn: TOKEN_EXPIRES_IN,
	});
};

const toUserResponse = (user) => ({
	id: user._id.toString(),
	name: user.name,
	email: user.email,
	phone: user.phone,
	role: normalizeRole(user.role),
});

const register = async ({ name, email, phone, password }) => {
	const existing = await userRepository.findByEmail(email);
	if (existing) {
		throw new ConflictError('Email đã được sử dụng');
	}
	try {
		const user = await userRepository.createUser({
			name,
			email,
			phone,
			password,
		});
		const token = signToken(user._id.toString(), normalizeRole(user.role));
		return { user: toUserResponse(user), token };
	} catch (error) {
		if (error.code === 11000) {
			throw new ConflictError('Email đã được sử dụng');
		}
		throw error;
	}
};

const login = async ({ email, password }) => {
	const user = await userRepository.findByEmail(email, { withPassword: true });
	if (!user) {
		throw new UnauthorizedError('Email hoặc mật khẩu không đúng');
	}
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new UnauthorizedError('Email hoặc mật khẩu không đúng');
	}
	const token = signToken(user._id.toString(), normalizeRole(user.role));
	return { user: toUserResponse(user), token };
};

const getMe = async (userId) => {
	const user = await userRepository.findById(userId);
	if (!user) {
		throw new UnauthorizedError('Phiên đăng nhập không hợp lệ');
	}
	return toUserResponse(user);
};

module.exports = { register, login, getMe };

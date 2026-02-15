const cloudinary = require('../config/cloudinary');
const userRepository = require('../repositories/userRepository');
const { UnauthorizedError, ValidationError } = require('../errors');

const normalizeRole = (role) => (role === 'admin' ? 'admin' : 'user');

const toUserResponse = (user) => ({
	id: user._id.toString(),
	name: user.name,
	email: user.email,
	phone: user.phone,
	address: user.address || '',
	bio: user.bio || '',
	avatar: user.avatar || null,
	role: normalizeRole(user.role),
});

const sanitizeProfilePayload = (payload) => {
	const name = String(payload.name || '').trim();
	const phone = String(payload.phone || '').trim();
	const address = String(payload.address || '').trim();
	const bio = String(payload.bio || '').trim();

	if (!name) {
		throw new ValidationError('Vui lòng nhập họ tên');
	}

	if (!phone) {
		throw new ValidationError('Vui lòng nhập số điện thoại');
	}

	if (!/^(0|\+84)\d{9,10}$/.test(phone.replace(/\s/g, ''))) {
		throw new ValidationError('Số điện thoại không hợp lệ');
	}

	if (bio.length > 300) {
		throw new ValidationError('Giới thiệu không được vượt quá 300 ký tự');
	}

	return {
		name,
		phone,
		address,
		bio,
	};
};

class UserService {
	async getMe(userId) {
		const user = await userRepository.findById(userId);
		if (!user) {
			throw new UnauthorizedError('Phiên đăng nhập không hợp lệ');
		}

		return toUserResponse(user);
	}

	async updateMe(userId, payload) {
		const updateData = sanitizeProfilePayload(payload);
		const user = await userRepository.updateById(userId, updateData);

		if (!user) {
			throw new UnauthorizedError('Phiên đăng nhập không hợp lệ');
		}

		return toUserResponse(user);
	}

	async uploadAvatar(userId, fileBuffer) {
		const existingUser = await userRepository.findById(userId);
		if (!existingUser) {
			throw new UnauthorizedError('Phiên đăng nhập không hợp lệ');
		}

		const uploadResult = await new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: 'avatars',
					public_id: `user_${userId}`,
					overwrite: true,
					invalidate: true,
					resource_type: 'image',
					allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
				},
				(error, result) => {
					if (error) {
						reject(error);
						return;
					}

					resolve(result);
				},
			);

			uploadStream.end(fileBuffer);
		});

		const user = await userRepository.updateById(userId, {
			avatar: uploadResult.secure_url,
		});

		if (!user) {
			throw new UnauthorizedError('Phiên đăng nhập không hợp lệ');
		}

		return toUserResponse(user);
	}
}

module.exports = new UserService();

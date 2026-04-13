exports.sanitizeUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || null,
    role: user.role,
    account_status: user.account_status,
    profile_image: user.profile_image || null,
    birth_date: user.birth_date || null,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
};

import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Prevent destructive edits to seeded demo users.
 *
 * Seeded accounts (marked `isDemo: true`) are shared across every visitor
 * of the hosted demo. Allowing anyone to change their password, email, or
 * role would break the demo for everyone who follows.
 *
 * Rules:
 *   - Can't modify another demo user's `role`, `email`, or password
 *   - Can't delete a demo user
 *   - Can update cosmetic fields (title, team, status) — those reset on
 *     next seed run anyway.
 *
 * Users that signed up themselves (isDemo = false) have no restrictions.
 */
export async function guardDemoUserEdit(req, _res, next) {
  try {
    const target = await User.findById(req.params.id).lean();
    if (!target) return next(ApiError.notFound('User not found'));

    if (target.isDemo) {
      const locked = ['role', 'email', 'passwordHash', 'password'];
      const touched = Object.keys(req.body || {}).filter((k) => locked.includes(k));
      if (touched.length) {
        return next(ApiError.forbidden(
          `Demo account protected: you can't change ${touched.join(', ')} on seeded users. ` +
          `Create your own account via /signup to test these actions.`,
        ));
      }
    }
    next();
  } catch (e) {
    next(e);
  }
}

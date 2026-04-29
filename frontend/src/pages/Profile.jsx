import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    defaultRole: user?.preferences?.defaultRole || 'Software Engineer',
    defaultDifficulty: user?.preferences?.defaultDifficulty || 'Medium',
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/user/profile', {
        name: profile.name,
        preferences: { defaultRole: profile.defaultRole, defaultDifficulty: profile.defaultDifficulty },
      });
      updateUser({ ...user, name: data.name, preferences: data.preferences });
      toast.success('Profile updated');
    } catch (err) { toast.error('Update failed'); }
  };

  const changePw = async (e) => {
    e.preventDefault();
    try {
      await api.put('/user/password', pw);
      toast.success('Password changed');
      setPw({ currentPassword: '', newPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold mb-6">Your <span className="gradient-text">Profile</span></motion.h1>

      <motion.form onSubmit={saveProfile} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="glass p-6 space-y-4 mb-6">
        <h3 className="font-bold text-lg">Account Info</h3>
        <div>
          <label className="text-sm text-gray-400">Name</label>
          <input className="input mt-1" value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        </div>
        <div>
          <label className="text-sm text-gray-400">Email</label>
          <input className="input mt-1 opacity-60" value={user?.email} disabled />
        </div>
        <div>
          <label className="text-sm text-gray-400">Default Role</label>
          <input className="input mt-1" value={profile.defaultRole}
            onChange={(e) => setProfile({ ...profile, defaultRole: e.target.value })} />
        </div>
        <div>
          <label className="text-sm text-gray-400">Default Difficulty</label>
          <select className="input mt-1" value={profile.defaultDifficulty}
            onChange={(e) => setProfile({ ...profile, defaultDifficulty: e.target.value })}>
            <option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
        </div>
        <button className="btn-primary">Save Changes</button>
      </motion.form>

      <motion.form onSubmit={changePw} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="glass p-6 space-y-4">
        <h3 className="font-bold text-lg">Change Password</h3>
        <input className="input" type="password" placeholder="Current password" required
          value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
        <input className="input" type="password" placeholder="New password (min 6)" required
          value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
        <button className="btn-primary">Update Password</button>
      </motion.form>
    </div>
  );
}
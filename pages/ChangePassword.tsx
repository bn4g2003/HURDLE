/**
 * ChangePassword Page
 * Allows users to change their password
 */

import React, { useState } from 'react';
import { Key, Eye, EyeOff, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../src/hooks/useAuth';
import { StaffService } from '../src/services/staffService';

export const ChangePassword: React.FC = () => {
  const { user, staffData } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const validatePassword = (password: string) => {
    const checks = {
      length: password.length >= 6, // Simplified for demo
    };
    return checks;
  };

  const passwordChecks = validatePassword(formData.newPassword);
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const doPasswordsMatch = formData.newPassword === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !staffData) {
      setMessage({ type: 'error', text: 'Không tìm thấy thông tin người dùng.' });
      return;
    }

    if (!isPasswordValid) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    if (!doPasswordsMatch) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // Check current password
      const currentPassword = (staffData as any).password;
      if (currentPassword !== formData.currentPassword) {
        setMessage({ type: 'error', text: 'Mật khẩu hiện tại không đúng.' });
        setSaving(false);
        return;
      }

      // Update password in Firestore
      await StaffService.updateStaff(user.uid, {
        password: formData.newPassword
      });

      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại sau.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Đổi mật khẩu</h1>
              <p className="text-sm text-gray-500">Cập nhật mật khẩu đăng nhập của bạn</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              {message.text}
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nhập mật khẩu hiện tại"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nhập mật khẩu mới"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Requirements */}
            {formData.newPassword && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-1">
                <p className="text-xs font-medium text-gray-600 mb-2">Yêu cầu mật khẩu:</p>
                <div className={`text-xs flex items-center gap-1 ${passwordChecks.length ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordChecks.length ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                  Ít nhất 6 ký tự
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  formData.confirmPassword && !doPasswordsMatch
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.confirmPassword && !doPasswordsMatch && (
              <p className="text-xs text-red-500 mt-1">Mật khẩu xác nhận không khớp</p>
            )}
          </div>

          {/* Demo Warning */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Lưu ý:</strong> Mật khẩu được lưu dạng văn bản (không mã hóa) - chỉ dùng cho demo.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving || !isPasswordValid || !doPasswordsMatch || !formData.currentPassword}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                Đổi mật khẩu
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

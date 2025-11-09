'use client';

import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Check auth status
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // TODO: Implement login
    return { success: false };
  };

  const logout = async () => {
    // TODO: Implement logout
    setUser(null);
  };

  return { user, loading, login, logout };
}

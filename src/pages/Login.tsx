import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { User, Lock, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'formateur' as 'superadmin' | 'formateur',
  });

  // Rediriger si déjà connecté
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    await login(formData.email, formData.password, formData.role);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl px-8 py-4">
      <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUmh-MslQj4VMEQTfPJBKkdGP5r6jlqJ5oqQq2z6EwQ78RMoj016X7_r-VPLtaP0GvZfk&usqp=CAU' alt="Logo du système de présence" className='mx-auto w-30 h-30 '/>
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-6 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Système de Présence</h1>
          <p className="text-gray-600 mt-2">Connectez-vous à votre compte</p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-danger-600 mr-2" />
            <span className="text-danger-700">{error}</span>
          </div>
        )}

        {/* Formulaire de connexion */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du rôle */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1 py-1">
              Type de compte
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="formateur">Formateur</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>

          {/* Email */}
          <Input
            type="email"
            name="email"
            label="Adresse email"
            value={formData.email}
            onChange={handleInputChange}
            icon={<User />}
            placeholder="votre.email@exemple.com"
            required
          />

          {/* Mot de passe */}
          <Input
            type="password"
            name="password"
            label="Mot de passe"
            value={formData.password}
            onChange={handleInputChange}
            icon={<Lock />}
            placeholder="Votre mot de passe"
            required
          />

          {/* Bouton de connexion */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
};
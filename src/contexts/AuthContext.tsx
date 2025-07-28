import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  usuario: Usuario | null;
  iniciarSesion: (email: string) => void;
  cerrarSesion: () => void;
  estaAutenticado: boolean;
}

interface Usuario {
  email: string;
  nombre?: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('psi-connect-usuario');
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (error) {
        console.error('Error parseando usuario guardado:', error);
        localStorage.removeItem('psi-connect-usuario');
      }
    }
  }, []);

  const iniciarSesion = (email: string) => {
    const nuevoUsuario: Usuario = { email };
    setUsuario(nuevoUsuario);
    localStorage.setItem('psi-connect-usuario', JSON.stringify(nuevoUsuario));
  };

  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem('psi-connect-usuario');
  };

  const estaAutenticado = usuario !== null;

  return (
    <AuthContext.Provider value={{
      usuario,
      iniciarSesion,
      cerrarSesion,
      estaAutenticado
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}; 
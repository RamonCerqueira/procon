import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Shield, ArrowRight, CheckCircle2, Building2, UserCircle2, Lock } from 'lucide-react';
import api from '../../services/api';
import { cn } from '../../utils/cn';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = React.useState('');
  const [userType, setUserType] = useState<'server' | 'citizen'>('server');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "100% Digital",
      description: "Acesse todos os serviços do PROCON sem sair de casa. Mais agilidade e conforto para você."
    },
    {
      title: "Transparência Total",
      description: "Acompanhe seus processos em tempo real e receba notificações a cada atualização."
    },
    {
      title: "Gestão Eficiente",
      description: "Uma nova era na defesa do consumidor com tecnologia de ponta e servidores capacitados."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await api.post('/auth/login', { ...data, type: userType });
      const { user, token } = response.data;
      
      login(user, token);
      
      if (userType === 'citizen') {
        navigate('/citizen/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Credenciais inválidas. Verifique seus dados e tente novamente.');
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Propaganda / Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-blue-900 text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-40"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop")' 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 opacity-90" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          {/* Header Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider">PROCON DIGITAL</h1>
              <p className="text-xs text-blue-200 uppercase tracking-widest">Prefeitura de João Pessoa</p>
            </div>
          </div>

          {/* Carousel Content */}
          <div className="mb-20">
            <div className="h-48 transition-all duration-500 ease-in-out">
              <h2 className="text-4xl font-bold mb-6 leading-tight animate-fade-in">
                {slides[currentSlide].title}
              </h2>
              <p className="text-lg text-blue-100 max-w-md leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </div>
            
            {/* Carousel Indicators */}
            <div className="flex gap-2 mt-8">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    currentSlide === idx ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-sm text-blue-200 flex justify-between items-center border-t border-white/10 pt-8">
            <p>© 2024 Governo Municipal. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Termos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-gray-50">
        <div className="w-full max-w-sm mx-auto">
          
          {/* Mobile Header (Visible only on mobile) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center bg-blue-600 p-3 rounded-xl mb-4 shadow-lg shadow-blue-200">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">PROCON DIGITAL</h1>
            <p className="text-sm text-gray-500">Acesso ao Sistema Integrado</p>
          </div>

          <div className="bg-white p-8 shadow-2xl shadow-gray-200/50 rounded-2xl border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo de volta</h2>
              <p className="text-sm text-gray-500">
                Insira suas credenciais para acessar o painel.
              </p>
            </div>

            {/* User Type Toggle */}
            <div className="bg-gray-100 p-1 rounded-xl flex mb-8">
              <button
                onClick={() => setUserType('server')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                  userType === 'server'
                    ? "bg-white text-blue-700 shadow-sm ring-1 ring-black/5"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <Building2 className="h-4 w-4" />
                Sou Servidor
              </button>
              <button
                onClick={() => setUserType('citizen')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                  userType === 'citizen'
                    ? "bg-white text-blue-700 shadow-sm ring-1 ring-black/5"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <UserCircle2 className="h-4 w-4" />
                Sou Cidadão
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-100 animate-in fade-in slide-in-from-top-2">
                  <div className="flex gap-3">
                    <div className="text-sm text-red-700 font-medium">{error}</div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <Input
                  label={userType === 'server' ? 'Email Corporativo' : 'CPF ou Email'}
                  type="text"
                  placeholder={userType === 'server' ? 'seu.nome@procon.pb.gov.br' : '000.000.000-00'}
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                  className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />

                <div className="relative">
                  <Input
                    label="Senha"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    error={errors.password?.message}
                    {...register('password')}
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  />
                  <div className="absolute right-0 top-0">
                    <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500">
                      Esqueceu a senha?
                    </a>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                isLoading={isSubmitting}
              >
                Entrar como {userType === 'server' ? 'Servidor' : 'Cidadão'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Lock className="h-3 w-3" />
                Ambiente 100% Seguro e Monitorado
              </div>
            </div>
          </div>
          
          {/* Register Link (Only for Citizens) */}
          {userType === 'citizen' && (
            <p className="mt-6 text-center text-sm text-gray-600">
              Ainda não tem cadastro?{' '}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                Criar conta Gov.br
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

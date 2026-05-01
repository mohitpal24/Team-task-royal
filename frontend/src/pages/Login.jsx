import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Hexagon } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-royal-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-royal-800 to-royal-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-royal-gold/10 blur-[150px] rounded-full pointer-events-none animate-pulse"></div>

      <div className="max-w-md w-full space-y-8 glass-card p-10 rounded-2xl z-10 animate-fade-in relative">
        <div className="flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center animate-float">
            <Hexagon className="text-royal-gold w-16 h-16 animate-glow" />
            <span className="absolute z-10 text-royal-900 font-bold font-serif text-xl">TF</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-serif text-white tracking-wide">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-400">Sign in to your royal workspace</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-white/5 border border-white/10 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent sm:text-sm transition-all duration-300"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-white/5 border border-white/10 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent sm:text-sm transition-all duration-300"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg gold-gradient shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:-translate-y-0.5"
            >
              Enter Workspace
            </button>
          </div>
        </form>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-royal-gold hover:text-royal-champagne transition-colors">
              Claim yours
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

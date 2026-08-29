import React from 'react';
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  Users,
  BarChart3,
  AlertTriangle,
  GraduationCap,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Activity,
  Bell,
  LineChart,
  UserCheck,
  Mail,
  MapPin,
  Phone,
  Building2,
  Award,
  Rocket,
  Clock
} from 'lucide-react';

// Import the robot image - you'll need to add this to your assets folder
import RobotMascot from '../assets/studentdrop-ai-robot.png';

const Homepage = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI Prediction Engine',
      description: 'Advanced ML algorithms predict student dropout risk with high accuracy using multiple academic indicators'
    },
    {
      icon: BarChart3,
      title: 'Risk Analytics Dashboard',
      description: 'Real-time visualization of student risk levels, trends, and intervention effectiveness'
    },
    {
      icon: Bell,
      title: 'Early Warning System',
      description: 'Proactive alerts for faculty and counsellors when students show signs of academic struggle'
    }
  ];

  const stats = [
    { value: '95%', label: 'Prediction Accuracy', icon: TrendingUp },
    { value: '10K+', label: 'Students Supported', icon: Users },
    { value: '78%', label: 'Intervention Success', icon: Target },
    { value: '24/7', label: 'Monitoring', icon: Activity }
  ];

  const roles = [
    {
      title: 'For Institutions',
      description: 'Identify at-risk students early and take proactive measures',
      icon: GraduationCap
    },
    {
      title: 'For Faculty',
      description: 'View assigned students, risk profiles, and intervene effectively',
      icon: UserCheck
    },
    {
      title: 'For Counsellors',
      description: 'Focus on high-risk students with targeted intervention programs',
      icon: Users
    }
  ];

  return (
    <div className="pt-12 md:pt-14">
      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center" style={{ backgroundColor: '#F5FBFF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm">
                <Sparkles size={18} style={{ color: '#00A9E0' }} />
                <span className="text-sm font-medium" style={{ color: '#080C68' }}>
                  AI-Powered Dropout Prediction
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight" style={{ color: '#080C68' }}>
                Predict. Prevent.
                <br />
                <span className="block mt-2" style={{ color: '#00A9E0' }}>
                  Empower Every Student
                </span>
              </h1>
              
              <p className="text-lg md:text-xl" style={{ color: '#52617A' }}>
                AI-powered early warning system that identifies at-risk students, 
                provides actionable insights, and enables timely interventions to 
                reduce dropout rates.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-medium text-white transition-all hover:scale-105 shadow-lg"
                  style={{ backgroundColor: '#00A9E0' }}
                >
                  Get Started
                  <ArrowRight size={20} />
                </button>
                <button 
                  className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-medium transition-all hover:shadow-lg border-2"
                  style={{ 
                    color: '#080C68',
                    borderColor: '#080C68',
                    backgroundColor: 'white'
                  }}
                >
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold" style={{ color: '#080C68' }}>
                      {stat.value}
                    </div>
                    <div className="text-sm" style={{ color: '#52617A' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - AI Robot Mascot */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                {/* Glow Effect */}
                <div 
                  className="absolute inset-0 rounded-full opacity-20 blur-3xl"
                  style={{ backgroundColor: '#00A9E0' }}
                ></div>
                
                {/* Robot Image */}
                <div className="relative flex items-center justify-center">
                  <img 
                    src={RobotMascot} 
                    alt="StudentDrop AI Robot Mascot - AI Education Assistant"
                    className="w-full h-auto max-w-md md:max-w-lg lg:max-w-xl object-contain animate-float"
                    style={{ 
                      filter: 'drop-shadow(0 20px 30px rgba(0, 169, 224, 0.2))'
                    }}
                  />
                  
                  {/* Floating Elements */}
                  <div className="absolute top-10 -left-4 animate-float-delayed">
                    <div className="bg-white rounded-full p-3 shadow-lg" style={{ borderColor: '#00A9E0', borderWidth: '2px' }}>
                      <Brain size={24} style={{ color: '#00A9E0' }} />
                    </div>
                  </div>
                  <div className="absolute bottom-10 -right-4 animate-float-delayed-2">
                    <div className="bg-white rounded-full p-3 shadow-lg" style={{ borderColor: '#00A9E0', borderWidth: '2px' }}>
                      <GraduationCap size={24} style={{ color: '#00A9E0' }} />
                    </div>
                  </div>
                  <div className="absolute top-1/2 -right-8 animate-float-delayed-3">
                    <div className="bg-white rounded-full p-2 shadow-lg" style={{ borderColor: '#00A9E0', borderWidth: '2px' }}>
                      <Sparkles size={20} style={{ color: '#00A9E0' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Trust Section */}
      <section className="py-12 md:py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Shield size={28} style={{ color: '#00A9E0' }} />
              </div>
              <h4 className="font-bold" style={{ color: '#080C68' }}>Secure Platform</h4>
              <p className="text-sm" style={{ color: '#52617A' }}>Data privacy first</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <LineChart size={28} style={{ color: '#00A9E0' }} />
              </div>
              <h4 className="font-bold" style={{ color: '#080C68' }}>Real-time Analytics</h4>
              <p className="text-sm" style={{ color: '#52617A' }}>Live student insights</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Users size={28} style={{ color: '#00A9E0' }} />
              </div>
              <h4 className="font-bold" style={{ color: '#080C68' }}>Role-based Access</h4>
              <p className="text-sm" style={{ color: '#52617A' }}>Admin, Faculty, Counsellor</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <TrendingUp size={28} style={{ color: '#00A9E0' }} />
              </div>
              <h4 className="font-bold" style={{ color: '#080C68' }}>Track Improvement</h4>
              <p className="text-sm" style={{ color: '#52617A' }}>Intervention outcomes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24" style={{ backgroundColor: '#EEF9FF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#080C68' }}>
              How <span style={{ color: '#00A9E0' }}>StudentDrop AI</span> Works
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#52617A' }}>
              Complete early warning system from prediction to intervention
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-colors group-hover:scale-110"
                  style={{ backgroundColor: '#DDF5FD' }}
                >
                  <feature.icon size={32} style={{ color: '#00A9E0' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#080C68' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#52617A' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Flow Section inside Features */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center mb-8" style={{ color: '#080C68' }}>
              The <span style={{ color: '#00A9E0' }}>Prediction to Prevention</span> Flow
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { step: '1', title: 'Data Collection', desc: 'Academic records, attendance, engagement metrics' },
                { step: '2', title: 'AI Analysis', desc: 'ML model predicts risk probability & factors' },
                { step: '3', title: 'Alert System', desc: 'Notify faculty & counsellors of at-risk students' },
                { step: '4', title: 'Intervention', desc: 'Track actions & measure improvement' }
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xl transition-all">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4"
                      style={{ backgroundColor: '#00A9E0' }}
                    >
                      {item.step}
                    </div>
                    <h4 className="font-bold text-center mb-2" style={{ color: '#080C68' }}>{item.title}</h4>
                    <p className="text-sm text-center" style={{ color: '#52617A' }}>{item.desc}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                      <ArrowRight size={24} style={{ color: '#00A9E0' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="about" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#080C68' }}>
              Built for <span style={{ color: '#00A9E0' }}>Every Role</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#52617A' }}>
              Tailored dashboards for each stakeholder in the education ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: '#DDF5FD' }}
                >
                  <role.icon size={32} style={{ color: '#00A9E0' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#080C68' }}>{role.title}</h3>
                <p style={{ color: '#52617A' }}>{role.description}</p>
              </div>
            ))}
          </div>

          {/* About Section Content */}
          <div className="mt-16 pt-16 border-t border-gray-200">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6" style={{ color: '#080C68' }}>
                  About <span style={{ color: '#00A9E0' }}>StudentDrop AI</span>
                </h3>
                <p className="text-lg mb-4" style={{ color: '#52617A' }}>
                  StudentDrop AI is a comprehensive early warning system designed to help educational 
                  institutions identify and support at-risk students before they drop out.
                </p>
                <p className="text-lg mb-6" style={{ color: '#52617A' }}>
                  Using advanced machine learning algorithms, we analyze multiple academic indicators 
                  including attendance, GPA, engagement, and performance metrics to provide 
                  actionable insights for faculty and counsellors.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Award size={24} style={{ color: '#00A9E0' }} />
                    <span className="font-medium" style={{ color: '#080C68' }}>Award Winning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Rocket size={24} style={{ color: '#00A9E0' }} />
                    <span className="font-medium" style={{ color: '#080C68' }}>Innovation 2026</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#00A9E0' }}>50+</div>
                  <p className="text-sm" style={{ color: '#52617A' }}>Partner Institutions</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#00A9E0' }}>15K+</div>
                  <p className="text-sm" style={{ color: '#52617A' }}>Students Monitored</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#00A9E0' }}>92%</div>
                  <p className="text-sm" style={{ color: '#52617A' }}>Retention Rate</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#00A9E0' }}>4.8</div>
                  <p className="text-sm" style={{ color: '#52617A' }}>User Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24" style={{ backgroundColor: '#EEF9FF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#080C68' }}>
              Get in <span style={{ color: '#00A9E0' }}>Touch</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#52617A' }}>
              Have questions? We're here to help you prevent student dropouts
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#080C68' }}>
                Send us a Message
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#080C68' }}>
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors"
                    placeholder="Enter your name"
                    style={{ backgroundColor: '#F5FBFF' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#080C68' }}>
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors"
                    placeholder="Enter your email"
                    style={{ backgroundColor: '#F5FBFF' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#080C68' }}>
                    Message
                  </label>
                  <textarea 
                    rows="4"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors"
                    placeholder="How can we help you?"
                    style={{ backgroundColor: '#F5FBFF' }}
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full px-6 py-3 rounded-lg font-medium text-white transition-all hover:scale-105 shadow-md"
                  style={{ backgroundColor: '#00A9E0' }}
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-6" style={{ color: '#080C68' }}>
                  Contact Information
                </h3>
                <p className="text-lg mb-8" style={{ color: '#52617A' }}>
                  Reach out to us through any of the following channels
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#DDF5FD' }}>
                    <Mail size={24} style={{ color: '#00A9E0' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: '#080C68' }}>Email</h4>
                    <p style={{ color: '#52617A' }}>support@studentdropai.com</p>
                    <p style={{ color: '#52617A' }}>info@studentdropai.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#DDF5FD' }}>
                    <Phone size={24} style={{ color: '#00A9E0' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: '#080C68' }}>Phone</h4>
                    <p style={{ color: '#52617A' }}>+1 (555) 123-4567</p>
                    <p style={{ color: '#52617A' }}>Mon-Fri, 9AM - 6PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#DDF5FD' }}>
                    <MapPin size={24} style={{ color: '#00A9E0' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: '#080C68' }}>Address</h4>
                    <p style={{ color: '#52617A' }}>123 Education Tech Park</p>
                    <p style={{ color: '#52617A' }}>Silicon Valley, CA 94025</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#DDF5FD' }}>
                    <Clock size={24} style={{ color: '#00A9E0' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: '#080C68' }}>Working Hours</h4>
                    <p style={{ color: '#52617A' }}>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p style={{ color: '#52617A' }}>Saturday: 10:00 AM - 2:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#080C68' }}>
            Ready to Prevent Dropouts?
          </h2>
          <p className="text-lg mb-8" style={{ color: '#52617A' }}>
            Start identifying at-risk students and making a difference today
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              className="px-8 md:px-12 py-3.5 md:py-4 rounded-lg font-medium text-white text-lg transition-all hover:scale-105 shadow-lg"
              style={{ backgroundColor: '#00A9E0' }}
            >
              Get Started Free
            </button>
            <button 
              className="px-8 md:px-12 py-3.5 md:py-4 rounded-lg font-medium text-lg transition-all border-2"
              style={{ 
                color: '#080C68',
                borderColor: '#080C68'
              }}
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8" style={{ backgroundColor: '#080C68' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold text-white">
                StudentDrop <span style={{ color: '#00A9E0' }}>AI</span>
              </h2>
              <p className="text-white/60 text-sm mt-1">
                AI-Powered Student Dropout Prediction
              </p>
            </div>
            <div className="flex gap-6 text-white/80 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
            <p className="text-white/60 text-sm">
              © 2026 StudentDrop AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
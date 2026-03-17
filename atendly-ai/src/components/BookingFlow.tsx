import { useState } from 'react';
import { Tenant, Service, Professional } from '../types';
import { Calendar, Clock, User, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookingFlowProps {
  tenant: Tenant;
  services: Service[];
  professionals: Professional[];
  onSuccess: () => void;
}

export default function BookingFlow({ tenant, services, professionals, onSuccess }: BookingFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock dates for MVP
  const dates = [
    { label: 'Hoje', value: '2026-02-23' },
    { label: 'Amanhã', value: '2026-02-24' },
    { label: 'Quarta', value: '2026-02-25' },
  ];

  // Mock times for MVP
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  const handleSubmit = async () => {
    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime || !customerName || !customerPhone) return;

    setIsSubmitting(true);
    const startTime = `${selectedDate} ${selectedTime}:00`;

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenant.id,
          professional_id: selectedProfessional.id,
          service_id: selectedService.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          start_time: startTime,
        }),
      });

      if (res.ok) {
        setStep(5);
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao agendar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col">
      {/* Header */}
      <div className="p-6 text-white" style={{ backgroundColor: tenant.theme_color }}>
        <h2 className="text-xl font-bold">{tenant.name}</h2>
        <p className="text-white/80 text-sm">Agendamento Online</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-1">
        <div 
          className="h-full transition-all duration-300 ease-out" 
          style={{ width: `${(step / 5) * 100}%`, backgroundColor: tenant.theme_color }}
        />
      </div>

      <div className="flex-1 p-6 relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Escolha um serviço</h3>
              <div className="space-y-3">
                {services.map(service => (
                  <button
                    key={service.id}
                    onClick={() => { setSelectedService(service); nextStep(); }}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{service.name}</span>
                      <span className="text-sm font-semibold text-gray-900">R$ {service.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-500">{service.duration_minutes} min</span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <button onClick={prevStep} className="text-sm text-gray-500 flex items-center mb-2 hover:text-gray-900">
                <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
              </button>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Escolha um profissional</h3>
              <div className="grid grid-cols-1 gap-3">
                {professionals.map(prof => (
                  <button
                    key={prof.id}
                    onClick={() => { setSelectedProfessional(prof); nextStep(); }}
                    className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{prof.name}</div>
                      <div className="text-xs text-gray-500">{prof.specialty}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <button onClick={prevStep} className="text-sm text-gray-500 flex items-center mb-2 hover:text-gray-900">
                <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
              </button>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Escolha data e horário</h3>
              
              <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                {dates.map(date => (
                  <button
                    key={date.value}
                    onClick={() => setSelectedDate(date.value)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedDate === date.value 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {date.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {times.map(time => (
                  <button
                    key={time}
                    onClick={() => { setSelectedTime(time); nextStep(); }}
                    disabled={!selectedDate}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      !selectedDate 
                        ? 'opacity-50 cursor-not-allowed bg-gray-50 text-gray-300'
                        : 'bg-white border border-gray-200 text-gray-900 hover:border-gray-900'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <button onClick={prevStep} className="text-sm text-gray-500 flex items-center mb-2 hover:text-gray-900">
                <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
              </button>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seus dados</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                  <input 
                    type="text" 
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    placeholder="Ex: Maria Silva"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                  <input 
                    type="tel" 
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Resumo</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Serviço:</span> {selectedService?.name}</p>
                    <p><span className="font-medium">Profissional:</span> {selectedProfessional?.name}</p>
                    <p><span className="font-medium">Data:</span> {selectedDate} às {selectedTime}</p>
                    <p><span className="font-medium">Valor:</span> R$ {selectedService?.price.toFixed(2)}</p>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!customerName || !customerPhone || isSubmitting}
                  className="w-full py-3 rounded-xl font-semibold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: tenant.theme_color }}
                >
                  {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Agendado!</h3>
              <p className="text-gray-600 mb-8">
                Seu horário foi confirmado com sucesso.<br/>
                Enviamos um lembrete para seu WhatsApp.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
              >
                Fazer novo agendamento
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

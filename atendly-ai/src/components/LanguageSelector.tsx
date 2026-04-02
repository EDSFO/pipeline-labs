import { useTranslation } from '../i18n';

export default function LanguageSelector() {
  const { language, setLanguage } = useTranslation();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as 'pt-BR' | 'en')}
      className="bg-transparent text-white/60 hover:text-white text-xs font-mono uppercase tracking-widest px-2 py-1 border border-white/10 hover:border-white/30 rounded transition-all cursor-pointer"
    >
      <option value="pt-BR" className="bg-[#0A0A0A] text-white">PT</option>
      <option value="en" className="bg-[#0A0A0A] text-white">EN</option>
    </select>
  );
}

// Local de Instalação: src/components/ui/InfoCard.jsx
// CÓDIGO COMPLETO E ATUALIZADO (com a prop 'flash')

export default function InfoCard({ title, children, className = "", flash = false }) {
  return (
    <div className={`bg-[#161616] p-6 rounded-2xl border border-zinc-800 shadow-lg ${className} ${flash ? 'realtime-flash-animation' : ''}`}>
      {title && <h3 className="text-xl font-semibold text-white mb-4 pb-4 border-b border-zinc-700">{title}</h3>}
      <div className="space-y-6">
          {children}
      </div>
    </div>
  );
}